import { useState } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function BanquetRequestFollowUp() {
  const { t } = useLang();
  const { requisitions } = useHotelData();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = requisitions.filter((r) => {
    if (r.poste !== "Banqueting") return false;
    if (dateFrom && r.date_d < dateFrom) return false;
    if (dateTo && r.date_d > dateTo) return false;
    return true;
  });

  const handleExport = () => {
    const header = "Date_d,Item,Qty,Credit_1,Credit_2,Date_r";
    const rows = filtered.map(
      (r) =>
        `${r.date_d},${r.libelle},${r.qty},${r.credit_1},${r.credit_2},${r.date_r}`,
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Lrequis.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("banquetRequestFollowUp")} — Lrequis.prt
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
      <div className="bg-white rounded-xl shadow-sm border p-4 flex gap-4">
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
                t("dateD"),
                t("libelle"),
                t("qty"),
                t("credit1"),
                t("credit2"),
                t("dateR"),
                t("statut"),
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
            {filtered.map((r, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{r.date_d}</td>
                <td className="px-4 py-3">{r.libelle}</td>
                <td className="px-4 py-3">{r.qty}</td>
                <td className="px-4 py-3">{r.credit_1.toLocaleString()}</td>
                <td className="px-4 py-3">{r.credit_2.toLocaleString()}</td>
                <td className="px-4 py-3">{r.date_r || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${r.statut === "Approved" ? "bg-green-100 text-green-700" : r.statut === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {r.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
