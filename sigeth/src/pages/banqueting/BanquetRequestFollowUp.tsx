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
    <div className="min-h-screen bg-gradient-to-br from-hotel-paper to-hotel-cream p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
            {t("banquetRequestFollowUp")}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm hover:bg-hotel-gold-dark transition-colors"
            >
              <Printer size={16} />
              {t("print")}
            </button>
            <button
              onClick={handleExport}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-colors"
            >
              <FileSpreadsheet size={16} />
              {t("excel")}
            </button>
          </div>
        </div>
        <div className="bg-white rounded border-2 border-hotel-border p-4 flex gap-3">
          <div>
            <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
              {t("dateFrom")}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title={t("dateFrom")}
              className="border-2 border-hotel-border hover:border-hotel-border focus:border-hotel-gold focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors"
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
              className="border-2 border-hotel-border hover:border-hotel-border focus:border-hotel-gold focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors"
            />
          </div>
        </div>
        <div className="bg-white rounded border-2 border-hotel-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white border-b-2 border-hotel-border">
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
                    className="text-left px-4 py-3 font-medium text-hotel-text-secondary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-hotel-cream/50 transition-colors"
                >
                  <td className="px-4 py-3">{r.date_d}</td>
                  <td className="px-4 py-3">{r.libelle}</td>
                  <td className="px-4 py-3">{r.qty}</td>
                  <td className="px-4 py-3">{r.credit_1.toLocaleString()}</td>
                  <td className="px-4 py-3">{r.credit_2.toLocaleString()}</td>
                  <td className="px-4 py-3">{r.date_r || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${r.statut === "Approved" ? "bg-hotel-cream text-hotel-gold" : r.statut === "Rejected" ? "bg-hotel-cream text-hotel-gold" : "bg-hotel-cream text-hotel-gold"}`}
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
    </div>
  );
}



