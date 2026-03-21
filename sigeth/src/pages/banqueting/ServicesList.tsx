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

      {/* Master Table View - All Services */}
      <div className="bg-white rounded overflow-hidden print:border-hotel-border">
        {/* Header Section */}
        <div className="p-4 border-b border-hotel-border print:border-hotel-border bg-hotel-cream print:bg-white">
          <div className="text-sm font-semibold text-hotel-text-primary">
            <span className="inline-block w-32">{t("mPEName")}:</span>
            <span className="text-hotel-text-secondary">SIGETH Hotel Management</span>
          </div>
        </div>

        {/* Services Table */}
        <table className="w-full text-sm">
          <thead className="bg-hotel-navy text-white sticky top-0 print:bg-white print:text-black">
            <tr>
              <th className="text-left py-2 px-2 font-medium border-r border-hotel-border print:border-hotel-border">
                {t("lot")}
              </th>
              <th className="text-left py-2 px-2 font-medium border-r border-hotel-border print:border-hotel-border">
                {t("designation")}
              </th>
              <th className="text-left py-2 px-2 font-medium border-r border-hotel-border print:border-hotel-border">
                {t("nature")}
              </th>
              <th className="text-left py-2 px-2 font-medium border-r border-hotel-border print:border-hotel-border">
                {t("unity")}
              </th>
              <th className="text-center py-2 px-2 font-medium border-r border-hotel-border print:border-hotel-border">
                {t("qty")}
              </th>
              <th className="text-right py-2 px-2 font-medium border-r border-hotel-border print:border-hotel-border">
                {t("puv")}
              </th>
              <th className="text-right py-2 px-2 font-medium">
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
                    className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors print:border-hotel-border print:hover:bg-white"
                  >
                    <td className="py-2 px-2 font-medium text-hotel-text-primary border-r border-hotel-border print:border-hotel-border">
                      {s.lot}
                    </td>
                    <td className="py-2 px-2 text-hotel-text-primary border-r border-hotel-border print:border-hotel-border">
                      {s.item}
                    </td>
                    <td className="py-2 px-2 text-hotel-text-primary border-r border-hotel-border print:border-hotel-border">
                      {eventType}
                    </td>
                    <td className="py-2 px-2 text-hotel-text-primary border-r border-hotel-border print:border-hotel-border">
                      {s.unity}
                    </td>
                    <td className="py-2 px-2 text-center border-r border-hotel-border print:border-hotel-border">
                      {s.qty}
                    </td>
                    <td className="py-2 px-2 text-right font-medium border-r border-hotel-border print:border-hotel-border">
                      {s.puv.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-hotel-gold">
                      {(s.qty * s.puv).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-hotel-text-secondary text-center"
                >
                  {t("noRecords")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grouped by Event (for reference) */}
      <div className="space-y-4 print:hidden">
        <h2 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide mt-8">
          Services by Event
        </h2>
        {grouped.map((g) => (
          <div
            key={g.lot}
            className="bg-white rounded overflow-hidden"
          >
            <div className="bg-hotel-cream px-4 py-3 border-b border-hotel-border">
              <h3 className="font-semibold text-sm text-hotel-text-primary">
                {t("lot")} {g.lot} —{" "}
                {EVENT_TYPES.find((t) => t.value === g.nature)?.label ||
                  g.nature}
              </h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-hotel-navy text-white sticky top-0">
                <tr>
                  <th className="text-left py-2 px-2 font-medium">
                    {t("designation")}
                  </th>
                  <th className="text-left py-2 px-2 font-medium">
                    {t("unity")}
                  </th>
                  <th className="text-center py-2 px-2 font-medium">
                    {t("qty")}
                  </th>
                  <th className="text-right py-2 px-2 font-medium">
                    {t("puv")}
                  </th>
                  <th className="text-right py-2 px-2 font-medium">
                    {t("amount")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {g.services.map((s, i) => (
                  <tr
                    key={i}
                    className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-2">{s.item}</td>
                    <td className="py-2 px-2">{s.unity}</td>
                    <td className="py-2 px-2 text-center">{s.qty}</td>
                    <td className="py-2 px-2 text-right font-medium">
                      {s.puv.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right font-semibold">
                      {(s.qty * s.puv).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {g.services.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-hotel-text-secondary text-center"
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
  );
}
