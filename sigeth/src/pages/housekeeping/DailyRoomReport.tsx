import { useState } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { RoomStatusCode } from "../../types";

export default function DailyRoomReport() {
  const { t } = useLang();
  const { rooms, statuses } = useHotelData();
  const [statusFilter, setStatusFilter] = useState<RoomStatusCode | "">("");

  const filtered = statusFilter
    ? rooms.filter((r) => r.status === statusFilter)
    : rooms;

  const handleExport = () => {
    const header = "Room_num,Designation,Price_1,Price_2,Status";
    const rows = filtered.map(
      (r) =>
        `${r.room_num},${r.designation},${r.price_1},${r.price_2},${r.status}`,
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Ldaily_r.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
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
      <div className="bg-white rounded p-4">
        <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
          {t("selectStatus")}
        </label>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as RoomStatusCode | "")
          }
          title={t("selectStatus")}
          className="border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold w-full max-w-xs"
        >
          <option value="">{t("allStatuses")}</option>
          {statuses.map((s) => (
            <option key={s.code} value={s.code}>
              {s.code} — {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-hotel-navy text-white sticky top-0">
            <tr>
              {[
                t("roomNum"),
                t("designation"),
                t("price1"),
                t("price2"),
                t("status"),
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
            {filtered.map((r) => (
              <tr
                key={r.room_num}
                className="border-b border-hotel-border hover:bg-hotel-cream transition-colors"
              >
                <td className="py-2 px-2 font-medium text-hotel-text-primary">
                  {r.room_num}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">{r.designation}</td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {r.price_1.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {r.price_2.toLocaleString()}
                </td>
                <td className="py-2 px-2">
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-hotel-cream text-hotel-gold">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-2 py-2 border-t border-hotel-border text-sm font-semibold text-hotel-text-primary">
          {t("totalRooms")}:{" "}
          <span className="text-hotel-gold">{filtered.length}</span>
        </div>
      </div>
    </div>
  );
}
