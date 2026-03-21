/**
 * CheckOut.tsx — Guest Check-Out Page
 *
 * Full checkout flow per programming dossier (section 11114 / Table 7 / Table 9):
 *   Select → Preview Invoice → Generate Invoice → Checkout → Confirmation
 *
 * Two tabs: Individual (guest) and Group checkout.
 */
import { useState, useMemo } from "react";
import {
  Search,
  LogOut,
  Users,
  User,
  Loader2,
  Printer,
  Receipt,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { frontOfficeApi, housekeepingApi } from "../../services/sigethApi";
import type { RDF, GRC, TEMPO } from "../../types";

type Tab = "individual" | "group";
type Step = "select" | "preview" | "invoice" | "checkout-confirm" | "done";

interface PreviewData {
  room_num: string;
  guest_name: string;
  arrival_date: string;
  depart_date: string;
  items: TEMPO[];
  total_charges: number;
  total_paid: number;
  balance_due: number;
  current_mon: string;
}

interface InvoiceData extends PreviewData {
  invoice_number: string;
  date: string;
  username: string;
  tax: { total_ttc?: number; htva?: number; tva?: number; taux?: number };
}

interface GroupPreviewData {
  groupe_name: string;
  code_g: string;
  number_pers: number;
  arrival_date: string;
  depart_date: string;
  items: TEMPO[];
  total_charges: number;
  group_deposit: number;
  total_paid: number;
  balance_due: number;
  current_mon: string;
}

interface GroupInvoiceData extends GroupPreviewData {
  invoice_number: string;
  date: string;
  username: string;
  tax: { total_ttc?: number; htva?: number; tva?: number; taux?: number };
}

const fmt = (n: number) => new Intl.NumberFormat("en-RW").format(Math.round(n));

function extractError(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const resp = (err as { response?: { data?: Record<string, unknown> } })
      .response;
    if (resp?.data?.detail) return String(resp.data.detail);
  }
  return fallback;
}

export default function CheckOut() {
  const { t } = useLang();
  const {
    rooms,
    setRooms,
    reservations,
    setReservations,
    setReservationArchive,
    groupReservations,
    setGroupReservations,
    setGroupArchive,
    paymentModes,
    setJlaundry,
  } = useHotelData();

  const [tab, setTab] = useState<Tab>("individual");
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<Step>("select");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Individual state
  const [selectedRoom, setSelectedRoom] = useState<RDF | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  // Group state
  const [selectedGroup, setSelectedGroup] = useState<GRC | null>(null);
  const [groupPreview, setGroupPreview] = useState<GroupPreviewData | null>(
    null,
  );
  const [groupInvoice, setGroupInvoice] = useState<GroupInvoiceData | null>(
    null,
  );

  // Generate form
  const [genPaytMode, setGenPaytMode] = useState("");
  const [genPhone, setGenPhone] = useState("");
  const [genTin, setGenTin] = useState("");
  const [showGenModal, setShowGenModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Done state
  const [doneMsg, setDoneMsg] = useState("");

  // ── Filtered lists ──
  const occupiedRooms = useMemo(() => {
    const q = search.toLowerCase();
    return rooms.filter(
      (r) =>
        r.status === "OCC" &&
        r.guest_name &&
        (r.room_num.toLowerCase().includes(q) ||
          r.guest_name.toLowerCase().includes(q)),
    );
  }, [rooms, search]);

  const activeGroups = useMemo(() => {
    const q = search.toLowerCase();
    return groupReservations.filter(
      (g) =>
        g.status === 0 &&
        (g.groupe_name.toLowerCase().includes(q) ||
          g.code_g.toLowerCase().includes(q)),
    );
  }, [groupReservations, search]);

  // ── Reset to selection ──
  const resetFlow = () => {
    setStep("select");
    setSelectedRoom(null);
    setSelectedGroup(null);
    setPreview(null);
    setInvoice(null);
    setGroupPreview(null);
    setGroupInvoice(null);
    setGenPaytMode("");
    setGenPhone("");
    setGenTin("");
    setShowGenModal(false);
    setDoneMsg("");
  };

  // ═══════════════════════════════════════════════
  //  INDIVIDUAL CHECKOUT FLOW
  // ═══════════════════════════════════════════════

  // Step 1 → 2: Select guest → Preview invoice
  const handleSelectGuest = async (room: RDF) => {
    setSelectedRoom(room);
    setLoading(true);
    try {
      const data = await frontOfficeApi.previewInvoice({
        room_num: room.room_num,
        guest_name: room.guest_name,
      });
      // RCS (reservation) is the source of truth for currency
      const rcs = reservations.find(
        (r) => r.room_num === room.room_num && r.guest_name === room.guest_name,
      );
      const currency = data.current_mon && data.current_mon !== "RWF"
        ? data.current_mon
        : rcs?.current_mon || data.current_mon || room.current_mon || "RWF";
      setPreview({
        room_num: data.room_num ?? room.room_num,
        guest_name: data.guest_name ?? room.guest_name,
        arrival_date: data.arrival_date ?? room.arrival_date ?? "",
        depart_date: data.depart_date ?? room.depart_date ?? "",
        items: data.items,
        total_charges: data.total_charges,
        total_paid: data.total_paid,
        balance_due: data.balance_due,
        current_mon: currency,
      });
      if (data.payt_mode) setGenPaytMode(data.payt_mode);
      setStep("preview");
    } catch (err) {
      setErrorMsg(extractError(err, "Failed to load invoice preview"));
    } finally {
      setLoading(false);
    }
  };

  // Step 2 → 3: Generate definitive invoice
  const handleGenerateInvoice = async () => {
    if (!preview) return;
    setGenerating(true);
    try {
      const data = await frontOfficeApi.generateInvoice({
        room_num: preview.room_num,
        guest_name: preview.guest_name,
        mode_payt: genPaytMode || undefined,
        phone: genPhone || undefined,
        country_code: "+250",
        tin: genTin || undefined,
      });
      setInvoice({
        room_num: data.room_num ?? preview.room_num,
        guest_name: data.guest_name ?? preview.guest_name,
        arrival_date: data.arrival_date ?? preview.arrival_date,
        depart_date: data.depart_date ?? preview.depart_date,
        items: data.items,
        total_charges: data.total_charges,
        total_paid: data.total_paid,
        balance_due: data.balance_due,
        invoice_number: data.invoice_number ?? "",
        date: data.date ?? "",
        username: data.username ?? "",
        tax: (data.tax as InvoiceData["tax"]) ?? {},
        current_mon: data.current_mon ?? preview.current_mon,
      });
      setShowGenModal(false);
      setStep("invoice");
    } catch (err) {
      setErrorMsg(extractError(err, "Failed to generate invoice"));
    } finally {
      setGenerating(false);
    }
  };

  // Step 3 → 4 → 5: Checkout
  const handleCheckout = async () => {
    if (!selectedRoom) return;
    setLoading(true);
    try {
      const response = await frontOfficeApi.checkout({
        room_num: selectedRoom.room_num,
        guest_name: selectedRoom.guest_name,
      });

      // Update local state
      const archivedRes = reservations.find(
        (r) =>
          r.room_num === selectedRoom.room_num &&
          r.guest_name === selectedRoom.guest_name,
      );
      if (archivedRes) {
        setReservations((prev) =>
          prev.filter((r) => r.id !== archivedRes.id),
        );
        setReservationArchive((prev) => [...prev, { ...response.archive }]);
      }
      setRooms((prev) =>
        prev.map((r) =>
          r.room_num === selectedRoom.room_num
            ? {
                ...r,
                status: "CO" as const,
                guest_name: "",
                twin_name: "",
                twin_num: 0,
                arrival_date: "",
                depart_date: "",
                qty: 0,
                deposit: 0,
              }
            : r,
        ),
      );

      // Refresh laundry data (backend archives laundry records during checkout)
      try {
        const [laundryJournal, laundryArchive] = await Promise.all([
          housekeepingApi.laundryJournal(),
          housekeepingApi.laundryArchive(),
        ]);
        setJlaundry(laundryJournal.concat(laundryArchive));
      } catch { /* laundry refresh is best-effort */ }

      setDoneMsg(
        response.detail ??
          `Guest ${selectedRoom.guest_name} checked out from room ${selectedRoom.room_num}`,
      );
      setStep("done");
    } catch (err) {
      setErrorMsg(extractError(err, "Check-out failed"));
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════
  //  GROUP CHECKOUT FLOW
  // ═══════════════════════════════════════════════

  const handleSelectGroup = async (group: GRC) => {
    setSelectedGroup(group);
    setLoading(true);
    try {
      const data = await frontOfficeApi.previewGroupInvoice({
        groupe_name: group.groupe_name,
      });
      setGroupPreview({
        groupe_name: data.groupe_name ?? group.groupe_name,
        code_g: data.code_g ?? group.code_g,
        number_pers: data.number_pers ?? group.number_pers,
        arrival_date: data.arrival_date ?? group.arrival_date ?? "",
        depart_date: data.depart_date ?? group.depart_date ?? "",
        items: data.items,
        total_charges: data.total_charges,
        group_deposit: data.group_deposit ?? 0,
        total_paid: data.total_paid,
        balance_due: data.balance_due,
        current_mon: data.current_mon ?? group.current_mon ?? "RWF",
      });
      if (data.payt_mode) setGenPaytMode(data.payt_mode);
      setStep("preview");
    } catch (err) {
      setErrorMsg(extractError(err, "Failed to load group invoice preview"));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGroupInvoice = async () => {
    if (!groupPreview) return;
    setGenerating(true);
    try {
      const data = await frontOfficeApi.generateGroupInvoice({
        groupe_name: groupPreview.groupe_name,
        mode_payt: genPaytMode || undefined,
        phone: genPhone || undefined,
        country_code: "+250",
        tin: genTin || undefined,
      });
      setGroupInvoice({
        groupe_name: data.groupe_name ?? groupPreview.groupe_name,
        code_g: data.code_g ?? groupPreview.code_g,
        number_pers: data.number_pers ?? groupPreview.number_pers,
        arrival_date: data.arrival_date ?? groupPreview.arrival_date,
        depart_date: data.depart_date ?? groupPreview.depart_date,
        items: data.items,
        total_charges: data.total_charges,
        group_deposit: data.group_deposit ?? groupPreview.group_deposit,
        total_paid: data.total_paid,
        balance_due: data.balance_due,
        invoice_number: data.invoice_number ?? "",
        date: data.date ?? "",
        username: data.username ?? "",
        tax: (data.tax as GroupInvoiceData["tax"]) ?? {},
        current_mon: data.current_mon ?? groupPreview.current_mon,
      });
      setShowGenModal(false);
      setStep("invoice");
    } catch (err) {
      setErrorMsg(extractError(err, "Failed to generate group invoice"));
    } finally {
      setGenerating(false);
    }
  };

  const handleGroupCheckout = async () => {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      const response = await frontOfficeApi.groupCheckout({
        groupe_name: selectedGroup.groupe_name,
      });

      const archivedGroup = groupReservations.find(
        (g) => g.groupe_name === selectedGroup.groupe_name,
      );
      if (archivedGroup) {
        setGroupReservations((prev) =>
          prev.filter((g) => g.id !== archivedGroup.id),
        );
        setGroupArchive((prev) => [...prev, { ...response.archive }]);
      }
      setReservations((prev) =>
        prev.filter((r) => r.groupe_name !== selectedGroup.groupe_name),
      );
      setRooms((prev) =>
        prev.map((r) =>
          r.groupe_name === selectedGroup.groupe_name
            ? {
                ...r,
                status: "CO" as const,
                guest_name: "",
                twin_name: "",
                twin_num: 0,
                arrival_date: "",
                depart_date: "",
                qty: 0,
                deposit: 0,
                groupe_name: "",
              }
            : r,
        ),
      );

      // Refresh laundry data (backend archives laundry records during checkout)
      try {
        const [laundryJournal, laundryArchive] = await Promise.all([
          housekeepingApi.laundryJournal(),
          housekeepingApi.laundryArchive(),
        ]);
        setJlaundry(laundryJournal.concat(laundryArchive));
      } catch { /* laundry refresh is best-effort */ }

      setDoneMsg(
        response.detail ??
          `Group "${selectedGroup.groupe_name}" checked out successfully`,
      );
      setStep("done");
    } catch (err) {
      setErrorMsg(extractError(err, "Group check-out failed"));
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════
  //  SHARED DISPLAY HELPERS
  // ═══════════════════════════════════════════════

  const indivDisplay = invoice ?? preview;
  const groupDisplay = groupInvoice ?? groupPreview;
  const isIndividual = tab === "individual";

  // Which items to show in the invoice table
  const tableItems: TEMPO[] = isIndividual
    ? (indivDisplay?.items ?? [])
    : (groupDisplay?.items ?? []);

  const calcNights = (arr: string, dep: string) => {
    if (!arr || !dep) return 0;
    return Math.max(
      Math.round(
        (new Date(dep).getTime() - new Date(arr).getTime()) / 86400000,
      ),
      0,
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-hotel-border rounded p-4 p-4 rounded border border-blue-100">
        <div>
          <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
            Check-Out
          </h1>
          {step !== "select" && step !== "done" && (
            <p className="text-sm text-hotel-text-secondary mt-1">
              {step === "preview"
                ? "Step 1: Review invoice preview"
                : "Step 2: Invoice generated — proceed to check out"}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {step !== "select" && (
            <button
              onClick={resetFlow}
              className="px-5 py-2.5 rounded bg-gray-100 text-hotel-text-secondary hover:bg-gray-200 text-sm font-medium"
            >
              Back to List
            </button>
          )}
          {(step === "preview" || step === "invoice") && (
            <button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-colors"
            >
              <Printer size={16} />
              {t("print")}
            </button>
          )}
        </div>
      </div>

      {/* ═══ STEP: SELECT ═══ */}
      {step === "select" && (
        <>
          {/* Tab toggle + search */}
          <div className="bg-white rounded border border-hotel-border p-4">
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  setTab("individual");
                  setSearch("");
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold transition-colors ${
                  tab === "individual"
                    ? "bg-hotel-gold text-white"
                    : "bg-gray-100 text-hotel-text-secondary hover:bg-gray-200"
                }`}
              >
                <User size={16} />
                Individual
              </button>
              <button
                onClick={() => {
                  setTab("group");
                  setSearch("");
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold transition-colors ${
                  tab === "group"
                    ? "bg-hotel-gold text-white"
                    : "bg-gray-100 text-hotel-text-secondary hover:bg-gray-200"
                }`}
              >
                <Users size={16} />
                Group
              </button>
            </div>
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isIndividual
                    ? `${t("search")} ${t("roomNumber")} / ${t("guestName")}...`
                    : `${t("search")} ${t("groupName")} / ${t("groupCode")}...`
                }
                className="w-full pl-12 pr-4 py-3 border border-hotel-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              />
            </div>
          </div>

          {/* Individual room list */}
          {isIndividual && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded border border-red-100">
                <LogOut size={20} className="text-red-600" />
                <h2 className="flex-1 text-base font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Occupied Rooms
                </h2>
                <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">
                  {occupiedRooms.length}
                </span>
              </div>
              {occupiedRooms.length === 0 ? (
                <div className="bg-white rounded border border-dashed border-hotel-border p-4 text-center text-gray-400 text-sm">
                  {search
                    ? `No occupied rooms match "${search}"`
                    : "No occupied rooms to check out"}
                </div>
              ) : (
                occupiedRooms.map((room) => {
                  const nights = calcNights(
                    room.arrival_date,
                    room.depart_date,
                  );
                  // Use reservation currency (RCS) as source of truth, fallback to room (RDF)
                  const rcs = reservations.find(
                    (r) => r.room_num === room.room_num && r.guest_name === room.guest_name,
                  );
                  const currency = rcs?.current_mon || room.current_mon || "RWF";
                  return (
                    <button
                      key={room.room_num}
                      onClick={() => handleSelectGuest(room)}
                      disabled={loading}
                      className="w-full text-left bg-white rounded border border-hotel-border p-5 hover:shadow-lg transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                              {room.guest_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-hotel-text-primary text-base">
                                {room.guest_name}
                              </h3>
                              <p className="text-xs text-hotel-text-secondary">
                                Room {room.room_num} — {room.designation}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm p-3 bg-white rounded">
                            <div>
                              <span className="text-hotel-text-secondary text-xs">
                                {t("arrivalDate")}
                              </span>
                              <p className="font-semibold text-hotel-text-primary">
                                {room.arrival_date}
                              </p>
                            </div>
                            <div>
                              <span className="text-hotel-text-secondary text-xs">
                                {t("departDate")}
                              </span>
                              <p className="font-semibold text-hotel-text-primary">
                                {room.depart_date}
                              </p>
                            </div>
                            <div>
                              <span className="text-hotel-text-secondary text-xs">
                                {t("nights")}
                              </span>
                              <p className="font-semibold text-hotel-text-primary">
                                {nights}
                              </p>
                            </div>
                            <div>
                              <span className="text-hotel-text-secondary text-xs">
                                {t("deposit")}
                              </span>
                              <p className="font-semibold text-hotel-text-primary">
                                {room.deposit.toLocaleString()}{" "}
                                {currency}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 px-4 py-2 rounded flex items-center gap-2 text-sm font-medium shrink-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          <Receipt size={16} />
                          Select
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Group list */}
          {!isIndividual && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded border border-amber-100">
                <Users size={20} className="text-amber-600" />
                <h2 className="flex-1 text-base font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Active Groups
                </h2>
                <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">
                  {activeGroups.length}
                </span>
              </div>
              {activeGroups.length === 0 ? (
                <div className="bg-white rounded border border-dashed border-hotel-border p-4 text-center text-gray-400 text-sm">
                  {search
                    ? `No active groups match "${search}"`
                    : "No active groups to check out"}
                </div>
              ) : (
                activeGroups.map((group) => (
                  <button
                    key={group.id ?? group.code_g}
                    onClick={() => handleSelectGroup(group)}
                    disabled={loading}
                    className="w-full text-left bg-white rounded border border-hotel-border p-5 hover:shadow-lg transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            <Users size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-hotel-text-primary text-base">
                              {group.groupe_name}
                            </h3>
                            <p className="text-xs text-hotel-text-secondary">
                              Code: {group.code_g} — {group.number_pers}{" "}
                              persons
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm p-3 bg-white rounded">
                          <div>
                            <span className="text-hotel-text-secondary text-xs">
                              {t("arrivalDate")}
                            </span>
                            <p className="font-semibold text-hotel-text-primary">
                              {group.arrival_date}
                            </p>
                          </div>
                          <div>
                            <span className="text-hotel-text-secondary text-xs">
                              {t("departDate")}
                            </span>
                            <p className="font-semibold text-hotel-text-primary">
                              {group.depart_date}
                            </p>
                          </div>
                          <div>
                            <span className="text-hotel-text-secondary text-xs">
                              {t("stayCost")}
                            </span>
                            <p className="font-semibold text-hotel-text-primary">
                              {group.stay_cost.toLocaleString()}{" "}
                              {group.current_mon}
                            </p>
                          </div>
                          <div>
                            <span className="text-hotel-text-secondary text-xs">
                              {t("deposit")}
                            </span>
                            <p className="font-semibold text-hotel-text-primary">
                              {group.deposit.toLocaleString()}{" "}
                              {group.current_mon}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 px-4 py-2 rounded flex items-center gap-2 text-sm font-medium shrink-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                        <Receipt size={16} />
                        Select
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <span className="ml-3 text-hotel-text-secondary">Processing...</span>
        </div>
      )}

      {/* ═══ STEP: PREVIEW or INVOICE — Individual ═══ */}
      {(step === "preview" || step === "invoice") &&
        isIndividual &&
        indivDisplay && (
          <div
            id="checkout-invoice"
            className="bg-white text-[10px] leading-tight text-black max-w-[1000px] mx-auto p-4 font-sans rounded border border-hotel-border"
          >
            <div className="mb-4 pb-4 border-b-2 border-hotel-border">
              <p className="text-base font-bold text-hotel-text-primary">
                {invoice ? "Definitive Invoice" : "Invoice Preview"}
              </p>
              {invoice && (
                <p className="text-sm font-mono font-bold text-blue-700 mt-1">
                  {invoice.invoice_number}
                </p>
              )}
              <p className="text-xs text-hotel-text-secondary mt-1">
                {invoice?.date || new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="border-2 border-gray-800 rounded overflow-hidden mb-4">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 flex justify-between items-center text-white">
                <p className="font-bold text-sm">
                  {invoice ? "DEFINITIVE INVOICE" : "Guest Invoice Preview"}
                </p>
                <div className="text-xs space-y-0.5 text-right">
                  <p>
                    <span className="font-semibold">{t("roomNumber")}:</span>{" "}
                    {indivDisplay.room_num}
                  </p>
                  <p>
                    <span className="font-semibold">{t("guestName")}:</span>{" "}
                    {indivDisplay.guest_name}
                  </p>
                  <p>
                    <span className="font-semibold">{t("arrivalDate")}:</span>{" "}
                    {indivDisplay.arrival_date}
                  </p>
                  <p>
                    <span className="font-semibold">{t("departDate")}:</span>{" "}
                    {indivDisplay.depart_date}
                  </p>
                </div>
              </div>

              {/* Items table */}
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-700">
                    {[
                      "Date",
                      "Designation",
                      "Qty",
                      "Unity",
                      "Unit Price",
                      "Amount",
                    ].map((h) => (
                      <th
                        key={h}
                        className="border border-gray-800 px-2 py-2 text-left font-bold text-xs text-white"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableItems.map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-hotel-cream transition-colors border-b border-hotel-border"
                    >
                      <td className="border border-hotel-border px-2 py-2 text-xs font-mono text-hotel-text-primary">
                        {item.date}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-hotel-text-primary">
                        {item.designation}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-center font-semibold">
                        {item.qty}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-hotel-text-primary">
                        {item.unity}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-right font-semibold">
                        {fmt(item.puv)}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-right font-bold text-hotel-text-primary">
                        {fmt(item.credit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-between items-start px-4 py-4 border-t-2 border-gray-800 bg-gradient-to-r from-gray-50 to-white">
                {invoice && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-baseline gap-3">
                      <span className="font-semibold text-hotel-text-primary">
                        Company Signature
                      </span>
                      <span className="border-b-2 border-gray-400 w-24 inline-block" />
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="font-semibold text-hotel-text-primary">
                        Username:
                      </span>
                      <span className="font-bold text-blue-700">
                        {invoice.username}
                      </span>
                    </div>
                  </div>
                )}
                <div className="space-y-2 text-xs ml-auto">
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-semibold text-hotel-text-primary">
                      Total Charges
                    </span>
                    <span className="border-2 border-gray-400 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 w-28 text-right font-bold text-hotel-text-primary">
                      {fmt(indivDisplay.total_charges)} {indivDisplay?.current_mon ?? "RWF"}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-semibold text-hotel-text-primary">
                      Total Paid
                    </span>
                    <span className="border-2 border-gray-400 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 w-28 text-right font-bold text-blue-700">
                      {fmt(indivDisplay.total_paid)} {indivDisplay?.current_mon ?? "RWF"}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-semibold text-hotel-text-primary">
                      Balance Due
                    </span>
                    <span className="border-2 border-gray-400 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-1.5 w-28 text-right font-bold text-red-700">
                      {fmt(indivDisplay.balance_due)} {indivDisplay?.current_mon ?? "RWF"}
                    </span>
                  </div>
                  {invoice?.tax?.taux != null && (
                    <>
                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-hotel-border">
                        <span className="font-semibold text-hotel-text-primary">
                          HTVA
                        </span>
                        <span className="border-2 border-gray-400 px-3 py-1.5 w-28 text-right font-bold text-hotel-text-primary">
                          {fmt(invoice.tax.htva ?? 0)} {invoice?.current_mon ?? "RWF"}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-semibold text-hotel-text-primary">
                          TVA ({invoice.tax.taux}%)
                        </span>
                        <span className="border-2 border-gray-400 px-3 py-1.5 w-28 text-right font-bold text-hotel-text-primary">
                          {fmt(invoice.tax.tva ?? 0)} {invoice?.current_mon ?? "RWF"}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-semibold text-hotel-text-primary">
                          Total TTC
                        </span>
                        <span className="border-2 border-gray-400 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 w-28 text-right font-bold text-green-800">
                          {fmt(invoice.tax.total_ttc ?? 0)} {invoice?.current_mon ?? "RWF"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ═══ STEP: PREVIEW or INVOICE — Group ═══ */}
      {(step === "preview" || step === "invoice") &&
        !isIndividual &&
        groupDisplay && (
          <div
            id="checkout-invoice"
            className="bg-white text-[10px] leading-tight text-black max-w-[1000px] mx-auto p-4 font-sans rounded border border-hotel-border"
          >
            <div className="mb-4 pb-4 border-b-2 border-hotel-border">
              <p className="text-base font-bold text-hotel-text-primary">
                {groupInvoice
                  ? "Definitive Group Invoice"
                  : "Group Invoice Preview"}
              </p>
              {groupInvoice && (
                <p className="text-sm font-mono font-bold text-blue-700 mt-1">
                  {groupInvoice.invoice_number}
                </p>
              )}
              <p className="text-xs text-hotel-text-secondary mt-1">
                {groupDisplay.groupe_name} ({groupDisplay.code_g}) —{" "}
                {groupDisplay.number_pers} persons
              </p>
            </div>

            <div className="border-2 border-gray-800 rounded overflow-hidden mb-4">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 flex justify-between items-center text-white">
                <p className="font-bold text-sm">
                  {groupInvoice ? "GROUP INVOICE" : "GROUP INVOICE PREVIEW"}
                </p>
                <div className="text-xs space-y-0.5 text-right">
                  <p>
                    <span className="font-semibold">Group:</span>{" "}
                    {groupDisplay.groupe_name}
                  </p>
                  <p>
                    <span className="font-semibold">Arrival:</span>{" "}
                    {groupDisplay.arrival_date}
                  </p>
                  <p>
                    <span className="font-semibold">Departure:</span>{" "}
                    {groupDisplay.depart_date}
                  </p>
                </div>
              </div>

              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-700">
                    {[
                      "Date",
                      "Room",
                      "Guest",
                      "Designation",
                      "Qty",
                      "Unity",
                      "Puv",
                      "Credit",
                      "Debit",
                    ].map((h) => (
                      <th
                        key={h}
                        className="border border-gray-800 px-2 py-2 text-left font-bold text-xs text-white"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableItems.map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-hotel-cream transition-colors border-b border-hotel-border"
                    >
                      <td className="border border-hotel-border px-2 py-2 text-xs font-mono text-hotel-text-primary">
                        {item.date}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs font-semibold text-hotel-text-primary">
                        {item.room_num}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-hotel-text-primary">
                        {item.guest_name}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-hotel-text-primary">
                        {item.designation}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-center font-semibold">
                        {item.qty}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-hotel-text-primary">
                        {item.unity}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-right font-semibold">
                        {fmt(item.puv)}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-right font-bold text-hotel-text-primary">
                        {fmt(item.credit)}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-right font-bold text-red-700">
                        {fmt(item.debit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Group totals */}
              <div className="flex justify-between items-start px-4 py-4 border-t-2 border-gray-800 bg-gradient-to-r from-gray-50 to-white">
                {groupInvoice && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-baseline gap-3">
                      <span className="font-semibold text-hotel-text-primary">
                        Company Signature
                      </span>
                      <span className="border-b-2 border-gray-400 w-24 inline-block" />
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="font-semibold text-hotel-text-primary">
                        Username:
                      </span>
                      <span className="font-bold text-blue-700">
                        {groupInvoice.username}
                      </span>
                    </div>
                  </div>
                )}
                <div className="space-y-2 text-xs ml-auto">
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-semibold text-hotel-text-primary">
                      Total Charges
                    </span>
                    <span className="border-2 border-gray-400 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 w-28 text-right font-bold text-hotel-text-primary">
                      {fmt(groupDisplay.total_charges)} {groupDisplay?.current_mon ?? "RWF"}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-semibold text-hotel-text-primary">
                      Group Deposit
                    </span>
                    <span className="border-2 border-gray-400 bg-gradient-to-r from-purple-50 to-violet-50 px-3 py-1.5 w-28 text-right font-bold text-purple-700">
                      {fmt(groupDisplay.group_deposit)} {groupDisplay?.current_mon ?? "RWF"}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-semibold text-hotel-text-primary">
                      Total Paid
                    </span>
                    <span className="border-2 border-gray-400 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 w-28 text-right font-bold text-blue-700">
                      {fmt(groupDisplay.total_paid)} {groupDisplay?.current_mon ?? "RWF"}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-semibold text-hotel-text-primary">
                      Balance Due
                    </span>
                    <span className="border-2 border-gray-400 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-1.5 w-28 text-right font-bold text-red-700">
                      {fmt(groupDisplay.balance_due)} {groupDisplay?.current_mon ?? "RWF"}
                    </span>
                  </div>
                  {groupInvoice?.tax?.taux != null && (
                    <>
                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-hotel-border">
                        <span className="font-semibold text-hotel-text-primary">
                          HTVA
                        </span>
                        <span className="border-2 border-gray-400 px-3 py-1.5 w-28 text-right font-bold text-hotel-text-primary">
                          {fmt(groupInvoice.tax.htva ?? 0)} {groupInvoice?.current_mon ?? "RWF"}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-semibold text-hotel-text-primary">
                          TVA ({groupInvoice.tax.taux}%)
                        </span>
                        <span className="border-2 border-gray-400 px-3 py-1.5 w-28 text-right font-bold text-hotel-text-primary">
                          {fmt(groupInvoice.tax.tva ?? 0)} {groupInvoice?.current_mon ?? "RWF"}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-semibold text-hotel-text-primary">
                          Total TTC
                        </span>
                        <span className="border-2 border-gray-400 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 w-28 text-right font-bold text-green-800">
                          {fmt(groupInvoice.tax.total_ttc ?? 0)} {groupInvoice?.current_mon ?? "RWF"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ═══ ACTION BUTTONS (below invoice) ═══ */}
      {step === "preview" && !loading && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowGenModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-colors"
          >
            <Receipt size={18} />
            Generate Definitive Invoice
          </button>
        </div>
      )}

      {step === "invoice" && !loading && (
        <div className="flex justify-center">
          <button
            onClick={() => setStep("checkout-confirm")}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-colors"
          >
            <LogOut size={18} />
            Proceed to Check-Out
          </button>
        </div>
      )}

      {/* ═══ STEP: CHECKOUT CONFIRM ═══ */}
      {step === "checkout-confirm" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded max-w-sm w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <h2 className="text-base font-bold text-red-900">
                  Confirm Check-Out
                </h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-hotel-text-primary text-sm leading-relaxed">
                {isIndividual
                  ? `Are you sure you want to check out ${selectedRoom?.guest_name} from room ${selectedRoom?.room_num}? This will archive the reservation and release the room.`
                  : `Are you sure you want to check out the entire group "${selectedGroup?.groupe_name}"? This will archive all member reservations and release all rooms.`}
              </p>
              {(isIndividual ? invoice : groupInvoice) && (
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  Invoice{" "}
                  {isIndividual
                    ? invoice?.invoice_number
                    : groupInvoice?.invoice_number}{" "}
                  has been generated.
                </p>
              )}
            </div>
            <div className="px-6 py-4 bg-white flex gap-3 justify-end border-t border-hotel-border">
              <button
                onClick={() => setStep("invoice")}
                disabled={loading}
                className="px-4 py-2 rounded bg-gray-200 text-hotel-text-primary hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={
                  isIndividual ? handleCheckout : handleGroupCheckout
                }
                disabled={loading}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={14} />}
                {loading ? "Checking out..." : "Check-Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STEP: DONE ═══ */}
      {step === "done" && (
        <div className="max-w-lg mx-auto bg-white rounded border border-green-200 p-4 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-hotel-gold" />
          </div>
          <h2 className="text-2xl font-bold text-green-800">
            Check-Out Complete
          </h2>
          <p className="text-sm text-hotel-text-secondary">{doneMsg}</p>
          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-colors"
            >
              <Printer size={16} />
              Print Invoice
            </button>
            <button
              onClick={resetFlow}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded text-sm font-medium hover:shadow-lg transition-colors"
            >
              New Check-Out
            </button>
          </div>
        </div>
      )}

      {/* ═══ GENERATE INVOICE MODAL ═══ */}
      {showGenModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 w-full max-w-md">
            <h3 className="text-base font-semibold text-hotel-text-primary mb-4">
              Generate Definitive Invoice
            </h3>
            <p className="text-sm text-hotel-text-secondary mb-4">
              {isIndividual
                ? `${selectedRoom?.guest_name} — Room ${selectedRoom?.room_num}`
                : `${selectedGroup?.groupe_name} (${selectedGroup?.code_g})`}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                  {t("paymentMode")}
                </label>
                <select
                  value={genPaytMode}
                  onChange={(e) => setGenPaytMode(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="">-- Select --</option>
                  {paymentModes.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  value={genPhone}
                  onChange={(e) => setGenPhone(e.target.value)}
                  placeholder="+250..."
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                  TIN
                </label>
                <input
                  type="text"
                  value={genTin}
                  onChange={(e) => setGenTin(e.target.value)}
                  placeholder="Tax ID"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={
                  isIndividual
                    ? handleGenerateInvoice
                    : handleGenerateGroupInvoice
                }
                disabled={generating}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating && (
                  <Loader2 className="animate-spin" size={14} />
                )}
                Generate
              </button>
              <button
                onClick={() => setShowGenModal(false)}
                className="border px-4 py-2 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ERROR DIALOG ═══ */}
      {errorMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <h3 className="text-base font-semibold text-hotel-text-primary">Error</h3>
            </div>
            <p className="text-sm text-hotel-text-secondary mb-6">{errorMsg}</p>
            <button
              onClick={() => setErrorMsg("")}
              className="w-full bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #checkout-invoice, #checkout-invoice * { visibility: visible !important; }
          #checkout-invoice { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
