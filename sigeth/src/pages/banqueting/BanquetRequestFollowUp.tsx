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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
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
      </div>
      <div className="bg-white rounded p-4 flex gap-3">
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
        <table className="w-full text-sm">
          <thead className="bg-hotel-navy text-white sticky top-0">
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
                  className="text-left py-2 px-2 font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((r, i) => (
                <tr
                  key={i}
                  className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors"
                >
                  <td className="py-2 px-2 font-medium text-hotel-text-primary">{r.date_d}</td>
                  <td className="py-2 px-2">{r.libelle}</td>
                  <td className="py-2 px-2">{r.qty}</td>
                  <td className="py-2 px-2">{r.credit_1.toLocaleString()}</td>
                  <td className="py-2 px-2">{r.credit_2.toLocaleString()}</td>
                  <td className="py-2 px-2">{r.date_r || "—"}</td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${r.statut === "Approved" ? "bg-hotel-cream text-hotel-gold" : r.statut === "Rejected" ? "bg-hotel-cream text-hotel-gold" : "bg-hotel-cream text-hotel-gold"}`}
                    >
                      {r.statut}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-hotel-text-secondary text-center">
                  {t("noRecords")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
