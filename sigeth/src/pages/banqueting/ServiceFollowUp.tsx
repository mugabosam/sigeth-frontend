import { useState } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

// Predefined event types per Banqueting specifications
const EVENT_TYPES = [
  { value: "Conference", label: "Conferences" },
  { value: "Seminar", label: "Seminars" },
  { value: "Wedding", label: "Weddings" },
  { value: "Celebration", label: "Celebrations" },
  { value: "Evening", label: "Evenings" },
  { value: "Concert", label: "Concerts" },
  { value: "Dinner", label: "Dinners" },
  { value: "SportsActivity", label: "Sports Activities" },
];

export default function ServiceFollowUp() {
  const { t } = useLang();
  const { jbanquet, events } = useHotelData();
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
    const header = "Date,Lot,Item,Nature,Unity,Qty,Price,Total";
    const rows = filtered.map((j) => {
      const ev = events.find((e) => e.lot === j.lot);
      const nature = EVENT_TYPES.find((t) => t.value === ev?.nature)?.label || ev?.nature || j.lot;
      return `${j.date},${j.lot},${j.item},${nature},${j.unity},${j.qty},${j.price},${j.total}`;
    });
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Ljbanquet.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Page Title */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            {t("serviceFollowUp")}
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
                {t("groupName")} / {t("selectGroup")}
              </label>
              <input
                type="text"
                value={groupQ}
                onChange={(e) => setGroupQ(e.target.value)}
                placeholder={t("searchGroup")}
                className="border-2 border-hotel-border hover:border-hotel-border focus:border-emerald-500 focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("arrivalDateLabel")}
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
                {t("departureDateLabel")}
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
            </div>
            <div className="text-center py-3 border-y border-emerald-300 print:border-black">
              <h2 className="text-base font-bold text-emerald-700 print:text-black">
                {t("serviceFollowUp")}
              </h2>
            </div>
            {groupQ && (
              <div className="grid grid-cols-3 gap-3 text-sm print:grid-cols-2">
                <div>
                  <span className="font-semibold text-hotel-text-primary">
                    {t("groupName")}:
                  </span>
                  <span className="text-hotel-text-secondary ml-2">{groupQ}</span>
                </div>
                {dateFrom && (
                  <div>
                    <span className="font-semibold text-hotel-text-primary">
                      {t("arrivalDateLabel")}:
                    </span>
                    <span className="text-hotel-text-secondary ml-2">{dateFrom}</span>
                  </div>
                )}
                {dateTo && (
                  <div>
                    <span className="font-semibold text-hotel-text-primary">
                      {t("departureDateLabel")}:
                    </span>
                    <span className="text-hotel-text-secondary ml-2">{dateTo}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Services Table */}
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-emerald-200 print:border-black print:bg-white">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("date")}
                </th>
                <th className="text-left px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("lot")}
                </th>
                <th className="text-left px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("item")}
                </th>
                <th className="text-left px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("nature")}
                </th>
                <th className="text-left px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("unity")}
                </th>
                <th className="text-center px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("qty")}
                </th>
                <th className="text-right px-4 py-3 font-bold text-hotel-text-primary border-r border-hotel-border print:border-black">
                  {t("puv")}
                </th>
                <th className="text-right px-4 py-3 font-bold text-hotel-text-primary">
                  {t("amount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((j, i) => (
                  <tr
                    key={i}
                    className="border-b border-hotel-border hover:bg-emerald-50/50 transition-colors print:border-black print:hover:bg-white"
                  >
                    <td className="px-4 py-3 border-r border-hotel-border print:border-black">
                      {j.date}
                    </td>
                    <td className="px-4 py-3 border-r border-hotel-border print:border-black font-medium">
                      {j.lot}
                    </td>
                    <td className="px-4 py-3 border-r border-hotel-border print:border-black">
                      {j.item}
                    </td>
                    <td className="px-4 py-3 border-r border-hotel-border print:border-black">
                      {(() => {
                        const ev = events.find((e) => e.lot === j.lot);
                        return EVENT_TYPES.find((t) => t.value === ev?.nature)?.label || ev?.nature || j.lot;
                      })()}
                    </td>
                    <td className="px-4 py-3 border-r border-hotel-border print:border-black">
                      {j.unity}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-hotel-border print:border-black">
                      {j.qty}
                    </td>
                    <td className="px-4 py-3 text-right font-medium border-r border-hotel-border print:border-black">
                      {j.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700 print:text-black">
                      {j.total.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-3 text-gray-400 text-center"
                  >
                    {t("noRecords")}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-emerald-50 border-t-2 border-emerald-200 print:border-black print:bg-white">
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-3 font-semibold text-right border-r border-hotel-border print:border-black"
                >
                  {t("grandTotal")}
                </td>
                <td className="px-4 py-3 font-bold text-emerald-700 text-right print:text-black">
                  {grandTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
