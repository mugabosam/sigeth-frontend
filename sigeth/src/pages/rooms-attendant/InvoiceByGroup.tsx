// ═══════════════════════════════════════════════════════════════════════════
// InvoiceByGroup.tsx
// Sub-Module 1.1  Rooms Attendant
// Output 1128 — Definitive Invoice by Group  (Lpinvoice.prt)
// ─────────────────────────────────────────────────────────────────────────
// QUERY WINDOW (dossier p.3453-3455):
//   Invoice_num  → key 1
//   Group_name   → key 2   ← NOT guest_name
//
// PRINT FIELDS (dossier p.3460-3461):
//   date · room_num · guest_name · designation · qty · unity · puv
//   credit · debit
//
// SOURCE TABLE: SALES.dat
// ═══════════════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function InvoiceByGroup() {
  const { t } = useLang();
  const { sales } = useHotelData();

  // Query window — dossier p.3454-3455: Invoice_num + Group_name
  const [queryInvoice, setQueryInvoice] = useState("");
  const [queryGroup, setQueryGroup] = useState("");

  // ── Live candidates
  // As the user types, searches SALES.dat and surfaces unique Group_name values.
  // Dossier specifies Group_name (not guest_name) as the group query key.
  const liveCandidates = useMemo(() => {
    const invoiceQ = queryInvoice.trim().toLowerCase();
    const groupQ = queryGroup.trim().toLowerCase();
    if (!invoiceQ && !groupQ) return [];

    const matches = sales.filter((s) => {
      const invoiceMatch =
        !invoiceQ || s.invoice_num.toLowerCase().includes(invoiceQ);
      // groupe_name is the SALES.dat field that stores the group identifier
      const groupMatch =
        !groupQ || (s.groupe_name ?? "").toLowerCase().includes(groupQ);
      return invoiceMatch && groupMatch;
    });

    // One suggestion per unique Group_name
    const seen = new Map<
      string,
      { groupe_name: string; invoice_num: string; rows: number }
    >();
    matches.forEach((s) => {
      const key = (s.groupe_name ?? "").toLowerCase();
      if (!key) return;
      if (!seen.has(key)) {
        seen.set(key, {
          groupe_name: s.groupe_name ?? "",
          invoice_num: s.invoice_num,
          rows: 1,
        });
      } else {
        const cur = seen.get(key)!;
        seen.set(key, { ...cur, rows: cur.rows + 1 });
      }
    });

    return Array.from(seen.values()).slice(0, 12);
  }, [sales, queryInvoice, queryGroup]);

  // Clicking a candidate fills both fields at once
  const selectCandidate = (groupe_name: string, invoice_num: string) => {
    setQueryGroup(groupe_name);
    setQueryInvoice(invoice_num);
  };

  // ── Filtered rows for invoice display
  // Exact match on both keys once user has selected / typed a complete value.
  // While still typing, partial match drives the suggestions above.
  const filtered = useMemo(() => {
    const invoiceQ = queryInvoice.trim().toLowerCase();
    const groupQ = queryGroup.trim().toLowerCase();
    if (!invoiceQ && !groupQ) return [];
    return sales.filter((s) => {
      const invoiceMatch =
        !invoiceQ || s.invoice_num.toLowerCase() === invoiceQ;
      const groupMatch =
        !groupQ || (s.groupe_name ?? "").toLowerCase() === groupQ;
      return invoiceMatch && groupMatch;
    });
  }, [sales, queryInvoice, queryGroup]);

  // Financial totals — dossier p.3305-3307
  const totalTTC = filtered.reduce((s, i) => s + i.montant, 0);
  const tvaRate = 18;
  const htva = (totalTTC * 100) / (100 + tvaRate);
  const tva = (htva * tvaRate) / 100;

  const exportCSV = () => {
    const headers = [
      "date",
      "room_num",
      "guest_name",
      "item",
      "qty_s",
      "unity",
      "price_s",
      "montant",
      "paid",
    ];
    const rows = filtered.map((r) =>
      headers
        .map((h) => String((r as unknown as Record<string, unknown>)[h] ?? ""))
        .join(","),
    );
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Lpinvoice.csv";
    a.click();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("invoiceByGroup")}
          </h1>
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

      {/* Query window — dossier p.3453-3455 */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          {t("queryWindow")}
        </h3>

        <div className="flex gap-4 flex-wrap mb-3">
          {/* Invoice_num field */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Invoice_num
            </label>
            <input
              value={queryInvoice}
              onChange={(e) => setQueryInvoice(e.target.value)}
              placeholder="e.g. INV-2026-00320"
              className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm w-52 focus:outline-none focus:border-blue-500 focus:shadow-md transition-all"
            />
          </div>

          {/* Group_name field — dossier key, not guest_name */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Group_name
            </label>
            <input
              value={queryGroup}
              onChange={(e) => setQueryGroup(e.target.value)}
              placeholder="e.g. AU Summit"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:shadow-md transition-all"
            />
          </div>
        </div>

        {/* Live dropdown — unique Group_name matches */}
        {liveCandidates.length > 0 && (
          <div className="border-2 border-blue-200 rounded-xl bg-gradient-to-b from-blue-50 to-white max-h-64 overflow-y-auto">
            {liveCandidates.map((c, i) => (
              <button
                key={i}
                onClick={() => selectCandidate(c.groupe_name, c.invoice_num)}
                className="w-full text-left px-4 py-3 text-sm border-b border-gray-100 last:border-b-0 hover:bg-blue-100 transition-colors duration-150 group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    {/* Group_name — primary display */}
                    <p className="font-semibold text-gray-800">
                      {c.groupe_name}
                    </p>
                    {/* Invoice_num — secondary hint */}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {c.invoice_num}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full group-hover:bg-blue-200 shrink-0">
                    {c.rows} line{c.rows !== 1 ? "s" : ""}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No match feedback */}
        {(queryInvoice || queryGroup) &&
          liveCandidates.length === 0 &&
          filtered.length === 0 && (
            <p className="text-xs text-red-500 mt-2">
              No Group_name / Invoice_num match found in SALES.dat.
            </p>
          )}
      </div>

      {/* Invoice document — dossier p.3464-3470 */}
      {filtered.length > 0 && (
        <div
          id="report-output"
          className="bg-white text-[10px] leading-tight text-black max-w-[960px] mx-auto p-6 font-sans shadow-lg rounded-2xl border border-gray-200"
        >
          <div className="mb-4 pb-4 border-b-2 border-gray-300">
            <p className="text-lg font-bold text-gray-800">
              Definitive Invoice by Group
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Invoice #{filtered[0]?.invoice_num} • {filtered[0]?.groupe_name}
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
                  GROUP INVOICE
                </h2>
                <div className="space-y-2 self-end w-full max-w-sm">
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-gray-300">
                    <span className="text-xs font-semibold text-gray-700">
                      Group:
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {filtered[0]?.groupe_name ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-gray-300">
                    <span className="text-xs font-semibold text-gray-700">
                      Items:
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {filtered.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3 pb-1.5 border-b-2 border-gray-300">
                    <span className="text-xs font-semibold text-gray-700">
                      Currency:
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {filtered[0]?.current_mon ?? "-"}
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
                      Payment Mode:
                    </span>
                    <span className="text-xs text-gray-800">
                      {filtered[0]?.mode_payt ?? "-"}
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
                  {filtered.map((s, i) => (
                    <tr
                      key={i}
                      className="hover:bg-blue-50 transition-colors border-b border-gray-300"
                    >
                      <td className="border border-gray-300 px-2 py-2 text-xs font-mono text-gray-700">
                        {s.date}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs font-semibold text-gray-800">
                        {s.room_num}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-xs text-gray-800 font-medium">
                        {s.guest_name}
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
                    {Math.round(totalTTC).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-gray-700">HTVA</span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 w-24 text-right font-bold text-blue-700">
                    {Math.round(htva).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <span className="font-semibold text-gray-700">TVA (18%)</span>
                  <span className="border-2 border-gray-400 bg-gradient-to-r from-orange-50 to-red-50 px-3 py-1.5 w-24 text-right font-bold text-red-700">
                    {Math.round(tva).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Page marker */}
          <p className="text-center text-gray-400 mt-4 text-xs font-light tracking-widest">
            --
          </p>
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
