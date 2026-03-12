import { useState } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function ServiceFollowUp() {
  const { t } = useLang();
  const { jbanquet } = useHotelData();
  const [groupQ, setGroupQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = jbanquet.filter((j) => {
    if (groupQ && !j.groupe_name.toLowerCase().includes(groupQ.toLowerCase()))
      return false;
    if (dateFrom && j.date < dateFrom) return false;
    if (dateTo && j.date > dateTo) return false;
    return true;
  });

  const grandTotal = filtered.reduce((s, j) => s + j.total, 0);

  const handleExport = () => {
    const header = "Date,Group,Nature,Item,Unity,Qty,Price,Total";
    const rows = filtered.map(
      (j) =>
        `${j.date},${j.groupe_name},${j.nature},${j.item},${j.unity},${j.qty},${j.price},${j.total}`,
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Ljbanquet.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("serviceFollowUp")} — Ljbanquet.prt
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-700"
          >
            <Printer size={16} />
            {t("print")}
          </button>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-green-700"
          >
            <FileSpreadsheet size={16} />
            {t("excel")}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("groupName")}
          </label>
          <input
            type="text"
            value={groupQ}
            onChange={(e) => setGroupQ(e.target.value)}
            placeholder={t("searchGroup")}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("dateFrom")}
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title={t("dateFrom")}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("dateTo")}
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title={t("dateTo")}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("date"),
                t("groupName"),
                t("nature"),
                t("item"),
                t("unity"),
                t("qty"),
                t("price"),
                t("total"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-medium text-gray-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((j, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{j.date}</td>
                <td className="px-4 py-3">{j.groupe_name}</td>
                <td className="px-4 py-3">{j.nature}</td>
                <td className="px-4 py-3">{j.item}</td>
                <td className="px-4 py-3">{j.unity}</td>
                <td className="px-4 py-3">{j.qty}</td>
                <td className="px-4 py-3">{j.price.toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold">
                  {j.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-amber-50 border-t">
            <tr>
              <td colSpan={7} className="px-4 py-3 font-semibold text-right">
                {t("grandTotal")}
              </td>
              <td className="px-4 py-3 font-bold">
                {grandTotal.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
