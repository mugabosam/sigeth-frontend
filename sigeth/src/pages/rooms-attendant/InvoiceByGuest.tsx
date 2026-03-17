import { useState } from "react";
import { Printer, Search, Loader2, Receipt, AlertTriangle } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { frontOfficeApi } from "../../services/sigethApi";
import type { TEMPO } from "../../types";

interface PreviewData {
  room_num: string;
  guest_name: string;
  arrival_date: string;
  depart_date: string;
  items: TEMPO[];
  total_charges: number;
  total_paid: number;
  balance_due: number;
}

interface InvoiceData extends PreviewData {
  invoice_number: string;
  date: string;
  username: string;
  tax: { total_ttc?: number; htva?: number; tva?: number; taux?: number };
}

const fmt = (n: number) => new Intl.NumberFormat("en-RW").format(Math.round(n));

export default function InvoiceByGuest() {
  const { t } = useLang();
  const { paymentModes } = useHotelData();

  const [queryRoom, setQueryRoom] = useState("");
  const [queryGuest, setQueryGuest] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genPaytMode, setGenPaytMode] = useState("");
  const [genPhone, setGenPhone] = useState("");
  const [genTin, setGenTin] = useState("");
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async () => {
    const room = queryRoom.trim();
    const guest = queryGuest.trim();
    if (!room && !guest) return;

    setLoading(true);
    setPreview(null);
    setInvoice(null);
    try {
      const data = await frontOfficeApi.previewInvoice({
        room_num: room,
        guest_name: guest,
      });
      setPreview({
        room_num: data.room_num ?? room,
        guest_name: data.guest_name ?? guest,
        arrival_date: data.arrival_date ?? "",
        depart_date: data.depart_date ?? "",
        items: data.items,
        total_charges: data.total_charges,
        total_paid: data.total_paid,
        balance_due: data.balance_due,
      });
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String(
              (
                (err as { response?: { data?: { detail?: string } } }).response
                  ?.data as Record<string, unknown>
              )?.detail ?? "Guest not found or no charges available",
            )
          : "Failed to load invoice data";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
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
      });
      setShowGenerateModal(false);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String(
              (
                (err as { response?: { data?: { detail?: string } } }).response
                  ?.data as Record<string, unknown>
              )?.detail ?? "Failed to generate invoice",
            )
          : "Failed to generate invoice";
      setErrorMsg(msg);
    } finally {
      setGenerating(false);
    }
  };

  const displayData = invoice ?? preview;

  return (
    <div className="space-y-4 p-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white border border-hotel-border rounded p-4 p-4 rounded border border-blue-100">
        <div>
          <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
            {t("invoiceByGuest")}
          </h1>
          <p className="text-sm text-hotel-text-secondary mt-1">
            Search by room number and guest name
          </p>
        </div>
        <div className="flex gap-3">
          {displayData && !invoice && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-colors duration-200"
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

      {/* Search panel */}
      <div className="bg-white rounded border border-hotel-border p-4">
        <h3 className="text-base font-bold text-hotel-text-primary mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3 flex-wrap">
          <input
            value={queryRoom}
            onChange={(e) => setQueryRoom(e.target.value)}
            placeholder={t("roomNumber")}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="border-2 border-hotel-border rounded px-4 py-3 text-sm w-48 focus:outline-none focus:border-blue-500 focus:shadow-md transition-colors"
          />
          <input
            value={queryGuest}
            onChange={(e) => setQueryGuest(e.target.value)}
            placeholder={t("guestName")}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 border-2 border-hotel-border rounded px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:shadow-md transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-hotel-gold text-white px-6 py-3 rounded flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Search size={16} />
            )}
            {t("search")}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <span className="ml-3 text-hotel-text-secondary">Loading invoice data...</span>
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
              {invoice ? "Definitive Invoice" : "Invoice Preview"}
            </p>
            {invoice && (
              <p className="text-sm font-mono font-bold text-blue-700 mt-1">
                {invoice.invoice_number}
              </p>
            )}
            <p className="text-xs text-hotel-text-secondary mt-1">
              {displayData.guest_name} — Room {displayData.room_num}
            </p>
          </div>

          <div className="border-2 border-gray-800 rounded overflow-hidden">
            {/* Header */}
            <div className="flex border-b-2 border-gray-800 bg-gradient-to-r from-gray-50 to-white">
              <div className="p-4 w-44 shrink-0 space-y-1 text-xs border-r-2 border-gray-800 bg-gray-100">
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
                <h2 className="text-sm font-bold text-center mb-3 text-hotel-text-primary border-b-2 border-gray-400 pb-2">
                  {invoice ? "DEFINITIVE INVOICE" : "INVOICE PREVIEW"}
                </h2>
                <div className="space-y-2 self-end w-full max-w-sm">
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-hotel-border">
                    <span className="text-xs font-semibold text-hotel-text-primary">
                      Room:
                    </span>
                    <span className="text-xs font-bold text-hotel-text-primary">
                      {displayData.room_num}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-hotel-border">
                    <span className="text-xs font-semibold text-hotel-text-primary">
                      Guest:
                    </span>
                    <span className="text-xs font-bold text-hotel-text-primary">
                      {displayData.guest_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-hotel-border">
                    <span className="text-xs font-semibold text-hotel-text-primary">
                      Arrival:
                    </span>
                    <span className="text-xs text-hotel-text-primary">
                      {displayData.arrival_date || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-hotel-border">
                    <span className="text-xs font-semibold text-hotel-text-primary">
                      Departure:
                    </span>
                    <span className="text-xs text-hotel-text-primary">
                      {displayData.depart_date || "-"}
                    </span>
                  </div>
                  {invoice && (
                    <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-hotel-border">
                      <span className="text-xs font-semibold text-hotel-text-primary">
                        Invoice:
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-700">
                        {invoice.invoice_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="relative overflow-hidden bg-white">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-700">
                    {[
                      "Date",
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
                  {displayData.items.map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-hotel-cream transition-colors border-b border-hotel-border"
                    >
                      <td className="border border-hotel-border px-2 py-2 text-xs font-mono text-hotel-text-primary">
                        {item.date}
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
                      <td className="border border-hotel-border px-2 py-2 text-xs text-right font-bold text-red-700">
                        {fmt(item.debit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
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
                    {fmt(displayData.total_charges)} RWF
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-hotel-text-primary">
                    Total Paid
                  </span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 w-28 text-right font-bold text-blue-700">
                    {fmt(displayData.total_paid)} RWF
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-hotel-text-primary">
                    Balance Due
                  </span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-1.5 w-28 text-right font-bold text-red-700">
                    {fmt(displayData.balance_due)} RWF
                  </span>
                </div>
                {invoice?.tax?.taux != null && (
                  <>
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-hotel-border">
                      <span className="font-semibold text-hotel-text-primary">
                        {t("hTVALabel")}
                      </span>
                      <span className="border-2 border-gray-400 px-3 py-1.5 w-28 text-right font-bold text-blue-700">
                        {fmt(invoice.tax.htva ?? 0)} RWF
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-semibold text-hotel-text-primary">
                        {t("tVALabel")} ({invoice.tax.taux}%)
                      </span>
                      <span className="border-2 border-gray-400 px-3 py-1.5 w-28 text-right font-bold text-red-700">
                        {fmt(invoice.tax.tva ?? 0)} RWF
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-semibold text-hotel-text-primary">
                        Total TTC
                      </span>
                      <span className="border-2 border-gray-400 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 w-28 text-right font-bold text-green-800">
                        {fmt(invoice.tax.total_ttc ?? 0)} RWF
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-gray-400 mt-4 text-xs font-light tracking-widest">
            --
          </p>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {showGenerateModal && preview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 w-full max-w-md">
            <h3 className="text-base font-semibold text-hotel-text-primary mb-4">
              Generate Definitive Invoice
            </h3>
            <p className="text-sm text-hotel-text-secondary mb-4">
              {preview.guest_name} — Room {preview.room_num}
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
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
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

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #report-output, #report-output * { visibility: visible !important; }
          #report-output { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
