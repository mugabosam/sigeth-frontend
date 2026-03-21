import { useState } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function LaundryJournal() {
  const { t } = useLang();
  const { jlaundry } = useHotelData();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = jlaundry.filter((j) => {
    if (dateFrom && j.date < dateFrom) return false;
    if (dateTo && j.date > dateTo) return false;
    return true;
  });

  const grandTotal = filtered.reduce((s, j) => s + j.total, 0);

  const handleExport = () => {
    const header = "Date,Room_num,Designation,Unity,Qty,Price,Total";
    const rows = filtered.map(
      (j) =>
        `${j.date},${j.room_num},${j.designation},${j.unity},${j.qty},${j.price},${j.total}`,
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Ljlaundry.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => window.print()}
          className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
        >
          <Printer size={14} />
          {t("print")}
        </button>
        <button
          onClick={handleExport}
          className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
        >
          <FileSpreadsheet size={14} />
          {t("excel")}
        </button>
      </div>
      <div className="bg-white rounded p-4 flex gap-3 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
            {t("dateFrom")}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title={t("dateFrom")}
            className="border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
            {t("dateTo")}
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title={t("dateTo")}
            className="border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
          />
        </div>
      </div>
      <div className="bg-white rounded overflow-hidden">
        <h2 className="text-sm font-semibold text-hotel-text-primary mb-2 uppercase tracking-wide px-2">
          Transaction Details
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-hotel-navy text-white sticky top-0">
            <tr>
              {[
                t("date"),
                t("roomNum"),
                t("designation"),
                t("unity"),
                t("qty"),
                t("price"),
                t("total"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-2 px-2 font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((j, i) => (
              <tr
                key={i}
                className="border-b border-hotel-border hover:bg-hotel-cream transition-colors"
              >
                <td className="py-2 px-2 text-hotel-text-primary">{j.date}</td>
                <td className="py-2 px-2 font-mono text-hotel-gold">
                  {j.room_num}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {j.designation}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">{j.unity}</td>
                <td className="py-2 px-2 text-hotel-text-primary">{j.qty}</td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {j.price.toLocaleString()}
                </td>
                <td className="py-2 px-2 font-semibold text-hotel-gold">
                  {j.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-hotel-border">
            <tr>
              <td
                colSpan={6}
                className="py-2 px-2 font-semibold text-right text-hotel-text-primary"
              >
                {t("grandTotal")}
              </td>
              <td className="py-2 px-2 font-bold text-hotel-gold">
                {grandTotal.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
