import { useState } from "react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { RoomStatusCode } from "../../types";
import { housekeepingApi } from "../../services/sigethApi";

export default function RoomStatus() {
  const { t } = useLang();
  const { rooms, setRooms, catrooms, statuses } = useHotelData();
  const [selectedCat, setSelectedCat] = useState<number | null>(null);

  const filteredRooms =
    selectedCat !== null
      ? rooms.filter((r) => r.categorie === selectedCat)
      : [];

  const handleStatusChange = async (
    roomNum: string,
    newStatus: RoomStatusCode,
  ) => {
    try {
      const updated = await housekeepingApi.updateRoomStatus({
        room_num: roomNum,
        status_code: newStatus,
      });
      setRooms((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
    } catch {
      setRooms((prev) =>
        prev.map((r) =>
          r.room_num === roomNum ? { ...r, status: newStatus } : r,
        ),
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Category selection (CATROOM.dat browser) */}
      <div className="bg-white rounded p-4 space-y-4">
        <h3 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide">
          {t("selectCategory")}
        </h3>
        <div className="flex gap-3 flex-wrap">
          {catrooms.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCat(c.code)}
              className={`px-4 py-2 rounded text-sm font-medium border transition-colors ${
                selectedCat === c.code
                  ? "bg-hotel-gold text-white border-hotel-gold"
                  : "border-hotel-border text-hotel-text-primary hover:border-hotel-border hover:bg-hotel-cream"
              }`}
            >
              {c.code} — {c.name}
            </button>
          ))}
        </div>
      </div>
      {/* Room status browser */}
      {selectedCat !== null && (
        <div className="bg-white rounded overflow-hidden">
          <p className="text-sm font-semibold text-hotel-text-primary mb-2 uppercase tracking-wide px-4 pt-4">
            {t("roomsInCategory")}:{" "}
            <span className="text-hotel-gold">
              {catrooms.find((c) => c.code === selectedCat)?.name}
            </span>{" "}
            — <span className="font-bold">{filteredRooms.length}</span>{" "}
            {t("rooms")}
          </p>
          <table className="w-full text-sm">
            <thead className="bg-hotel-navy text-white sticky top-0">
              <tr>
                {[
                  t("roomNumber"),
                  t("designation"),
                  t("price1"),
                  t("price2"),
                  t("currentStatus"),
                  t("newStatus"),
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
              {filteredRooms.map((r) => (
                <tr
                  key={r.room_num}
                  className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors"
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
                  <td className="py-2 px-2">
                    <select
                      value={r.status}
                      onChange={(e) =>
                        handleStatusChange(
                          r.room_num,
                          e.target.value as RoomStatusCode,
                        )
                      }
                      title={t("currentStatus")}
                      className="border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
                    >
                      {statuses.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code} — {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
