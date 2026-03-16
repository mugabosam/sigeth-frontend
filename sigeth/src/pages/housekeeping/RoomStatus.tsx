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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
          {t("updateRoomStatus")}
        </h1>
        <p className="text-sm text-gray-600">{t("updateRoomStatusDesc")}</p>
      </div>
      {/* Category selection (CATROOM.dat browser) */}
      <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-6">
        <h3 className="text-sm font-semibold text-emerald-700 mb-4">
          {t("selectCategory")}
        </h3>
        <div className="flex gap-3 flex-wrap">
          {catrooms.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCat(c.code)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                selectedCat === c.code
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-600 shadow-md"
                  : "border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              {c.code} — {c.name}
            </button>
          ))}
        </div>
      </div>
      {/* Room status browser */}
      {selectedCat !== null && (
        <div className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
            <p className="text-sm text-gray-700 font-semibold">
              {t("roomsInCategory")}:{" "}
              <span className="text-emerald-700">
                {catrooms.find((c) => c.code === selectedCat)?.name}
              </span>{" "}
              — <span className="font-bold">{filteredRooms.length}</span>{" "}
              {t("rooms")}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-emerald-200">
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
                    className="text-left px-6 py-3 font-bold text-gray-700"
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
                  className="border-b hover:bg-emerald-50/50 cursor-pointer transition-colors duration-150"
                >
                  <td className="px-6 py-3 font-semibold text-emerald-600">
                    {r.room_num}
                  </td>
                  <td className="px-6 py-3 text-gray-700">{r.designation}</td>
                  <td className="px-6 py-3 text-gray-700">
                    {r.price_1.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {r.price_2.toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
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
                      className="border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2 text-sm font-medium transition-all"
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
