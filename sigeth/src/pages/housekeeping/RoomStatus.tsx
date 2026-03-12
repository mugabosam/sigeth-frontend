import { useState } from "react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { RoomStatusCode } from "../../types";

export default function RoomStatus() {
  const { t } = useLang();
  const { rooms, setRooms, catrooms, statuses } = useHotelData();
  const [selectedCat, setSelectedCat] = useState<number | null>(null);

  const filteredRooms =
    selectedCat !== null
      ? rooms.filter((r) => r.categorie === selectedCat)
      : [];

  const handleStatusChange = (roomNum: string, newStatus: RoomStatusCode) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.room_num === roomNum ? { ...r, status: newStatus } : r,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {t("updateRoomStatus")}
      </h1>
      {/* Category selection (CATROOM.dat browser) */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">
          {t("selectCategory")}
        </h3>
        <div className="flex gap-3 flex-wrap">
          {catrooms.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCat(c.code)}
              className={`px-4 py-2 rounded-lg text-sm border ${selectedCat === c.code ? "bg-amber-500 text-white border-amber-500" : "hover:bg-gray-50"}`}
            >
              {c.code} — {c.name}
            </button>
          ))}
        </div>
      </div>
      {/* Room status browser */}
      {selectedCat !== null && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <p className="text-sm text-gray-600">
              {t("roomsInCategory")}:{" "}
              <strong>
                {catrooms.find((c) => c.code === selectedCat)?.name}
              </strong>{" "}
              — {filteredRooms.length} {t("rooms")}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
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
                    className="text-left px-4 py-3 font-medium text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((r) => (
                <tr key={r.room_num} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.room_num}</td>
                  <td className="px-4 py-3">{r.designation}</td>
                  <td className="px-4 py-3">{r.price_1.toLocaleString()}</td>
                  <td className="px-4 py-3">{r.price_2.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) =>
                        handleStatusChange(
                          r.room_num,
                          e.target.value as RoomStatusCode,
                        )
                      }
                      title={t("currentStatus")}
                      className="border rounded-lg px-3 py-1.5 text-sm"
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
