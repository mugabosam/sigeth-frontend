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
    <div className="min-h-screen bg-gradient-to-br from-hotel-paper to-hotel-cream p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
          {t("dailyRoomReport")}
        </h1>
        <p className="text-sm text-hotel-text-secondary">{t("dailyRoomReportDesc")}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-colors"
        >
          <Printer size={16} />
          {t("print")}
        </button>
        <button
          onClick={handleExport}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-colors"
        >
          <FileSpreadsheet size={16} />
          {t("excel")}
        </button>
      </div>
      <div className="bg-white rounded border border-hotel-border p-4">
        <label className="block text-sm font-semibold text-hotel-text-primary mb-3">
          {t("selectStatus")}
        </label>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as RoomStatusCode | "")
          }
          title={t("selectStatus")}
          className="border-2 border-hotel-border hover:border-hotel-border focus:border-hotel-gold focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors w-full max-w-xs"
        >
          <option value="">{t("allStatuses")}</option>
          {statuses.map((s) => (
            <option key={s.code} value={s.code}>
              {s.code} — {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded border border-hotel-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white border-b-2 border-hotel-border">
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
                  className="text-left px-6 py-3 font-bold text-hotel-text-primary"
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
                className="border-b hover:bg-hotel-cream/50 transition-colors duration-150"
              >
                <td className="px-6 py-3 font-semibold text-hotel-gold">
                  {r.room_num}
                </td>
                <td className="px-6 py-3 text-hotel-text-primary">{r.designation}</td>
                <td className="px-6 py-3 text-hotel-text-primary">
                  {r.price_1.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-hotel-text-primary">
                  {r.price_2.toLocaleString()}
                </td>
                <td className="px-6 py-3">
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-hotel-cream text-hotel-gold">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-3 bg-gradient-to-r from-hotel-paper to-hotel-cream border-t-2 border-hotel-border text-sm font-semibold text-hotel-text-primary">
          {t("totalRooms")}:{" "}
          <span className="text-hotel-gold">{filtered.length}</span>
        </div>
      </div>
    </div>
  );
}



