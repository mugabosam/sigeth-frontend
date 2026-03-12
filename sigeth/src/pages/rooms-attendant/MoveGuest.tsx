import { useState } from "react";
import { Search, ArrowRightLeft } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function MoveGuest() {
  const { t } = useLang();
  const { rooms, setRooms, setReservations, setSales } = useHotelData();
  const [oldRoom, setOldRoom] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [sourceRoom, setSourceRoom] = useState<(typeof rooms)[0] | null>(null);

  const handleSearch = () => {
    const found = rooms.find(
      (r) => r.room_num === oldRoom && r.status === "OCC",
    );
    if (found) setSourceRoom(found);
    else alert(t("roomNotFoundOrNotOccupied"));
  };

  const handleMove = () => {
    if (!sourceRoom || !newRoom) return;
    const target = rooms.find((r) => r.room_num === newRoom);
    if (!target || target.status !== "VC") {
      alert(t("targetRoomNotVacant"));
      return;
    }

    // Transfer guest data to new room, clear old room
    setRooms((prev) =>
      prev.map((r) => {
        if (r.room_num === sourceRoom.room_num)
          return {
            ...r,
            guest_name: "",
            twin_name: "",
            twin_num: 0,
            arrival_date: "",
            depart_date: "",
            qty: 0,
            deposit: 0,
            status: "VC" as const,
          };
        if (r.room_num === newRoom)
          return {
            ...r,
            guest_name: sourceRoom.guest_name,
            twin_name: sourceRoom.twin_name,
            twin_num: sourceRoom.twin_num,
            arrival_date: sourceRoom.arrival_date,
            depart_date: sourceRoom.depart_date,
            qty: sourceRoom.qty,
            puv: sourceRoom.puv,
            deposit: sourceRoom.deposit,
            status: "OCC" as const,
          };
        return r;
      }),
    );
    // Update RCS.dat room_num
    setReservations((prev) =>
      prev.map((r) =>
        r.room_num === sourceRoom.room_num ? { ...r, room_num: newRoom } : r,
      ),
    );
    // Update SALES.dat room_num
    setSales((prev) =>
      prev.map((s) =>
        s.room_num === sourceRoom.room_num ? { ...s, room_num: newRoom } : s,
      ),
    );
    setSourceRoom(null);
    setOldRoom("");
    setNewRoom("");
  };

  const vacantRooms = rooms.filter((r) => r.status === "VC");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t("moveGuest")}</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3">
          <input
            value={oldRoom}
            onChange={(e) => setOldRoom(e.target.value)}
            placeholder={t("currentRoomNumber")}
            className="border rounded-lg px-4 py-2 text-sm w-40"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
          >
            <Search size={16} />
            {t("search")}
          </button>
        </div>
      </div>
      {sourceRoom && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {t("moveGuestFromTo")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source room */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-red-700 mb-2">
                {t("currentRoom")}
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">{t("roomNumber")}:</span>{" "}
                  <strong>{sourceRoom.room_num}</strong>
                </p>
                <p>
                  <span className="text-gray-500">{t("guestName")}:</span>{" "}
                  <strong>{sourceRoom.guest_name}</strong>
                </p>
                <p>
                  <span className="text-gray-500">{t("twinName")}:</span>{" "}
                  {sourceRoom.twin_name || "—"}
                </p>
                <p>
                  <span className="text-gray-500">{t("arrivalDate")}:</span>{" "}
                  {sourceRoom.arrival_date}
                </p>
                <p>
                  <span className="text-gray-500">{t("departDate")}:</span>{" "}
                  {sourceRoom.depart_date}
                </p>
              </div>
            </div>
            {/* Target room selection */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-green-700 mb-2">
                {t("newRoom")}
              </h4>
              <select
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                title={t("newRoom")}
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              >
                <option value="">{t("selectRoom")}</option>
                {vacantRooms.map((r) => (
                  <option key={r.room_num} value={r.room_num}>
                    {r.room_num} — {r.designation}
                  </option>
                ))}
              </select>
              {newRoom && (
                <div className="space-y-1 text-sm">
                  {(() => {
                    const r = rooms.find((r) => r.room_num === newRoom);
                    return r ? (
                      <>
                        <p>
                          <span className="text-gray-500">
                            {t("designation")}:
                          </span>{" "}
                          {r.designation}
                        </p>
                        <p>
                          <span className="text-gray-500">{t("price1")}:</span>{" "}
                          {r.price_1.toLocaleString()}
                        </p>
                      </>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center pt-4 border-t">
            <button
              onClick={handleMove}
              disabled={!newRoom}
              className="bg-amber-500 text-white px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-amber-600 disabled:opacity-50"
            >
              <ArrowRightLeft size={18} />
              {t("confirmMove")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
