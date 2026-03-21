import { useState, useMemo } from "react";

import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

const today = () => new Date().toISOString().slice(0, 10);

export default function ArrivalOn() {
  const { t } = useLang();
  const { reservations } = useHotelData();
  const [statusFilter, setStatusFilter] = useState<"all" | "0" | "1">("0");
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState("");
  const [guestSearch, setGuestSearch] = useState("");

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (statusFilter !== "all" && r.status !== Number(statusFilter))
        return false;
      if (dateFrom && r.arrival_date < dateFrom) return false;
      if (dateTo && r.arrival_date > dateTo) return false;
      if (
        guestSearch &&
        !r.guest_name.toLowerCase().includes(guestSearch.toLowerCase())
      )
        return false;
      return true;
    });
  }, [reservations, statusFilter, dateFrom, dateTo, guestSearch]);


  return (
    <div className="space-y-4 p-4">
      {/* Filters */}
      <div className="bg-white rounded p-4">
        <h3 className="text-base font-bold text-hotel-text-primary mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full" />
          {t("filters")}
        </h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-hotel-text-secondary uppercase tracking-wide">
              {t("status")}
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "0" | "1")
              }
              title="Status Filter"
              className="border border-hotel-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-hotel-gold"
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="0">{t("statusOpen")}</option>
              <option value="1">{t("statusClosed")}</option>
            </select>
          </div>
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
        className="bg-white rounded overflow-hidden"
      >
        <div className="px-6 py-4 border-b-2 border-hotel-border bg-white rounded p-4">
          <h2 className="text-base font-bold text-hotel-text-primary">
            Checked-In Guests Report
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
                    {r.depart_date}
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
                    {(() => {
                      const a = new Date(r.arrival_date);
                      const d = new Date(r.depart_date);
                      return Math.max(
                        Math.round((d.getTime() - a.getTime()) / 86400000),
                        0,
                      );
                    })()}
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


