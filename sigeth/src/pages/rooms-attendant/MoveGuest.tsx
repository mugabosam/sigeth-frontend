import { useState } from "react";
import { Search, ArrowRightLeft, AlertCircle, XCircle, X } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { useNotification } from "../../hooks/useNotification";

export default function MoveGuest() {
  const { t } = useLang();
  const { rooms, setRooms, setReservations, setSales } = useHotelData();
  const { addNotification } = useNotification();
  const [oldRoom, setOldRoom] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [sourceRoom, setSourceRoom] = useState<(typeof rooms)[0] | null>(null);
  const [roomSuggestions, setRoomSuggestions] = useState<typeof rooms>([]);
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);
  const [newRoomSuggestions, setNewRoomSuggestions] = useState<typeof rooms>(
    [],
  );
  const [showNewRoomSuggestions, setShowNewRoomSuggestions] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<"search" | "move" | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [targetRoom, setTargetRoom] = useState<(typeof rooms)[0] | null>(null);

  const handleOldRoomChange = (value: string) => {
    setOldRoom(value);
    if (!value.trim()) {
      setRoomSuggestions([]);
      setShowRoomSuggestions(false);
      return;
    }
    const q = value.toLowerCase();
    const matches = rooms
      .filter(
        (r) =>
          r.status === "OCC" &&
          (r.room_num.toLowerCase().includes(q) ||
            r.guest_name.toLowerCase().includes(q)),
      )
      .slice(0, 8);
    setRoomSuggestions(matches);
    setShowRoomSuggestions(true);
  };

  const handleSelectOldRoom = (r: (typeof rooms)[0]) => {
    setSourceRoom(r);
    setOldRoom(r.room_num);
    setRoomSuggestions([]);
    setShowRoomSuggestions(false);
  };

  const handleNewRoomChange = (value: string) => {
    setNewRoom(value);
    if (!value.trim()) {
      setNewRoomSuggestions([]);
      setShowNewRoomSuggestions(false);
      return;
    }
    const q = value.toLowerCase();
    const matches = rooms
      .filter((r) => r.status === "VC" && r.room_num.toLowerCase().includes(q))
      .slice(0, 8);
    setNewRoomSuggestions(matches);
    setShowNewRoomSuggestions(true);
  };

  const handleSelectNewRoom = (r: (typeof rooms)[0]) => {
    setNewRoom(r.room_num);
    setNewRoomSuggestions([]);
    setShowNewRoomSuggestions(false);
  };

  const handleSearch = () => {
    const found = rooms.find(
      (r) => r.room_num === oldRoom && r.status === "OCC",
    );
    if (found) {
      setSourceRoom(found);
      setError("");
      setErrorType(null);
    } else {
      setError(t("roomNotFoundOrNotOccupied"));
      setErrorType("search");
      setSourceRoom(null);
    }
    setRoomSuggestions([]);
    setShowRoomSuggestions(false);
  };

  const handleMove = () => {
    if (!sourceRoom || !newRoom) {
      setError("Please select both source and target rooms");
      setErrorType("move");
      return;
    }
    const target = rooms.find((r) => r.room_num === newRoom);
    if (!target || target.status !== "VC") {
      setError(t("targetRoomNotVacant"));
      setErrorType("move");
      return;
    }

    setTargetRoom(target);
    setShowConfirmation(true);
  };

  const confirmMove = () => {
    if (!sourceRoom || !targetRoom) return;

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
        if (r.room_num === targetRoom.room_num)
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
        r.room_num === sourceRoom.room_num
          ? { ...r, room_num: targetRoom.room_num }
          : r,
      ),
    );
    // Update SALES.dat room_num
    setSales((prev) =>
      prev.map((s) =>
        s.room_num === sourceRoom.room_num
          ? { ...s, room_num: targetRoom.room_num }
          : s,
      ),
    );
    // Trigger notification
    addNotification(
      `Guest ${sourceRoom.guest_name} moved from room ${sourceRoom.room_num} to ${targetRoom.room_num}`,
      "Rooms Attendant",
      "success",
    );
    setSourceRoom(null);
    setOldRoom("");
    setNewRoom("");
    setError("");
    setErrorType(null);
    setShowConfirmation(false);
    setTargetRoom(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t("moveGuest")}
        </h1>
      </div>

      {error && (
        <div
          className={`rounded-2xl shadow-md border-l-4 p-6 flex items-start justify-between ${
            errorType === "search"
              ? "bg-red-50 border-l-red-500 border border-red-200"
              : errorType === "move"
                ? "bg-orange-50 border-l-orange-500 border border-orange-200"
                : "bg-yellow-50 border-l-yellow-500 border border-yellow-200"
          }`}
        >
          <div className="flex items-start gap-4">
            {errorType === "search" ? (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4
                className={`font-bold text-lg mb-1 ${
                  errorType === "search"
                    ? "text-red-800"
                    : errorType === "move"
                      ? "text-orange-800"
                      : "text-yellow-800"
                }`}
              >
                {errorType === "search"
                  ? "Search Error"
                  : errorType === "move"
                    ? "Move Error"
                    : "Error"}
              </h4>
              <p
                className={`text-sm ${
                  errorType === "search"
                    ? "text-red-700"
                    : errorType === "move"
                      ? "text-orange-700"
                      : "text-yellow-700"
                }`}
              >
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setError("");
              setErrorType(null);
            }}
            title="Close error message"
            className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
              errorType === "search"
                ? "hover:bg-red-200 text-red-600"
                : errorType === "move"
                  ? "hover:bg-orange-200 text-orange-600"
                  : "hover:bg-yellow-200 text-yellow-600"
            }`}
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3">
          <div className="relative">
            <input
              value={oldRoom}
              onChange={(e) => handleOldRoomChange(e.target.value)}
              placeholder={t("currentRoomNumber")}
              title={t("currentRoomNumber")}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {showRoomSuggestions && roomSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {roomSuggestions.map((r) => (
                  <button
                    key={r.room_num}
                    onClick={() => handleSelectOldRoom(r)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b last:border-b-0 text-sm"
                  >
                    <div className="font-medium text-gray-800">
                      {r.room_num}
                    </div>
                    <div className="text-xs text-gray-500">{r.guest_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-all transform hover:scale-105"
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
              <div className="relative mb-3">
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => handleNewRoomChange(e.target.value)}
                  placeholder={t("selectRoom")}
                  title={t("selectRoom")}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {showNewRoomSuggestions && newRoomSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {newRoomSuggestions.map((r) => (
                      <button
                        key={r.room_num}
                        onClick={() => handleSelectNewRoom(r)}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 transition-colors border-b last:border-b-0 text-sm"
                      >
                        <div className="font-medium text-gray-800">
                          {r.room_num}
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.designation}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

      {showConfirmation && sourceRoom && targetRoom && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mx-auto">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-gray-900">Are you sure?</h2>
              <p className="text-sm text-gray-600">
                You are about to move a guest from one room to another. This
                action will update all related records.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">From:</span>
                <span className="font-bold text-gray-900">
                  {sourceRoom.room_num}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-700">
                  Guest:
                </span>
                <span className="font-bold text-gray-900">
                  {sourceRoom.guest_name}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-700">To:</span>
                <span className="font-bold text-gray-900">
                  {targetRoom.room_num}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setTargetRoom(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMove}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
