import { useMemo, useState } from "react";
import { Printer, Loader2, Receipt, AlertTriangle } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { frontOfficeApi } from "../../services/sigethApi";
import type { GRC, TEMPO } from "../../types";

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

export default function InvoiceByGroup() {
  const { t } = useLang();
  const { groupReservations, paymentModes, currencies } = useHotelData();

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<GroupPreviewData | null>(null);
  const [invoice, setInvoice] = useState<GroupInvoiceData | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genPaytMode, setGenPaytMode] = useState("");
  const [genPhone, setGenPhone] = useState("");
  const [genTin, setGenTin] = useState("");
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const activeGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const groups = groupReservations.filter((g) => g.status === 0);
    if (!q) return groups;
    return groups.filter(
      (g) =>
        g.groupe_name.toLowerCase().includes(q) ||
        g.code_g.toLowerCase().includes(q),
    );
  }, [groupReservations, searchQuery]);

  const handleSelectGroup = async (group: GRC) => {
    setLoading(true);
    setPreview(null);
    setInvoice(null);
    try {
      const data = await frontOfficeApi.previewGroupInvoice({
        groupe_name: group.groupe_name,
      });
      setPreview({
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
      const msg =
        err && typeof err === "object" && "response" in err
          ? String(
              (
                (err as { response?: { data?: { detail?: string } } }).response
                  ?.data as Record<string, unknown>
              )?.detail ?? "Failed to load group invoice preview",
            )
          : "Failed to load group invoice preview";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!preview) return;
    setGenerating(true);
    try {
      const data = await frontOfficeApi.generateGroupInvoice({
        groupe_name: preview.groupe_name,
        mode_payt: genPaytMode || undefined,
        phone: genPhone || undefined,
        country_code: "+250",
        tin: genTin || undefined,
      });
      setInvoice({
        groupe_name: data.groupe_name ?? preview.groupe_name,
        code_g: data.code_g ?? preview.code_g,
        number_pers: data.number_pers ?? preview.number_pers,
        arrival_date: data.arrival_date ?? preview.arrival_date,
        depart_date: data.depart_date ?? preview.depart_date,
        items: data.items,
        total_charges: data.total_charges,
        group_deposit: data.group_deposit ?? preview.group_deposit,
        total_paid: data.total_paid,
        balance_due: data.balance_due,
        invoice_number: data.invoice_number ?? "",
        date: data.date ?? "",
        username: data.username ?? "",
        tax: (data.tax as GroupInvoiceData["tax"]) ?? {},
        current_mon: data.current_mon ?? preview.current_mon,
      });
      setShowGenerateModal(false);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String(
              (
                (err as { response?: { data?: { detail?: string } } }).response
                  ?.data as Record<string, unknown>
              )?.detail ?? "Failed to generate group invoice",
            )
          : "Failed to generate group invoice";
      setErrorMsg(msg);
    } finally {
      setGenerating(false);
    }
  };

  const rawData = invoice ?? preview;

  // Convert all amounts to RWF for invoice display
  const displayData = useMemo(() => {
    if (!rawData) return null;
    const mon = rawData.current_mon;
    if (!mon || mon === "RWF") return rawData;

    const rate = currencies.find((c) => c.code === mon)?.exchange_rate || 1;

    const items = rawData.items.map((item) => {
      if (item.designation.startsWith("Room ")) {
        return { ...item, puv: Math.round(item.puv * rate), credit: Math.round(item.credit * rate) };
      }
      return item;
    });

    if (items.length > 0 && items[0].designation.startsWith("Room ") && items[0].debit > 0) {
      items[0] = { ...items[0], debit: Math.round(items[0].debit * rate) };
    }

    const total_charges = items.reduce((s, i) => s + i.credit, 0);
    const total_paid = items.reduce((s, i) => s + i.debit, 0);
    const balance_due = total_charges - total_paid;
    const group_deposit = rawData.group_deposit ? Math.round(rawData.group_deposit * rate) : 0;

    let tax = (rawData as GroupInvoiceData).tax;
    if (tax?.taux != null) {
      const htva = Math.round(total_charges / (1 + tax.taux / 100));
      const tva = total_charges - htva;
      tax = { ...tax, htva, tva, total_ttc: total_charges };
    }

    return {
      ...rawData,
      items,
      total_charges,
      total_paid,
      balance_due,
      group_deposit,
      current_mon: "RWF",
      ...(tax ? { tax } : {}),
    };
  }, [rawData, currencies]);

  return (
    <div className="space-y-4 p-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white border border-hotel-border rounded p-4 p-4 rounded border border-hotel-border">
        <div>
          <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
            {t("invoiceByGroup")}
          </h1>
          <p className="text-sm text-hotel-text-secondary mt-1">
            Select an active group to preview consolidated charges
          </p>
        </div>
        <div className="flex gap-3">
          {displayData && !invoice && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-700 text-white px-6 py-3 rounded flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-colors duration-200"
            >
              <Receipt size={18} />
              Generate Invoice
            </button>
          )}
          {displayData && (
            <button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded flex items-center gap-2 text-sm font-medium hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-colors duration-200"
            >
              <Printer size={18} />
              {t("print")}
            </button>
          )}
        </div>
      </div>

      {/* Group selection */}
      <div className="bg-white rounded border border-hotel-border p-4">
        <h3 className="text-base font-bold text-hotel-text-primary mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full" />
          Active Groups
        </h3>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by group name or code..."
          className="w-full border-2 border-hotel-border rounded px-4 py-3 text-sm mb-4 focus:outline-none focus:border-hotel-gold focus:shadow-md transition-colors"
        />
        {activeGroups.length === 0 ? (
          <p className="text-sm text-hotel-text-secondary py-4 text-center">
            No active groups found.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto border-2 border-hotel-border rounded">
            {activeGroups.map((group) => (
              <button
                key={group.id ?? group.code_g}
                onClick={() => handleSelectGroup(group)}
                className="w-full text-left px-4 py-4 text-sm border-b border-hotel-border last:border-b-0 hover:bg-gradient-to-r hover:from-hotel-paper hover:to-hotel-cream transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-hotel-text-primary">
                      {group.groupe_name}
                    </p>
                    <p className="text-xs text-hotel-text-secondary mt-0.5">
                      Code: {group.code_g} — {group.number_pers} persons
                    </p>
                  </div>
                  <div className="text-right text-xs text-hotel-text-secondary">
                    <p>{group.arrival_date}</p>
                    <p>{group.depart_date}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-hotel-gold" size={32} />
          <span className="ml-3 text-hotel-text-secondary">
            Loading group invoice data...
          </span>
        </div>
      )}

      {/* Invoice Document */}
      {displayData && displayData.items.length > 0 && (
        <div
          id="report-output"
          className="bg-white text-[10px] leading-tight text-black max-w-[960px] mx-auto p-4 font-sans rounded border border-hotel-border"
        >
          <div className="mb-4 pb-4 border-b-2 border-hotel-border">
            <p className="text-base font-bold text-hotel-text-primary">
              {invoice ? "Definitive Group Invoice" : "Group Invoice Preview"}
            </p>
            {invoice && (
              <p className="text-sm font-mono font-bold text-hotel-gold mt-1">
                {invoice.invoice_number}
              </p>
            )}
            <p className="text-xs text-hotel-text-secondary mt-1">
              {displayData.groupe_name} ({displayData.code_g}) —{" "}
              {displayData.number_pers} persons
            </p>
          </div>

          <div className="border-2 border-hotel-border rounded overflow-hidden">
            {/* Header */}
            <div className="flex border-b-2 border-hotel-border bg-gradient-to-r from-hotel-paper to-white">
              <div className="p-4 w-44 shrink-0 space-y-1 text-xs border-r-2 border-hotel-border bg-hotel-cream">
                <p className="font-bold text-sm text-hotel-text-primary">
                  Hotel de la Front Office
                </p>
                <p className="text-hotel-text-primary">Kigali, Rwanda</p>
                <p className="text-hotel-text-primary">+250 788 123 456</p>
                <p className="text-hotel-text-primary">contact@hotel.local</p>
                <p className="font-semibold text-hotel-text-primary text-xs">
                  TIN: 00000000
                </p>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-center">
                <h2 className="text-sm font-bold text-center mb-3 text-hotel-text-primary border-b-2 border-hotel-border pb-2">
                  {invoice ? "GROUP INVOICE" : "GROUP INVOICE PREVIEW"}
                </h2>
                <div className="space-y-2 self-end w-full max-w-sm">
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-hotel-border">
                    <span className="text-xs font-semibold text-hotel-text-primary">
                      Group:
                    </span>
                    <span className="text-xs font-bold text-hotel-text-primary">
                      {displayData.groupe_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-hotel-border">
                    <span className="text-xs font-semibold text-hotel-text-primary">
                      Code:
                    </span>
                    <span className="text-xs font-bold text-hotel-text-primary">
                      {displayData.code_g}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-hotel-border">
                    <span className="text-xs font-semibold text-hotel-text-primary">
                      Persons:
                    </span>
                    <span className="text-xs font-bold text-hotel-text-primary">
                      {displayData.number_pers}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-hotel-border">
                    <span className="text-xs font-semibold text-hotel-text-primary">
                      Arrival:
                    </span>
                    <span className="text-xs text-hotel-text-primary">
                      {displayData.arrival_date}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-hotel-border">
                    <span className="text-xs font-semibold text-hotel-text-primary">
                      Departure:
                    </span>
                    <span className="text-xs text-hotel-text-primary">
                      {displayData.depart_date}
                    </span>
                  </div>
                  {invoice && (
                    <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-hotel-border">
                      <span className="text-xs font-semibold text-hotel-text-primary">
                        Invoice:
                      </span>
                      <span className="text-xs font-mono font-bold text-hotel-gold">
                        {invoice.invoice_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table — includes room_num and guest_name per item */}
            <div className="relative overflow-hidden bg-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-hotel-navy">
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
                        className="border border-hotel-border px-2 py-2 text-left font-bold text-xs text-white"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayData.items.map((item, i) => (
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
                      <td className="border border-hotel-border px-2 py-2 text-xs text-hotel-text-primary font-medium">
                        {item.guest_name}
                      </td>
                      <td className="border border-hotel-border px-2 py-2 text-xs text-hotel-text-primary font-medium">
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
                      <td className="border border-hotel-border px-2 py-2 text-xs text-right font-bold text-hotel-gold">
                        {fmt(item.debit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-start px-4 py-4 border-t-2 border-hotel-border bg-gradient-to-r from-hotel-paper to-white">
              {invoice && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-baseline gap-3">
                    <span className="font-semibold text-hotel-text-primary">
                      Company Signature
                    </span>
                    <span className="border-b-2 border-hotel-border w-24 inline-block" />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-semibold text-hotel-text-primary">
                      Username:
                    </span>
                    <span className="font-bold text-hotel-gold">
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
                    {fmt(displayData.total_charges)} {displayData.current_mon}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-hotel-text-primary">
                    Group Deposit
                  </span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-purple-50 to-violet-50 px-3 py-1.5 w-28 text-right font-bold text-purple-700">
                    {fmt(displayData.group_deposit)} {displayData.current_mon}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-hotel-text-primary">
                    Total Paid
                  </span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 w-28 text-right font-bold text-blue-700">
                    {fmt(displayData.total_paid)} {displayData.current_mon}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-hotel-text-primary">
                    Balance Due
                  </span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-1.5 w-28 text-right font-bold text-red-700">
                    {fmt(displayData.balance_due)} {displayData.current_mon}
                  </span>
                </div>
                {(displayData as any)?.tax?.taux != null && (
                  <>
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-hotel-border">
                      <span className="font-semibold text-hotel-text-primary">HTVA</span>
                      <span className="border-2 border-gray-400 px-3 py-1.5 w-28 text-right font-bold text-blue-700">
                        {fmt((displayData as any).tax.htva ?? 0)} {displayData.current_mon}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-semibold text-hotel-text-primary">
                        TVA ({(displayData as any).tax.taux}%)
                      </span>
                      <span className="border-2 border-gray-400 px-3 py-1.5 w-28 text-right font-bold text-red-700">
                        {fmt((displayData as any).tax.tva ?? 0)} {displayData.current_mon}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-semibold text-hotel-text-primary">
                        Total TTC
                      </span>
                      <span className="border-2 border-gray-400 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 w-28 text-right font-bold text-green-800">
                        {fmt((displayData as any).tax.total_ttc ?? 0)} {displayData.current_mon}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-hotel-text-secondary mt-4 text-xs font-light tracking-widest">
            --
          </p>
        </div>
      )}

      {/* Generate Group Invoice Modal */}
      {showGenerateModal && preview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 w-full max-w-md">
            <h3 className="text-base font-semibold text-hotel-text-primary mb-4">
              Generate Group Invoice
            </h3>
            <p className="text-sm text-hotel-text-secondary mb-4">
              {preview.groupe_name} ({preview.code_g}) —{" "}
              {preview.number_pers} persons
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
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 bg-hotel-gold-dark text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating && (
                  <Loader2 className="animate-spin" size={14} />
                )}
                Generate
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="border px-4 py-2 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      {errorMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-hotel-cream rounded-full">
                <AlertTriangle className="text-hotel-gold" size={20} />
              </div>
              <h3 className="text-base font-semibold text-hotel-text-primary">Error</h3>
            </div>
            <p className="text-sm text-hotel-text-secondary mb-6">{errorMsg}</p>
            <button
              onClick={() => setErrorMsg("")}
              className="w-full bg-hotel-gold-dark text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #report-output, #report-output * { visibility: visible !important; }
          #report-output { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
        }
      `}</style>
    </div>
  );
}


