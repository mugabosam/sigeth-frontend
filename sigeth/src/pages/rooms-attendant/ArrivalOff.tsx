import { useState, useMemo } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function ArrivalOff() {
  const { t } = useLang();
  const { reservationArchive } = useHotelData();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [guestSearch, setGuestSearch] = useState("");

  const filtered = useMemo(() => {
    return reservationArchive.filter((r) => {
      if (dateFrom && r.departure_date < dateFrom) return false;
      if (dateTo && r.departure_date > dateTo) return false;
      if (
        guestSearch &&
        !r.guest_name.toLowerCase().includes(guestSearch.toLowerCase())
      )
        return false;
      return true;
    });
  }, [reservationArchive, dateFrom, dateTo, guestSearch]);

  const calcNightNum = (arrivalDate: string, departureDate: string) => {
    const a = new Date(arrivalDate);
    const d = new Date(departureDate);
    return Math.max(Math.round((d.getTime() - a.getTime()) / 86400000), 0);
  };

  const exportCSV = () => {
    const headers = [
      "room_num",
      "guest_name",
      "phone",
      "email",
      "arrival_date",
      "departure_date",
      "adulte",
      "children",
      "puv",
      "night_num",
    ];
    const rows = filtered.map((r) =>
      [
        r.room_num,
        r.guest_name,
        r.phone,
        r.email,
        r.arrival_date,
        r.departure_date,
        r.adulte,
        r.children,
        r.puv,
        calcNightNum(r.arrival_date, r.departure_date),
      ].join(","),
    );
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Larrival_off.csv";
    a.click();
  };

  return (
    <div className="space-y-4 p-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white border border-hotel-border rounded p-4 p-4 rounded border border-hotel-border">
        <div>
          <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
            {t("arrivalOff")}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded flex items-center gap-2 text-sm font-medium hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-colors duration-200"
          >
            <Printer size={18} />
            {t("print")}
          </button>
          <button
            onClick={exportCSV}
            className="border-2 border-hotel-border text-hotel-text-primary px-6 py-3 rounded flex items-center gap-2 text-sm font-medium bg-hotel-cream hover:bg-hotel-cream hover:shadow-lg transition-colors duration-200"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded border border-hotel-border p-4">
        <h3 className="text-base font-bold text-hotel-text-primary mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full" />
          {t("filters")}
        </h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-hotel-text-secondary uppercase tracking-wide">
              {t("dateFrom")}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="From Date"
              className="border border-hotel-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-hotel-gold"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-hotel-text-secondary uppercase tracking-wide">
              {t("dateTo")}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="To Date"
              className="border border-hotel-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-hotel-gold"
            />
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-hotel-text-secondary uppercase tracking-wide">
              {t("guestName")}
            </label>
            <input
              value={guestSearch}
              onChange={(e) => setGuestSearch(e.target.value)}
              placeholder={t("guestName")}
              className="border border-hotel-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-hotel-gold"
            />
          </div>
        </div>
      </div>

      <div
        id="report-output"
        className="bg-white rounded border border-hotel-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b-2 border-hotel-border bg-white border border-hotel-border rounded p-4">
          <h2 className="text-base font-bold text-hotel-text-primary">
            Checked-Out Guests Report
          </h2>
          <p className="text-xs text-hotel-text-secondary mt-1">
            {new Date().toLocaleDateString()} •{" "}
            {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-hotel-gold to-hotel-gold-dark">
                {[
                  "Room",
                  "Guest Name",
                  "Phone",
                  "Email",
                  "Arrival",
                  "Departure",
                  "Adults",
                  "Children",
                  "Rate/Day",
                  "Nights",
                ].map((h) => (
                  <th
                    key={h}
                    className="border border-hotel-border px-3 py-2 text-left font-bold text-xs text-white"
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
                  className="border-b border-hotel-border hover:bg-hotel-cream transition-colors"
                >
                  <td className="border border-hotel-border px-3 py-2 font-semibold text-hotel-text-primary">
                    {r.room_num}
                  </td>
                  <td className="border border-hotel-border px-3 py-2 text-hotel-text-primary font-medium">
                    {r.guest_name}
                  </td>
                  <td className="border border-hotel-border px-3 py-2 text-hotel-text-primary">
                    {r.phone}
                  </td>
                  <td className="border border-hotel-border px-3 py-2 text-hotel-text-primary">
                    {r.email}
                  </td>
                  <td className="border border-hotel-border px-3 py-2 text-hotel-text-primary font-mono text-xs">
                    {r.arrival_date}
                  </td>
                  <td className="border border-hotel-border px-3 py-2 text-hotel-text-primary font-mono text-xs">
                    {r.departure_date}
                  </td>
                  <td className="border border-hotel-border px-3 py-2 text-center font-semibold">
                    {r.adulte}
                  </td>
                  <td className="border border-hotel-border px-3 py-2 text-center font-semibold">
                    {r.children}
                  </td>
                  <td className="border border-hotel-border px-3 py-2 text-right font-semibold text-hotel-text-primary">
                    {r.puv.toLocaleString()}
                  </td>
                  <td className="border border-hotel-border px-3 py-2 text-center font-bold text-hotel-gold">
                    {calcNightNum(r.arrival_date, r.departure_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #report-output, #report-output * { visibility: visible !important; }
          #report-output { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
        }
      `}</style>
    </div>
  );
}


