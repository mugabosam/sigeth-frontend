import { useState } from "react";
import { Printer, Loader2, Receipt, AlertTriangle } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { frontOfficeApi } from "../../services/sigethApi";
import type { RDF, TEMPO } from "../../types";

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

export default function InvoicePreview() {
  const { t } = useLang();
  const { rooms, paymentModes } = useHotelData();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genPaytMode, setGenPaytMode] = useState("");
  const [genPhone, setGenPhone] = useState("");
  const [genTin, setGenTin] = useState("");
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const occupiedRooms = rooms.filter(
    (r) => r.status === "OCC" && r.guest_name,
  );

  const handleSelectGuest = async (room: RDF) => {
    setLoading(true);
    setPreview(null);
    setInvoice(null);
    try {
      const data = await frontOfficeApi.previewInvoice({
        room_num: room.room_num,
        guest_name: room.guest_name,
      });
      setPreview({
        room_num: data.room_num ?? room.room_num,
        guest_name: data.guest_name ?? room.guest_name,
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
              )?.detail ?? "Failed to load invoice preview",
            )
          : "Failed to load invoice preview";
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
    <div className="space-y-6 p-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("invoicePreview")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Select an occupied room to preview charges
          </p>
        </div>
        <div className="flex gap-3">
          {displayData && !invoice && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Receipt size={18} />
              Generate Invoice
            </button>
          )}
          {displayData && (
            <button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105"
            >
              <Printer size={18} />
              {t("print")}
            </button>
          )}
        </div>
      </div>

      {/* Occupied rooms list */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          Occupied Rooms
        </h3>
        {occupiedRooms.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            No occupied rooms found.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl">
            {occupiedRooms.map((room) => (
              <button
                key={room.room_num}
                onClick={() => handleSelectGuest(room)}
                className="w-full text-left px-4 py-4 text-sm border-b border-gray-200 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Room {room.room_num}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {room.guest_name}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>{room.arrival_date}</p>
                    <p>{room.depart_date}</p>
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
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <span className="ml-3 text-gray-600">Loading preview...</span>
        </div>
      )}

      {/* Invoice Document */}
      {displayData && displayData.items.length > 0 && (
        <div
          className="bg-white text-[10px] leading-tight text-black max-w-[1000px] mx-auto p-6 font-sans shadow-lg rounded-2xl border border-gray-200"
          id="invoice-preview"
        >
          <div className="mb-4 pb-4 border-b-2 border-gray-300">
            <p className="text-lg font-bold text-gray-800">
              {invoice ? "Definitive Invoice" : "Invoice Preview"}
            </p>
            {invoice && (
              <p className="text-sm font-mono font-bold text-blue-700 mt-1">
                {invoice.invoice_number}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Generated: {invoice?.date || new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Header Info */}
          <div className="border-2 border-gray-800 rounded-lg overflow-hidden mb-4">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 flex justify-between items-center text-white">
              <p className="font-bold text-sm">
                {invoice ? "DEFINITIVE INVOICE" : "Guest Invoice Preview"}
              </p>
              <div className="text-xs space-y-0.5 text-right">
                <p>
                  <span className="font-semibold">{t("roomNumber")}:</span>{" "}
                  {displayData.room_num}
                </p>
                <p>
                  <span className="font-semibold">{t("guestName")}:</span>{" "}
                  {displayData.guest_name}
                </p>
                <p>
                  <span className="font-semibold">{t("arrivalDate")}:</span>{" "}
                  {displayData.arrival_date}
                </p>
                <p>
                  <span className="font-semibold">{t("departDate")}:</span>{" "}
                  {displayData.depart_date}
                </p>
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
                  {displayData.items.map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-blue-50 transition-colors border-b border-gray-300"
                    >
                      <td className="border border-gray-300 px-2 py-2 text-xs font-mono text-gray-700">
                        {item.date}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-gray-800">
                        {item.designation}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-center font-semibold">
                        {item.qty}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-gray-700">
                        {item.unity}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-right font-semibold">
                        {fmt(item.puv)}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-right font-bold text-green-700">
                        {fmt(item.credit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Footer */}
            <div className="flex justify-between items-start px-4 py-4 border-t-2 border-gray-800 bg-gradient-to-r from-gray-50 to-white">
              {invoice && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-baseline gap-3">
                    <span className="font-semibold text-gray-800">
                      Company Signature
                    </span>
                    <span className="border-b-2 border-gray-400 w-24 inline-block" />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-semibold text-gray-800">
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
                  <span className="font-semibold text-gray-700">
                    Total Charges
                  </span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 w-28 text-right font-bold text-green-700">
                    {fmt(displayData.total_charges)} RWF
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-gray-700">
                    Total Paid
                  </span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 w-28 text-right font-bold text-blue-700">
                    {fmt(displayData.total_paid)} RWF
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-gray-700">
                    Balance Due
                  </span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-1.5 w-28 text-right font-bold text-red-700">
                    {fmt(displayData.balance_due)} RWF
                  </span>
                </div>
                {invoice?.tax?.taux != null && (
                  <>
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-300">
                      <span className="font-semibold text-gray-700">HTVA</span>
                      <span className="border-2 border-gray-400 px-3 py-1.5 w-28 text-right font-bold text-gray-700">
                        {fmt(invoice.tax.htva ?? 0)} RWF
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-semibold text-gray-700">
                        TVA ({invoice.tax.taux}%)
                      </span>
                      <span className="border-2 border-gray-400 px-3 py-1.5 w-28 text-right font-bold text-gray-700">
                        {fmt(invoice.tax.tva ?? 0)} RWF
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-semibold text-gray-700">
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
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Generate Definitive Invoice
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {preview.guest_name} — Room {preview.room_num}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {t("paymentMode")}
                </label>
                <select
                  value={genPaytMode}
                  onChange={(e) => setGenPaytMode(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
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
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  value={genPhone}
                  onChange={(e) => setGenPhone(e.target.value)}
                  placeholder="+250..."
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  TIN
                </label>
                <input
                  type="text"
                  value={genTin}
                  onChange={(e) => setGenTin(e.target.value)}
                  placeholder="Tax ID"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating && (
                  <Loader2 className="animate-spin" size={14} />
                )}
                Generate
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="border px-4 py-2 rounded-lg text-sm"
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
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Error</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">{errorMsg}</p>
            <button
              onClick={() => setErrorMsg("")}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-preview, #invoice-preview * { visibility: visible !important; }
          #invoice-preview { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
