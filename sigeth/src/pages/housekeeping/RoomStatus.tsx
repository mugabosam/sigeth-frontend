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
    <div className="min-h-screen bg-gradient-to-br from-hotel-paper to-hotel-cream p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
          {t("updateRoomStatus")}
        </h1>
        <p className="text-sm text-hotel-text-secondary">{t("updateRoomStatusDesc")}</p>
      </div>
      {/* Category selection (CATROOM.dat browser) */}
      <div className="bg-white rounded border border-hotel-border p-4">
        <h3 className="text-sm font-semibold text-hotel-gold mb-4">
          {t("selectCategory")}
        </h3>
        <div className="flex gap-3 flex-wrap">
          {catrooms.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCat(c.code)}
              className={`px-4 py-2.5 rounded text-sm font-semibold border-2 transition-colors ${
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
        <div className="bg-white rounded border border-hotel-border overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-hotel-paper to-hotel-cream border-b border-hotel-border">
            <p className="text-sm text-hotel-text-primary font-semibold">
              {t("roomsInCategory")}:{" "}
              <span className="text-hotel-gold">
                {catrooms.find((c) => c.code === selectedCat)?.name}
              </span>{" "}
              — <span className="font-bold">{filteredRooms.length}</span>{" "}
              {t("rooms")}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-white border-b-2 border-hotel-border">
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
                    className="text-left px-6 py-3 font-bold text-hotel-text-primary"
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
                  className="border-b hover:bg-hotel-cream/50 cursor-pointer transition-colors duration-150"
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
                  <td className="px-6 py-3">
                    <select
                      value={r.status}
                      onChange={(e) =>
                        handleStatusChange(
                          r.room_num,
                          e.target.value as RoomStatusCode,
                        )
                      }
                      title={t("currentStatus")}
                      className="border-2 border-hotel-border hover:border-hotel-border focus:border-hotel-gold focus:outline-none rounded px-3 py-2 text-sm font-medium transition-colors"
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



