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

export default function ServicesList() {
  const { t } = useLang();
  const { banquetServices, events } = useHotelData();

  // Group by lot
  const grouped = events.map((e) => ({
    ...e,
    services: banquetServices.filter((b) => b.lot === e.lot),
  }));

  const handleExport = () => {
    const header = "Lot,EventType,Item,Unity,Qty,PUV,Amount";
    const rows = banquetServices.map((b) => {
      const event = events.find((e) => e.lot === b.lot);
      const eventType =
        EVENT_TYPES.find((t) => t.value === event?.nature)?.label ||
        event?.nature ||
        "Unknown";
      return `${b.lot},${eventType},${b.item},${b.unity},${b.qty},${b.puv},${b.qty * b.puv}`;
    });
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Lbanquet.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            {t("servicesList")}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-700 transition-all"
            >
              <Printer size={16} />
              {t("print")}
            </button>
            <button
              onClick={handleExport}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all"
            >
              <FileSpreadsheet size={16} />
              {t("excel")}
            </button>
          </div>
        </div>

        {/* Master Table View - All Services */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 overflow-hidden print:border-gray-400">
          {/* Header Section */}
          <div className="p-4 border-b-2 border-emerald-200 print:border-gray-400 bg-emerald-50 print:bg-white">
            <div className="text-sm font-semibold text-gray-800">
              <span className="inline-block w-32">{t("mPEName")}:</span>
              <span className="text-gray-600">SIGETH Hotel Management</span>
            </div>
          </div>

          {/* Services Table */}
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-emerald-200 print:border-gray-400 print:bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-gray-700 border-r border-gray-300 print:border-gray-400">
                  {t("lot")}
                </th>
                <th className="text-left px-4 py-3 font-bold text-gray-700 border-r border-gray-300 print:border-gray-400">
                  {t("designation")}
                </th>
                <th className="text-left px-4 py-3 font-bold text-gray-700 border-r border-gray-300 print:border-gray-400">
                  {t("nature")}
                </th>
                <th className="text-left px-4 py-3 font-bold text-gray-700 border-r border-gray-300 print:border-gray-400">
                  {t("unity")}
                </th>
                <th className="text-center px-4 py-3 font-bold text-gray-700 border-r border-gray-300 print:border-gray-400">
                  {t("qty")}
                </th>
                <th className="text-right px-4 py-3 font-bold text-gray-700 border-r border-gray-300 print:border-gray-400">
                  {t("puv")}
                </th>
                <th className="text-right px-4 py-3 font-bold text-gray-700">
                  {t("amount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {banquetServices.length > 0 ? (
                banquetServices.map((s, i) => {
                  const event = events.find((e) => e.lot === s.lot);
                  const eventType =
                    EVENT_TYPES.find((t) => t.value === event?.nature)?.label ||
                    event?.nature ||
                    "Unknown";
                  return (
                    <tr
                      key={i}
                      className="border-b border-gray-200 hover:bg-emerald-50/50 transition-colors print:border-gray-300 print:hover:bg-white"
                    >
                      <td className="px-4 py-3 font-medium border-r border-gray-200 print:border-gray-300">
                        {s.lot}
                      </td>
                      <td className="px-4 py-3 text-gray-700 border-r border-gray-200 print:border-gray-300">
                        {s.item}
                      </td>
                      <td className="px-4 py-3 text-gray-700 border-r border-gray-200 print:border-gray-300">
                        {eventType}
                      </td>
                      <td className="px-4 py-3 text-gray-700 border-r border-gray-200 print:border-gray-300">
                        {s.unity}
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-200 print:border-gray-300">
                        {s.qty}
                      </td>
                      <td className="px-4 py-3 text-right font-medium border-r border-gray-200 print:border-gray-300">
                        {s.puv.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                        {(s.qty * s.puv).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
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

        {/* Grouped by Event (for reference) */}
        <div className="space-y-6 print:hidden">
          <h2 className="text-xl font-semibold text-gray-800 mt-8">
            Services by Event
          </h2>
          {grouped.map((g) => (
            <div
              key={g.lot}
              className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 overflow-hidden"
            >
              <div className="bg-emerald-50 px-4 py-3 border-b-2 border-emerald-200">
                <h3 className="font-semibold text-sm text-gray-800">
                  {t("lot")} {g.lot} —{" "}
                  {EVENT_TYPES.find((t) => t.value === g.nature)?.label ||
                    g.nature}
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-emerald-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      {t("designation")}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      {t("unity")}
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">
                      {t("qty")}
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      {t("puv")}
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">
                      {t("amount")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {g.services.map((s, i) => (
                    <tr
                      key={i}
                      className="border-b hover:bg-emerald-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">{s.item}</td>
                      <td className="px-4 py-3">{s.unity}</td>
                      <td className="px-4 py-3 text-center">{s.qty}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {s.puv.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {(s.qty * s.puv).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {g.services.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-3 text-gray-400 text-center"
                      >
                        {t("noRecords")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
