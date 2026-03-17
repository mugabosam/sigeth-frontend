import { useState } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function RequestFollowUp({
  posteDefault = "Housekeeping",
}: {
  posteDefault?: string;
}) {
  const { t } = useLang();
  const { requisitions } = useHotelData();
  const [poste, setPoste] = useState(posteDefault);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = requisitions.filter((r) => {
    if (r.poste !== poste) return false;
    if (dateFrom && r.date_d < dateFrom) return false;
    if (dateTo && r.date_d > dateTo) return false;
    return true;
  });

  const handleExport = () => {
    const header = "Date_d,Designation,Unity,Qty,Credit_1,Credit_2,Date_r";
    const rows = filtered.map(
      (r) =>
        `${r.date_d},${r.libelle},,${r.qty},${r.credit_1},${r.credit_2},${r.date_r}`,
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Lrequest.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Page Title */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            {t("requestFollowUp")}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm hover:bg-gray-700 transition-colors"
            >
              <Printer size={16} />
              {t("print")}
            </button>
            <button
              onClick={handleExport}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors"
            >
              <FileSpreadsheet size={16} />
              {t("excel")}
            </button>
          </div>
        </div>

        {/* Search/Filter Section */}
        <div className="bg-white rounded border-2 border-emerald-200 p-4">
          <h3 className="text-sm font-semibold text-hotel-text-primary mb-4">
            {t("filters")}
          </h3>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("poste")}
              </label>
              <input
                type="text"
                value={poste}
                onChange={(e) => setPoste(e.target.value)}
                placeholder={t("poste")}
                className="border-2 border-hotel-border hover:border-hotel-border focus:border-emerald-500 focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
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
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
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
        </div>

        {/* Report Section */}
        <div className="bg-white rounded border-2 border-emerald-200 overflow-hidden print:border-black print:shadow-none">
          {/* Header Information */}
          <div className="p-4 border-b-2 border-emerald-200 print:border-black bg-emerald-50 print:bg-white space-y-3">
            <div className="grid grid-cols-2 gap-3 print:grid-cols-1 text-sm">
              <div>
                <span className="font-semibold text-hotel-text-primary">
                  {t("mPEName")}:
                </span>
                <span className="text-hotel-text-secondary ml-2">
                  SIGETH Hotel Management
                </span>
              </div>
              <div>
                <span className="font-semibold text-hotel-text-primary">
                  {t("address")}:
                </span>
                <span className="text-hotel-text-secondary ml-2">Kigali, Rwanda</span>
              </div>
              <div>
                <span className="font-semibold text-hotel-text-primary">
                  {t("phone")}:
                </span>
                <span className="text-hotel-text-secondary ml-2">+250 (0) 1234567</span>
              </div>
              <div>
                <span className="font-semibold text-hotel-text-primary">
                  {t("email")}:
                </span>
                <span className="text-hotel-text-secondary ml-2">info@sigeth.com</span>
              </div>
              <div>
                <span className="font-semibold text-hotel-text-primary">{t("tin")}:</span>
                <span className="text-hotel-text-secondary ml-2">101234567890</span>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center py-3 border-y border-emerald-300 print:border-black">
              <h2 className="text-base font-bold text-emerald-700 print:text-black">
                {t("requestFollowUp")}
              </h2>
            </div>

            {/* Filter Display */}
            <div className="grid grid-cols-3 gap-3 text-sm print:grid-cols-2">
              <div>
                <span className="font-semibold text-hotel-text-primary">
                  {t("poste")}:
                </span>
                <span className="text-hotel-text-secondary ml-2">{poste}</span>
              </div>
              {dateFrom && (
                <div>
                  <span className="font-semibold text-hotel-text-primary">
                    {t("dateFrom")}:
                  </span>
                  <span className="text-hotel-text-secondary ml-2">{dateFrom}</span>
                </div>
              )}
              {dateTo && (
                <div>
                  <span className="font-semibold text-hotel-text-primary">
                    {t("dateTo")}:
                  </span>
                  <span className="text-hotel-text-secondary ml-2">{dateTo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Requisitions Table */}
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-emerald-200 print:border-black print:bg-white">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("dateD")}
                </th>
                <th className="text-left px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("designation")}
                </th>
                <th className="text-left px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("unity")}
                </th>
                <th className="text-center px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("qty")}
                </th>
                <th className="text-right px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("credit1")}
                </th>
                <th className="text-right px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("credit2")}
                </th>
                <th className="text-left px-4 py-3 font-bold text-hotel-text-primary">
                  {t("dateR")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-hotel-border hover:bg-emerald-50/50 transition-colors print:border-black print:hover:bg-white"
                  >
                    <td className="px-4 py-3 border-r border-hotel-border print:border-black">
                      {r.date_d}
                    </td>
                    <td className="px-4 py-3 border-r border-hotel-border print:border-black">
                      {r.libelle}
                    </td>
                    <td className="px-4 py-3 border-r border-hotel-border print:border-black"></td>
                    <td className="px-4 py-3 text-center border-r border-hotel-border print:border-black">
                      {r.qty}
                    </td>
                    <td className="px-4 py-3 text-right font-medium border-r border-hotel-border print:border-black">
                      {r.credit_1.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium border-r border-hotel-border print:border-black">
                      {r.credit_2.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{r.date_r || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-3 text-gray-400 text-center"
                  >
                    {t("noRecords")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legends */}
        <div className="bg-white rounded p-4 border border-hotel-border print:border-black text-xs text-hotel-text-secondary print:text-hotel-text-primary">
          <p className="font-semibold mb-2">{t("legends")}:</p>
          <div className="space-y-1">
            <p>
              <strong>{t("dateD")}</strong> = {t("dateOfRequestLabel")}
            </p>
            <p>
              <strong>{t("dateR")}</strong> = {t("dateOfResponseLabel")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
