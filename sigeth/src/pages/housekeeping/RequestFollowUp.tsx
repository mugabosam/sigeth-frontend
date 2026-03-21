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
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-3">
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

      {/* Search/Filter Section */}
      <div className="bg-white rounded p-4 space-y-4">
        <h3 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide">
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
              className="border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
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
      </div>

      {/* Report Section */}
      <div className="bg-white rounded overflow-hidden print:border-black print:shadow-none">
        {/* Header Information */}
        <div className="p-4 border-b border-hotel-border print:border-black bg-hotel-cream print:bg-white space-y-3">
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
          <div className="text-center py-3 border-y border-hotel-border print:border-black">
            <h2 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide print:text-black">
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
          <thead className="bg-hotel-navy text-white sticky top-0 print:border-black print:bg-white">
            <tr>
              <th className="text-left py-2 px-2 font-medium border-r border-hotel-border print:border-black">
                {t("dateD")}
              </th>
              <th className="text-left py-2 px-2 font-medium border-r border-hotel-border print:border-black">
                {t("designation")}
              </th>
              <th className="text-left py-2 px-2 font-medium border-r border-hotel-border print:border-black">
                {t("unity")}
              </th>
              <th className="text-center py-2 px-2 font-medium border-r border-hotel-border print:border-black">
                {t("qty")}
              </th>
              <th className="text-right py-2 px-2 font-medium border-r border-hotel-border print:border-black">
                {t("credit1")}
              </th>
              <th className="text-right py-2 px-2 font-medium border-r border-hotel-border print:border-black">
                {t("credit2")}
              </th>
              <th className="text-left py-2 px-2 font-medium">
                {t("dateR")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((r, i) => (
                <tr
                  key={i}
                  className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors print:border-black print:hover:bg-white"
                >
                  <td className="py-2 px-2 border-r border-hotel-border print:border-black">
                    {r.date_d}
                  </td>
                  <td className="py-2 px-2 border-r border-hotel-border print:border-black">
                    {r.libelle}
                  </td>
                  <td className="py-2 px-2 border-r border-hotel-border print:border-black"></td>
                  <td className="py-2 px-2 text-center border-r border-hotel-border print:border-black">
                    {r.qty}
                  </td>
                  <td className="py-2 px-2 text-right font-medium border-r border-hotel-border print:border-black">
                    {r.credit_1.toLocaleString()}
                  </td>
                  <td className="py-2 px-2 text-right font-medium border-r border-hotel-border print:border-black">
                    {r.credit_2.toLocaleString()}
                  </td>
                  <td className="py-2 px-2">{r.date_r || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-2 px-2 text-hotel-text-secondary text-center"
                >
                  {t("noRecords")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legends */}
      <div className="bg-white rounded p-4 text-xs text-hotel-text-secondary print:text-hotel-text-primary">
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
  );
}
