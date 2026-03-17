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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
          {t("laundryJournal")}
        </h1>
        <p className="text-sm text-hotel-text-secondary">
          Laundry transaction history and reports
        </p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-gray-700 hover:to-gray-800 transition-colors duration-200"
        >
          <Printer size={16} />
          {t("print")}
        </button>
        <button
          onClick={handleExport}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors duration-200"
        >
          <FileSpreadsheet size={16} />
          {t("excel")}
        </button>
      </div>
      <div className="bg-white rounded border border-emerald-100 p-5 flex gap-3 flex-wrap">
        <div>
          <label className="block text-sm font-semibold text-hotel-text-primary mb-2">
            {t("dateFrom")}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title={t("dateFrom")}
            className="border-2 border-hotel-border hover:border-hotel-border focus:border-emerald-500 focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-hotel-text-primary mb-2">
            {t("dateTo")}
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title={t("dateTo")}
            className="border-2 border-hotel-border hover:border-hotel-border focus:border-emerald-500 focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors"
          />
        </div>
      </div>
      <div className="bg-white rounded border border-emerald-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-100">
          <h2 className="text-base font-bold text-hotel-text-primary">
            Transaction Details
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white border-b-2 border-emerald-200">
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
                  className="text-left px-6 py-3 font-bold text-hotel-text-primary"
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
                className="border-b hover:bg-emerald-50/50 transition-colors duration-150"
              >
                <td className="px-6 py-3 text-hotel-text-primary">{j.date}</td>
                <td className="px-6 py-3 font-mono text-emerald-600">
                  {j.room_num}
                </td>
                <td className="px-6 py-3 text-hotel-text-primary">{j.designation}</td>
                <td className="px-6 py-3 text-hotel-text-primary">{j.unity}</td>
                <td className="px-6 py-3 text-hotel-text-primary">{j.qty}</td>
                <td className="px-6 py-3 text-hotel-text-primary">
                  {j.price.toLocaleString()}
                </td>
                <td className="px-6 py-3 font-semibold text-emerald-700">
                  {j.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gradient-to-r from-emerald-50 to-green-50 border-t-2 border-emerald-200">
            <tr>
              <td
                colSpan={6}
                className="px-6 py-3 font-semibold text-right text-hotel-text-primary"
              >
                {t("grandTotal")}
              </td>
              <td className="px-6 py-3 font-bold text-emerald-700">
                {grandTotal.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
