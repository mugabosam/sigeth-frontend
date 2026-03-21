import { useState, useMemo } from "react";
import { Search, Loader2, AlertTriangle, Printer, User, Users } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { frontOfficeApi } from "../../services/sigethApi";
import type { RDF, GRC, TEMPO } from "../../types";

/* ── Shared types ──────────────────────────────────────────── */

interface GuestPreviewData {
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

interface GuestInvoiceData extends GuestPreviewData {
  invoice_number: string;
  date: string;
  username: string;
  tax: { total_ttc?: number; htva?: number; tva?: number; taux?: number };
  gen_phone: string;
  gen_tin: string;
  gen_payt_mode: string;
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
  gen_phone: string;
  gen_tin: string;
  gen_payt_mode: string;
}

type Tab = "guest" | "group";

const fmt = (n: number) => new Intl.NumberFormat("en-RW").format(Math.round(n));

/* ── Helper: extract API error message ─────────────────────── */

function extractError(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const resp = (err as { response?: { data?: { detail?: string } } }).response;
    const detail = (resp?.data as Record<string, unknown>)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

/* ── Main component ────────────────────────────────────────── */

export default function InvoicePreview({ initialTab }: { initialTab?: Tab } = {}) {
  const { t } = useLang();
  const { rooms, groupReservations, paymentModes, currencies } = useHotelData();

  const [tab, setTab] = useState<Tab>(initialTab ?? "guest");
  const [searchQuery, setSearchQuery] = useState("");

  // Guest state
  const [gLoading, setGLoading] = useState(false);
  const [gPreview, setGPreview] = useState<GuestPreviewData | null>(null);
  const [gInvoice, setGInvoice] = useState<GuestInvoiceData | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RDF | null>(null);

  // Group state
  const [grpLoading, setGrpLoading] = useState(false);
  const [grpPreview, setGrpPreview] = useState<GroupPreviewData | null>(null);
  const [grpInvoice, setGrpInvoice] = useState<GroupInvoiceData | null>(null);

  // Shared
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genPaytMode, setGenPaytMode] = useState("");
  const [genPhone, setGenPhone] = useState("");
  const [genTin, setGenTin] = useState("");
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* ── Filtered lists ────────────────────────────────────── */

  const occupiedRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const occ = rooms.filter((r) => r.status === "OCC" && r.guest_name);
    if (!q) return occ;
    return occ.filter(
      (r) =>
        r.room_num.toLowerCase().includes(q) ||
        r.guest_name.toLowerCase().includes(q),
    );
  }, [rooms, searchQuery]);

  const activeGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const grps = groupReservations.filter((g) => g.status === 0);
    if (!q) return grps;
    return grps.filter(
      (g) =>
        g.groupe_name.toLowerCase().includes(q) ||
        g.code_g.toLowerCase().includes(q),
    );
  }, [groupReservations, searchQuery]);

  /* ── Guest handlers ────────────────────────────────────── */

  const handleSelectGuest = async (room: RDF) => {
    setGLoading(true);
    setGPreview(null);
    setGInvoice(null);
    setSelectedRoom(room);
    try {
      const data = await frontOfficeApi.previewInvoice({
        room_num: room.room_num,
        guest_name: room.guest_name,
      });
      setGPreview({
        room_num: data.room_num ?? room.room_num,
        guest_name: data.guest_name ?? room.guest_name,
        arrival_date: data.arrival_date ?? "",
        depart_date: data.depart_date ?? "",
        items: data.items,
        total_charges: data.total_charges,
        total_paid: data.total_paid,
        balance_due: data.balance_due,
        current_mon: data.current_mon ?? room.current_mon ?? "RWF",
      });
      if (data.payt_mode) setGenPaytMode(data.payt_mode);
    } catch (err: unknown) {
      setErrorMsg(extractError(err, "Failed to load invoice preview"));
    } finally {
      setGLoading(false);
    }
  };

  const handleGenerateGuest = async () => {
    if (!gPreview) return;
    setGenerating(true);
    try {
      const data = await frontOfficeApi.generateInvoice({
        room_num: gPreview.room_num,
        guest_name: gPreview.guest_name,
        mode_payt: genPaytMode || undefined,
        phone: genPhone.slice(0, 10) || undefined,
        tin: genTin || undefined,
      });
      setGInvoice({
        room_num: data.room_num ?? gPreview.room_num,
        guest_name: data.guest_name ?? gPreview.guest_name,
        arrival_date: data.arrival_date || gPreview.arrival_date,
        depart_date: data.depart_date || gPreview.depart_date,
        items: data.items,
        total_charges: data.total_charges,
        total_paid: data.total_paid,
        balance_due: data.balance_due,
        invoice_number: data.invoice_number ?? "",
        date: data.date ?? "",
        username: data.username ?? "",
        tax: (data.tax as GuestInvoiceData["tax"]) ?? {},
        current_mon: data.current_mon ?? gPreview.current_mon,
        gen_phone: genPhone,
        gen_tin: genTin,
        gen_payt_mode: genPaytMode,
      });
      setShowGenerateModal(false);
      setGenPhone("");
      setGenTin("");
      setGenPaytMode("");
    } catch (err: unknown) {
      setErrorMsg(extractError(err, "Failed to generate invoice"));
    } finally {
      setGenerating(false);
    }
  };

  /* ── Group handlers ────────────────────────────────────── */

  const handleSelectGroup = async (group: GRC) => {
    setGrpLoading(true);
    setGrpPreview(null);
    setGrpInvoice(null);
    try {
      const data = await frontOfficeApi.previewGroupInvoice({
        groupe_name: group.groupe_name,
      });
      setGrpPreview({
        groupe_name: data.groupe_name ?? group.groupe_name,
        code_g: data.code_g ?? group.code_g,
        number_pers: data.number_pers ?? group.number_pers,
        arrival_date: data.arrival_date ?? group.arrival_date,
        depart_date: data.depart_date ?? group.depart_date,
        items: data.items,
        total_charges: data.total_charges,
        group_deposit: data.group_deposit ?? 0,
        total_paid: data.total_paid,
        balance_due: data.balance_due,
        current_mon: data.current_mon ?? group.current_mon ?? "RWF",
      });
      if (data.payt_mode) setGenPaytMode(data.payt_mode);
    } catch (err: unknown) {
      setErrorMsg(extractError(err, "Failed to load group invoice preview"));
    } finally {
      setGrpLoading(false);
    }
  };

  const handleGenerateGroup = async () => {
    if (!grpPreview) return;
    setGenerating(true);
    try {
      const data = await frontOfficeApi.generateGroupInvoice({
        groupe_name: grpPreview.groupe_name,
        mode_payt: genPaytMode || undefined,
        phone: genPhone.slice(0, 10) || undefined,
        tin: genTin || undefined,
      });
      setGrpInvoice({
        groupe_name: data.groupe_name ?? grpPreview.groupe_name,
        code_g: data.code_g ?? grpPreview.code_g,
        number_pers: data.number_pers ?? grpPreview.number_pers,
        arrival_date: data.arrival_date || grpPreview.arrival_date,
        depart_date: data.depart_date || grpPreview.depart_date,
        items: data.items,
        total_charges: data.total_charges,
        group_deposit: data.group_deposit ?? grpPreview.group_deposit,
        total_paid: data.total_paid,
        balance_due: data.balance_due,
        invoice_number: data.invoice_number ?? "",
        date: data.date ?? "",
        username: data.username ?? "",
        tax: (data.tax as GroupInvoiceData["tax"]) ?? {},
        current_mon: data.current_mon ?? grpPreview.current_mon,
        gen_phone: genPhone,
        gen_tin: genTin,
        gen_payt_mode: genPaytMode,
      });
      setShowGenerateModal(false);
      setGenPhone("");
      setGenTin("");
      setGenPaytMode("");
    } catch (err: unknown) {
      setErrorMsg(extractError(err, "Failed to generate group invoice"));
    } finally {
      setGenerating(false);
    }
  };

  /* ── Currency conversion ───────────────────────────────── */

  /** Convert TEMPO items to RWF for display.
   *  For room charges: uses the room's base RWF price (price_1/price_2)
   *  to avoid rounding errors from the foreign→RWF round-trip.
   *  For non-room items (laundry, banquet): already in RWF, left as-is.
   *  For deposits (debit): converted via exchange rate. */
  function convertItems(items: TEMPO[], mon: string, room?: RDF | null) {
    if (!mon || mon === "RWF") return { items, mon: "RWF" };
    const rate = currencies.find((c) => c.code === mon)?.exchange_rate || 1;
    const converted = items.map((item) => {
      const c = { ...item };
      if (item.designation.startsWith("Room ")) {
        // Use room base price for exact RWF conversion (no rounding loss)
        const itemRoom = room ?? rooms.find((r) => r.room_num === item.room_num);
        if (itemRoom) {
          const rwfPuv = itemRoom.twin_num > 1 ? itemRoom.price_2 : itemRoom.price_1;
          c.puv = rwfPuv;
          c.credit = rwfPuv * item.qty;
        } else {
          // Fallback: multiply by rate (may have small rounding error)
          c.puv = Math.round(item.puv * rate);
          c.credit = Math.round(item.credit * rate);
        }
      }
      if (item.debit > 0) c.debit = Math.round(item.debit * rate);
      return c;
    });
    return { items: converted, mon: "RWF" };
  }

  // Guest display data
  const gRaw = gInvoice ?? gPreview;
  const gDisplay = useMemo(() => {
    if (!gRaw) return null;
    const { items, mon } = convertItems(gRaw.items, gRaw.current_mon, selectedRoom);
    const total_charges = items.reduce((s, i) => s + i.credit, 0);
    const total_paid = items.reduce((s, i) => s + i.debit, 0);
    const balance_due = total_charges - total_paid;
    let tax = (gRaw as GuestInvoiceData).tax;
    if (tax?.taux != null) {
      const htva = Math.round(total_charges / (1 + tax.taux / 100));
      tax = { ...tax, htva, tva: total_charges - htva, total_ttc: total_charges };
    }
    return { ...gRaw, items, total_charges, total_paid, balance_due, current_mon: mon, ...(tax ? { tax } : {}) };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gRaw, currencies, selectedRoom]);

  // Group display data
  const grpRaw = grpInvoice ?? grpPreview;
  const grpDisplay = useMemo(() => {
    if (!grpRaw) return null;
    const { items, mon } = convertItems(grpRaw.items, grpRaw.current_mon);
    const total_charges = items.reduce((s, i) => s + i.credit, 0);
    const total_paid = items.reduce((s, i) => s + i.debit, 0);
    const balance_due = total_charges - total_paid;
    const rate = currencies.find((c) => c.code === grpRaw.current_mon)?.exchange_rate || 1;
    const group_deposit = grpRaw.current_mon !== "RWF" && grpRaw.group_deposit
      ? Math.round(grpRaw.group_deposit * rate)
      : grpRaw.group_deposit;
    let tax = (grpRaw as GroupInvoiceData).tax;
    if (tax?.taux != null) {
      const htva = Math.round(total_charges / (1 + tax.taux / 100));
      tax = { ...tax, htva, tva: total_charges - htva, total_ttc: total_charges };
    }
    return { ...grpRaw, items, total_charges, total_paid, balance_due, group_deposit, current_mon: mon, ...(tax ? { tax } : {}) };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grpRaw, currencies, rooms]);

  const loading = tab === "guest" ? gLoading : grpLoading;
  const hasInvoice = tab === "guest" ? !!gInvoice : !!grpInvoice;
  const hasPreview = tab === "guest" ? !!gPreview : !!grpPreview;
  const invoiceObj = tab === "guest" ? gInvoice : grpInvoice;

  const handleGenerate = tab === "guest" ? handleGenerateGuest : handleGenerateGroup;

  const handleTabSwitch = (newTab: Tab) => {
    setTab(newTab);
    setSearchQuery("");
  };

  /* ── Payment label — read from the invoice itself, not shared form state */
  const gPaymentLabel = gInvoice
    ? paymentModes.find((m) => m.code === gInvoice.gen_payt_mode)?.label || gInvoice.gen_payt_mode
    : "";
  const grpPaymentLabel = grpInvoice
    ? paymentModes.find((m) => m.code === grpInvoice.gen_payt_mode)?.label || grpInvoice.gen_payt_mode
    : "";

  /* ── Selected room/group highlight ─────────────────────── */
  const selectedGuestRoom = gPreview?.room_num || gInvoice?.room_num || null;
  const selectedGroupCode = grpPreview?.code_g || grpInvoice?.code_g || null;

  return (
    <div className="flex gap-4 h-full">
      {/* ── LEFT PANEL: Tabs + selector ──────────────────── */}
      <div className="w-72 shrink-0 print:hidden flex flex-col">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded p-1 mb-3">
          <button
            onClick={() => handleTabSwitch("guest")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
              tab === "guest"
                ? "bg-hotel-gold text-white"
                : "text-hotel-text-secondary hover:bg-gray-50"
            }`}
          >
            <User size={14} />
            By Guest
          </button>
          <button
            onClick={() => handleTabSwitch("group")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
              tab === "group"
                ? "bg-hotel-gold text-white"
                : "text-hotel-text-secondary hover:bg-gray-50"
            }`}
          >
            <Users size={14} />
            By Group
          </button>
        </div>

        {/* Search + list */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-hotel-text-secondary" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tab === "guest" ? "Room or guest name..." : "Group name or code..."}
                className="w-full border border-gray-300 rounded pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === "guest" ? (
              occupiedRooms.length === 0 ? (
                <p className="text-xs text-hotel-text-secondary py-6 text-center">No occupied rooms.</p>
              ) : (
                occupiedRooms.map((room) => (
                  <button
                    key={room.room_num}
                    onClick={() => handleSelectGuest(room)}
                    className={`w-full text-left px-3 py-2 text-xs border-b border-gray-100 last:border-b-0 transition-colors ${
                      selectedGuestRoom === room.room_num
                        ? "bg-hotel-gold/10 border-l-2 border-l-hotel-gold"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-hotel-text-primary">{room.room_num}</p>
                        <p className="text-[11px] text-hotel-text-secondary truncate">{room.guest_name}</p>
                      </div>
                      <div className="text-right text-[10px] text-hotel-text-secondary shrink-0">
                        <p>{room.arrival_date}</p>
                        <p>{room.depart_date}</p>
                      </div>
                    </div>
                  </button>
                ))
              )
            ) : activeGroups.length === 0 ? (
              <p className="text-xs text-hotel-text-secondary py-6 text-center">No active groups.</p>
            ) : (
              activeGroups.map((group) => (
                <button
                  key={group.id ?? group.code_g}
                  onClick={() => handleSelectGroup(group)}
                  className={`w-full text-left px-3 py-2 text-xs border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedGroupCode === group.code_g
                      ? "bg-hotel-gold/10 border-l-2 border-l-hotel-gold"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-hotel-text-primary">{group.groupe_name}</p>
                      <p className="text-[10px] text-hotel-text-secondary">
                        {group.code_g} — {group.number_pers} pers.
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-hotel-text-secondary shrink-0">
                      <p>{group.arrival_date}</p>
                      <p>{group.depart_date}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Invoice document ────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-hotel-gold" size={28} />
            <span className="ml-3 text-sm text-hotel-text-secondary">Loading...</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && tab === "guest" && !gDisplay && (
          <div className="flex items-center justify-center py-20 text-sm text-hotel-text-secondary">
            Select an occupied room to preview the invoice.
          </div>
        )}
        {!loading && tab === "group" && !grpDisplay && (
          <div className="flex items-center justify-center py-20 text-sm text-hotel-text-secondary">
            Select a group to preview the invoice.
          </div>
        )}

        {/* ── GUEST INVOICE DOCUMENT ──────────────────────── */}
        {tab === "guest" && gDisplay && gDisplay.items.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <div
              id="invoice-doc"
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-8"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {/* PME Header + Title */}
              <div className="flex items-start justify-between mb-6">
                <div className="text-xs text-hotel-text-secondary space-y-0.5">
                  <p className="text-base font-bold text-hotel-text-primary" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    SIGETH Hotel
                  </p>
                  <p>Kigali, Rwanda</p>
                  <p>+250 788 000 000</p>
                  <p>info@sigeth.com</p>
                  <p>TIN: 000000000</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-hotel-text-primary">
                    {gInvoice ? "DEFINITIVE INVOICE" : "INVOICE PREVIEW"}
                  </p>
                </div>
              </div>

              {/* Guest info block — right-aligned */}
              <div className="flex justify-end mb-6 pb-6 border-b border-gray-200">
                <div className="text-xs space-y-1 w-64">
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">Room:</span>
                    <span className="font-semibold text-hotel-text-primary">{gDisplay.room_num}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">Guest:</span>
                    <span className="font-semibold text-hotel-text-primary">{gDisplay.guest_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">Phone:</span>
                    <span className="text-hotel-text-primary">{gInvoice?.gen_phone || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">Currency:</span>
                    <span className="text-hotel-text-primary">{gDisplay.current_mon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">Invoice No:</span>
                    <span className="font-mono font-semibold text-hotel-text-primary">
                      {gInvoice ? gInvoice.invoice_number : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">TIN:</span>
                    <span className="text-hotel-text-primary">{gInvoice?.gen_tin || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Line items table */}
              <table className="w-full text-xs mb-6">
                <thead>
                  <tr className="border-b-2 border-gray-300 text-[11px] text-hotel-text-secondary">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Room</th>
                    <th className="text-left py-2 font-medium">Designation</th>
                    <th className="text-left py-2 font-medium">Unity</th>
                    <th className="text-right py-2 font-medium">Qty</th>
                    <th className="text-right py-2 font-medium">PUV</th>
                    <th className="text-right py-2 font-medium">Credit</th>
                    <th className="text-right py-2 font-medium">Debit</th>
                  </tr>
                </thead>
                <tbody>
                  {gDisplay.items.map((item, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                      <td className="py-1.5 font-mono text-hotel-text-secondary">{item.date}</td>
                      <td className="py-1.5 font-semibold text-hotel-text-primary">{item.room_num}</td>
                      <td className="py-1.5 text-hotel-text-primary">{item.designation}</td>
                      <td className="py-1.5 text-hotel-text-secondary">{item.unity}</td>
                      <td className="py-1.5 text-right">{item.qty}</td>
                      <td className="py-1.5 text-right text-hotel-text-secondary">{fmt(item.puv)}</td>
                      <td className="py-1.5 text-right font-semibold text-hotel-text-primary">{fmt(item.credit)}</td>
                      <td className="py-1.5 text-right font-semibold text-hotel-gold">{item.debit > 0 ? fmt(item.debit) : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t-2 border-gray-300 pt-4 mb-4">
                <div className="flex flex-col items-end gap-1 text-xs">
                  <div className="flex justify-between w-60">
                    <span className="text-hotel-text-secondary">Total Charges:</span>
                    <span className="font-semibold">{fmt(gDisplay.total_charges)} {gDisplay.current_mon}</span>
                  </div>
                  {gDisplay.total_paid > 0 && (
                    <div className="flex justify-between w-60">
                      <span className="text-hotel-text-secondary">Deposit Paid:</span>
                      <span className="font-semibold text-green-600">-{fmt(gDisplay.total_paid)} {gDisplay.current_mon}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-60 pt-1.5 mt-1 border-t border-gray-300">
                    <span className="font-bold text-hotel-text-primary">BALANCE DUE:</span>
                    <span className="font-bold text-hotel-text-primary">{fmt(gDisplay.balance_due)} {gDisplay.current_mon}</span>
                  </div>
                </div>
              </div>

              {/* Tax breakdown — only after generation */}
              {gInvoice && (gDisplay as GuestInvoiceData).tax?.taux != null && (
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <div className="flex justify-between w-60">
                      <span className="text-hotel-text-secondary">Total TTC:</span>
                      <span className="font-semibold">{fmt((gDisplay as GuestInvoiceData).tax?.total_ttc ?? 0)} {gDisplay.current_mon}</span>
                    </div>
                    <div className="flex justify-between w-60">
                      <span className="text-hotel-text-secondary">HTVA:</span>
                      <span>{fmt((gDisplay as GuestInvoiceData).tax?.htva ?? 0)} {gDisplay.current_mon}</span>
                    </div>
                    <div className="flex justify-between w-60">
                      <span className="text-hotel-text-secondary">TVA ({(gDisplay as GuestInvoiceData).tax?.taux}%):</span>
                      <span>{fmt((gDisplay as GuestInvoiceData).tax?.tva ?? 0)} {gDisplay.current_mon}</span>
                    </div>
                    {gPaymentLabel && (
                      <div className="flex justify-between w-60 mt-1">
                        <span className="text-hotel-text-secondary">Payment:</span>
                        <span className="font-medium">{gPaymentLabel}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4 flex items-end justify-between text-xs text-hotel-text-secondary">
                <div className="space-y-4">
                  <p className="font-semibold text-hotel-text-primary">Company Signature</p>
                  <span className="inline-block border-b border-gray-400 w-36" />
                  {gInvoice && <p>Username: {gInvoice.username}</p>}
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  {!gInvoice && gPreview && (
                    <button
                      onClick={() => setShowGenerateModal(true)}
                      className="bg-hotel-gold text-white px-5 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
                    >
                      Generate Invoice
                    </button>
                  )}
                  {gInvoice && (
                    <button
                      onClick={() => window.print()}
                      className="bg-hotel-gold text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors flex items-center gap-2"
                    >
                      <Printer size={14} />
                      Print
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No items for guest */}
        {tab === "guest" && gDisplay && gDisplay.items.length === 0 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-8 text-center">
              <p className="text-sm text-hotel-text-secondary">No charges found for this guest.</p>
            </div>
          </div>
        )}

        {/* ── GROUP INVOICE DOCUMENT ──────────────────────── */}
        {tab === "group" && grpDisplay && grpDisplay.items.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div
              id="invoice-doc"
              className="bg-white border border-gray-200 shadow-sm rounded-lg p-8"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {/* PME Header + Title */}
              <div className="flex items-start justify-between mb-6">
                <div className="text-xs text-hotel-text-secondary space-y-0.5">
                  <p className="text-base font-bold text-hotel-text-primary" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    SIGETH Hotel
                  </p>
                  <p>Kigali, Rwanda</p>
                  <p>+250 788 000 000</p>
                  <p>info@sigeth.com</p>
                  <p>TIN: 000000000</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-hotel-text-primary">
                    {grpInvoice ? "DEFINITIVE INVOICE — GROUP" : "GROUP INVOICE PREVIEW"}
                  </p>
                </div>
              </div>

              {/* Group info block — right-aligned */}
              <div className="flex justify-end mb-6 pb-6 border-b border-gray-200">
                <div className="text-xs space-y-1 w-64">
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">Group:</span>
                    <span className="font-semibold text-hotel-text-primary">{grpDisplay.groupe_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">Code:</span>
                    <span className="font-semibold text-hotel-text-primary">{grpDisplay.code_g}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">Persons:</span>
                    <span className="text-hotel-text-primary">{grpDisplay.number_pers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">Phone:</span>
                    <span className="text-hotel-text-primary">{grpInvoice?.gen_phone || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">Currency:</span>
                    <span className="text-hotel-text-primary">{grpDisplay.current_mon}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">Invoice No:</span>
                    <span className="font-mono font-semibold text-hotel-text-primary">
                      {grpInvoice ? grpInvoice.invoice_number : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-hotel-text-secondary">TIN:</span>
                    <span className="text-hotel-text-primary">{grpInvoice?.gen_tin || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Line items table — includes guest_name column */}
              <table className="w-full text-xs mb-6">
                <thead>
                  <tr className="border-b-2 border-gray-300 text-[11px] text-hotel-text-secondary">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Room</th>
                    <th className="text-left py-2 font-medium">Guest</th>
                    <th className="text-left py-2 font-medium">Designation</th>
                    <th className="text-right py-2 font-medium">Qty</th>
                    <th className="text-left py-2 font-medium">Unity</th>
                    <th className="text-right py-2 font-medium">PUV</th>
                    <th className="text-right py-2 font-medium">Credit</th>
                    <th className="text-right py-2 font-medium">Debit</th>
                  </tr>
                </thead>
                <tbody>
                  {grpDisplay.items.map((item, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                      <td className="py-1.5 font-mono text-hotel-text-secondary">{item.date}</td>
                      <td className="py-1.5 font-semibold text-hotel-text-primary">{item.room_num}</td>
                      <td className="py-1.5 text-hotel-text-primary">{item.guest_name}</td>
                      <td className="py-1.5 text-hotel-text-primary">{item.designation}</td>
                      <td className="py-1.5 text-right">{item.qty}</td>
                      <td className="py-1.5 text-hotel-text-secondary">{item.unity}</td>
                      <td className="py-1.5 text-right text-hotel-text-secondary">{fmt(item.puv)}</td>
                      <td className="py-1.5 text-right font-semibold text-hotel-text-primary">{fmt(item.credit)}</td>
                      <td className="py-1.5 text-right font-semibold text-hotel-gold">{item.debit > 0 ? fmt(item.debit) : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t-2 border-gray-300 pt-4 mb-4">
                <div className="flex flex-col items-end gap-1 text-xs">
                  <div className="flex justify-between w-60">
                    <span className="text-hotel-text-secondary">Total Charges:</span>
                    <span className="font-semibold">{fmt(grpDisplay.total_charges)} {grpDisplay.current_mon}</span>
                  </div>
                  {grpDisplay.group_deposit > 0 && (
                    <div className="flex justify-between w-60">
                      <span className="text-hotel-text-secondary">Group Deposit:</span>
                      <span className="font-semibold text-green-600">-{fmt(grpDisplay.group_deposit)} {grpDisplay.current_mon}</span>
                    </div>
                  )}
                  {grpDisplay.total_paid > 0 && grpDisplay.total_paid !== grpDisplay.group_deposit && (
                    <div className="flex justify-between w-60">
                      <span className="text-hotel-text-secondary">Total Paid:</span>
                      <span className="font-semibold text-green-600">-{fmt(grpDisplay.total_paid)} {grpDisplay.current_mon}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-60 pt-1.5 mt-1 border-t border-gray-300">
                    <span className="font-bold text-hotel-text-primary">BALANCE DUE:</span>
                    <span className="font-bold text-hotel-text-primary">{fmt(grpDisplay.balance_due)} {grpDisplay.current_mon}</span>
                  </div>
                </div>
              </div>

              {/* Tax breakdown — only after generation */}
              {grpInvoice && (grpDisplay as GroupInvoiceData).tax?.taux != null && (
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <div className="flex justify-between w-60">
                      <span className="text-hotel-text-secondary">Total TTC:</span>
                      <span className="font-semibold">{fmt((grpDisplay as GroupInvoiceData).tax?.total_ttc ?? 0)} {grpDisplay.current_mon}</span>
                    </div>
                    <div className="flex justify-between w-60">
                      <span className="text-hotel-text-secondary">HTVA:</span>
                      <span>{fmt((grpDisplay as GroupInvoiceData).tax?.htva ?? 0)} {grpDisplay.current_mon}</span>
                    </div>
                    <div className="flex justify-between w-60">
                      <span className="text-hotel-text-secondary">TVA ({(grpDisplay as GroupInvoiceData).tax?.taux}%):</span>
                      <span>{fmt((grpDisplay as GroupInvoiceData).tax?.tva ?? 0)} {grpDisplay.current_mon}</span>
                    </div>
                    {grpPaymentLabel && (
                      <div className="flex justify-between w-60 mt-1">
                        <span className="text-hotel-text-secondary">Payment:</span>
                        <span className="font-medium">{grpPaymentLabel}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4 flex items-end justify-between text-xs text-hotel-text-secondary">
                <div className="space-y-4">
                  <p className="font-semibold text-hotel-text-primary">Company Name Signature</p>
                  <span className="inline-block border-b border-gray-400 w-36" />
                  {grpInvoice && <p>Username: {grpInvoice.username}</p>}
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  {!grpInvoice && grpPreview && (
                    <button
                      onClick={() => setShowGenerateModal(true)}
                      className="bg-hotel-gold text-white px-5 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
                    >
                      Generate Invoice
                    </button>
                  )}
                  {grpInvoice && (
                    <button
                      onClick={() => window.print()}
                      className="bg-hotel-gold text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors flex items-center gap-2"
                    >
                      <Printer size={14} />
                      Print
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No items for group */}
        {tab === "group" && grpDisplay && grpDisplay.items.length === 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-8 text-center">
              <p className="text-sm text-hotel-text-secondary">No charges found for this group.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── GENERATE INVOICE MODAL ───────────────────────── */}
      {showGenerateModal && (hasPreview && !hasInvoice) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-base font-semibold text-hotel-text-primary mb-1">
              Generate {tab === "group" ? "Group " : ""}Invoice
            </h3>
            <p className="text-sm text-hotel-text-secondary mb-5">
              {tab === "guest"
                ? `${gPreview!.guest_name} — Room ${gPreview!.room_num}`
                : `${grpPreview!.groupe_name} (${grpPreview!.code_g})`}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                  {t("paymentMode")}
                </label>
                <select
                  value={genPaytMode}
                  onChange={(e) => setGenPaytMode(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
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
                  onChange={(e) => setGenPhone(e.target.value.slice(0, 10))}
                  placeholder="0788000000"
                  maxLength={10}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
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
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 bg-hotel-gold text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating && <Loader2 className="animate-spin" size={14} />}
                Generate
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ERROR DIALOG ─────────────────────────────────── */}
      {errorMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-full">
                <AlertTriangle className="text-red-500" size={20} />
              </div>
              <h3 className="text-base font-semibold text-hotel-text-primary">Error</h3>
            </div>
            <p className="text-sm text-hotel-text-secondary mb-6">{errorMsg}</p>
            <button
              onClick={() => setErrorMsg("")}
              className="w-full bg-hotel-gold text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-doc, #invoice-doc * { visibility: visible !important; }
          #invoice-doc {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
