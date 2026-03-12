import { useState } from "react";
import { Search, Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function InvoiceByGroup() {
  const { t } = useLang();
  const { sales } = useHotelData();
  const [queryInvoice, setQueryInvoice] = useState("");
  const [queryGroup, setQueryGroup] = useState("");
  const [filtered, setFiltered] = useState<typeof sales>([]);

  const handleSearch = () => {
    setFiltered(
      sales.filter(
        (s) =>
          (queryInvoice && s.invoice_num === queryInvoice) ||
          (queryGroup &&
            s.guest_name.toLowerCase().includes(queryGroup.toLowerCase())),
      ),
    );
  };

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("invoiceByGroup")}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
          >
            <Printer size={16} />
            {t("print")}
          </button>
          <button
            onClick={exportCSV}
            className="border border-green-600 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-green-50"
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3 flex-wrap">
          <input
            value={queryInvoice}
            onChange={(e) => setQueryInvoice(e.target.value)}
            placeholder={t("invoiceNumber")}
            className="border rounded-lg px-4 py-2 text-sm w-40"
          />
          <input
            value={queryGroup}
            onChange={(e) => setQueryGroup(e.target.value)}
            placeholder={t("groupName")}
            className="flex-1 border rounded-lg px-4 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
          >
            <Search size={16} />
            {t("search")}
          </button>
        </div>
      </div>
      {filtered.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <p className="text-sm text-gray-500">
              Lpinvoice.prt — {t("invoiceByGroupDesc")}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  t("date"),
                  t("roomNumber"),
                  t("guestName"),
                  t("designation"),
                  t("qty"),
                  t("unity"),
                  t("puv"),
                  t("credit"),
                  t("debit"),
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-3 font-medium text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{s.date}</td>
                  <td className="px-3 py-2">{s.room_num}</td>
                  <td className="px-3 py-2">{s.guest_name}</td>
                  <td className="px-3 py-2">{s.item}</td>
                  <td className="px-3 py-2">{s.qty_s}</td>
                  <td className="px-3 py-2">{s.unity}</td>
                  <td className="px-3 py-2 text-right">
                    {s.price_s.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {s.montant.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {s.paid.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 border-t flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between font-semibold">
                <span>{t("totalTTC")}:</span>
                <span>{totalTTC.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("htva")}:</span>
                <span>
                  {htva.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t("tva")} (18%):</span>
                <span>
                  {tva.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
