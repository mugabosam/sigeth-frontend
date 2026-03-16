import { useMemo, useState } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function InvoiceByGuest() {
  const { t } = useLang();
  const { sales, tempo } = useHotelData();
  const [queryInvoice, setQueryInvoice] = useState("");
  const [queryGuest, setQueryGuest] = useState("");
  const [filtered, setFiltered] = useState<typeof sales>([]);

  const liveCandidates = useMemo(() => {
    const invoiceQuery = queryInvoice.trim().toLowerCase();
    const guestQuery = queryGuest.trim().toLowerCase();
    if (!invoiceQuery && !guestQuery) return [];
    const matches = sales.filter((s) => {
      const invoiceMatch =
        !invoiceQuery || s.invoice_num.toLowerCase().includes(invoiceQuery);
      const guestMatch =
        !guestQuery || s.guest_name.toLowerCase().includes(guestQuery);
      return invoiceMatch && guestMatch;
    });
    const byAccess = new Map<
      string,
      {
        invoice_num: string;
        guest_name: string;
        room_num: string;
        rows: number;
      }
    >();
    matches.forEach((s) => {
      const key = `${s.invoice_num}::${s.guest_name.toLowerCase()}`;
      if (!byAccess.has(key)) {
        byAccess.set(key, {
          invoice_num: s.invoice_num,
          guest_name: s.guest_name,
          room_num: s.room_num,
          rows: 1,
        });
      } else {
        const current = byAccess.get(key);
        if (current) byAccess.set(key, { ...current, rows: current.rows + 1 });
      }
    });
    return Array.from(byAccess.values()).slice(0, 12);
  }, [sales, queryInvoice, queryGuest]);

  const selectCandidate = (invoiceNum: string, guestName: string) => {
    setQueryInvoice(invoiceNum);
    setQueryGuest(guestName);
    setFiltered(
      sales.filter(
        (s) =>
          s.invoice_num === invoiceNum &&
          s.guest_name.toLowerCase() === guestName.toLowerCase(),
      ),
    );
  };

  const totalCredit = filtered.reduce((s, i) => s + i.montant, 0);
  const ttc = totalCredit;
  const htva = ttc / 1.18;
  const tva = ttc - htva;

  const tempoRecord = useMemo(
    () =>
      tempo.find(
        (rec) =>
          rec.room_num === filtered[0]?.room_num &&
          rec.guest_name.toLowerCase() ===
            filtered[0]?.guest_name.toLowerCase(),
      ),
    [tempo, filtered],
  );

  const exportCSV = () => {
    const headers = [
      "date",
      "designation",
      "qty",
      "unity",
      "puv",
      "credit",
      "debit",
    ];
    const rows = filtered.map((r) =>
      [r.date, r.item, r.qty_s, r.unity, r.price_s, r.montant, r.paid].join(
        ",",
      ),
    );
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Lgpinvoice.csv";
    a.click();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("invoiceByGuest")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate and manage definitive invoices
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105"
          >
            <Printer size={18} />
            {t("print")}
          </button>
          <button
            onClick={exportCSV}
            className="border-2 border-green-500 text-green-700 px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium bg-green-50 hover:bg-green-100 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>
        </div>
      </div>

      {/* Search panel */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
          {t("queryWindow")}
        </h3>
        <div className="flex gap-4 flex-wrap">
          <input
            value={queryInvoice}
            onChange={(e) => {
              setQueryInvoice(e.target.value);
              setFiltered([]);
            }}
            placeholder={t("invoiceNumber")}
            className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm w-48 focus:outline-none focus:border-blue-500 focus:shadow-md transition-all"
          />
          <input
            value={queryGuest}
            onChange={(e) => {
              setQueryGuest(e.target.value);
              setFiltered([]);
            }}
            placeholder={t("guestName")}
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:shadow-md transition-all"
          />
        </div>
        {(queryInvoice.trim() || queryGuest.trim()) && (
          <div className="mt-4 border-2 border-gray-200 rounded-xl max-h-56 overflow-y-auto shadow-md bg-gray-50">
            {liveCandidates.length === 0 && (
              <p className="text-sm text-gray-500 px-4 py-6 text-center font-medium">
                No matching guest found.
              </p>
            )}
            {liveCandidates.map((c) => (
              <button
                key={`${c.invoice_num}-${c.guest_name}`}
                type="button"
                onClick={() => selectCandidate(c.invoice_num, c.guest_name)}
                className="w-full text-left px-4 py-4 text-sm border-b border-gray-200 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-150 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 group-hover:text-blue-700">
                    {c.guest_name}
                  </span>
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors">
                    {c.rows} row{c.rows !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
                    {c.invoice_num}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>
                    Room{" "}
                    <span className="font-semibold text-gray-700">
                      {c.room_num}
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── INVOICE DOCUMENT ── */}
      {filtered.length > 0 && (
        <div
          id="report-output"
          className="bg-white text-[10px] leading-tight text-black max-w-[960px] mx-auto p-6 font-sans shadow-lg rounded-2xl border border-gray-200"
        >
          <div className="mb-4 pb-4 border-b-2 border-gray-300">
            <p className="text-lg font-bold text-gray-800">
              Definitive Invoice
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {t("invoiceNum")}
              {filtered[0]?.invoice_num} • {filtered[0]?.guest_name}
            </p>
          </div>

          {/* Outer frame with double border effect */}
          <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
            {/* Header: PME info (left) | Invoice title & fields (right) */}
            <div className="flex border-b-2 border-gray-800 bg-gradient-to-r from-gray-50 to-white">
              {/* Left: PME Info Box */}
              <div className="p-4 w-44 shrink-0 space-y-1 text-xs border-r-2 border-gray-800 bg-gray-100">
                <p className="font-bold text-sm text-gray-900">
                  Hotel de la Front Office
                </p>
                <p className="text-gray-700">Kigali, Rwanda</p>
                <p className="text-gray-700">+250 788 123 456</p>
                <p className="text-gray-700">contact@hotel.local</p>
                <p className="font-semibold text-gray-800 text-xs">
                  TIN: 00000000
                </p>
              </div>

              {/* Right: Title + Fields */}
              <div className="flex-1 p-4 flex flex-col justify-center">
                <h2 className="text-sm font-bold text-center mb-3 text-gray-900 border-b-2 border-gray-400 pb-2">
                  DEFINITIVE INVOICE
                </h2>
                <div className="space-y-2 self-end w-full max-w-sm">
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-gray-300">
                    <span className="text-xs font-semibold text-gray-700">
                      Room:
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {filtered[0]?.room_num ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-gray-300">
                    <span className="text-xs font-semibold text-gray-700">
                      Guest:
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {filtered[0]?.guest_name ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-gray-300">
                    <span className="text-xs font-semibold text-gray-700">
                      Phone:
                    </span>
                    <span className="text-xs text-gray-800">
                      {tempoRecord?.phone ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-gray-300">
                    <span className="text-xs font-semibold text-gray-700">
                      TIN:
                    </span>
                    <span className="text-xs text-gray-800">
                      {tempoRecord?.tin ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-gray-300">
                    <span className="text-xs font-semibold text-gray-700">
                      Invoice:
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-700">
                      {filtered[0]?.invoice_num ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-gray-300">
                    <span className="text-xs font-semibold text-gray-700">
                      Current_mon:
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {filtered[0]?.current_mon ?? "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table with improved styling */}
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
                  {filtered.map((s, i) => (
                    <tr
                      key={i}
                      className="hover:bg-blue-50 transition-colors border-b border-gray-300"
                    >
                      <td className="border border-gray-300 px-2 py-2 text-xs font-mono text-gray-700">
                        {s.date}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-gray-800 font-medium">
                        {s.item}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-center font-semibold">
                        {s.qty_s}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-gray-700">
                        {s.unity}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-right font-semibold">
                        {s.price_s.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-right font-bold text-green-700">
                        {s.montant.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-right font-bold text-red-700">
                        {s.paid.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer: Signatures (left) | Totals (right) */}
            <div className="flex justify-between items-start px-4 py-4 border-t-2 border-gray-800 bg-gradient-to-r from-gray-50 to-white">
              <div className="space-y-3 text-xs">
                <div className="flex items-baseline gap-3">
                  <span className="font-semibold text-gray-800">
                    Company Signature
                  </span>
                  <span className="border-b-2 border-gray-400 w-24 inline-block" />
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-semibold text-gray-800">Username:</span>
                  <span className="font-bold text-blue-700">
                    {filtered[0]?.username ?? "-"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-gray-700">
                    Total (with tax)
                  </span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 w-24 text-right font-bold text-green-700">
                    {Math.round(ttc).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-gray-700">
                    {t("hTVALabel")}
                  </span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 w-24 text-right font-bold text-blue-700">
                    {Math.round(htva).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-gray-700">
                    {t("tVALabel")}
                  </span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-1.5 w-24 text-right font-bold text-red-700">
                    {Math.round(tva).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Page marker */}
          <p className="text-center text-gray-400 mt-4 text-xs font-light tracking-widest\">
            --
          </p>
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
