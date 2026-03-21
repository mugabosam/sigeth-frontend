import { useState } from "react";
import { Search, ArrowRightLeft, AlertCircle, XCircle, X } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { useNotification } from "../../hooks/useNotification";
import { frontOfficeApi } from "../../services/sigethApi";

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

  const confirmMove = async () => {
    if (!sourceRoom || !targetRoom) return;

    try {
      const moved = await frontOfficeApi.moveGuest({
        old_room_num: sourceRoom.room_num,
        new_room_num: targetRoom.room_num,
      });

      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === moved.old_room.id) return moved.old_room;
          if (r.id === moved.new_room.id) return moved.new_room;
          return r;
        }),
      );
    } catch (error) {
      setError(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : t("targetRoomNotVacant"),
      );
      setErrorType("move");
      return;
    }
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
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white border border-hotel-border rounded p-4 p-4 rounded border border-hotel-border">
        <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
          {t("moveGuest")}
        </h1>
      </div>

      {error && (
        <div
          className={`rounded border-l-4 p-4 flex items-start justify-between ${
            errorType === "search"
              ? "bg-hotel-cream border-l-red-500 border border-hotel-border"
              : errorType === "move"
                ? "bg-hotel-cream border-l-hotel-gold border border-hotel-border"
                : "bg-hotel-cream border-l-hotel-gold border border-hotel-border"
          }`}
        >
          <div className="flex items-start gap-3">
            {errorType === "search" ? (
              <AlertCircle className="w-6 h-6 text-hotel-gold flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-hotel-gold flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4
                className={`font-bold text-base mb-1 ${
                  errorType === "search"
                    ? "text-hotel-gold"
                    : errorType === "move"
                      ? "text-hotel-gold"
                      : "text-hotel-gold"
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
                    ? "text-hotel-gold"
                    : errorType === "move"
                      ? "text-hotel-gold"
                      : "text-hotel-gold"
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
            className={`flex-shrink-0 p-1 rounded transition-colors ${
              errorType === "search"
                ? "hover:bg-hotel-paper text-hotel-gold"
                : errorType === "move"
                  ? "hover:bg-hotel-paper text-hotel-gold"
                  : "hover:bg-hotel-paper text-hotel-gold"
            }`}
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="bg-white rounded border border-hotel-border p-4">
        <h3 className="text-base font-bold text-hotel-text-primary mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full" />
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3">
          <div className="relative">
            <input
              value={oldRoom}
              onChange={(e) => handleOldRoomChange(e.target.value)}
              placeholder={t("currentRoomNumber")}
              title={t("currentRoomNumber")}
              className="border border-hotel-border rounded px-4 py-2 text-sm w-40 focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {showRoomSuggestions && roomSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-hotel-border rounded z-50 max-h-48 overflow-y-auto">
                {roomSuggestions.map((r) => (
                  <button
                    key={r.room_num}
                    onClick={() => handleSelectOldRoom(r)}
                    className="w-full text-left px-4 py-2 hover:bg-hotel-cream transition-colors border-b last:border-b-0 text-sm"
                  >
                    <div className="font-medium text-hotel-text-primary">
                      {r.room_num}
                    </div>
                    <div className="text-xs text-hotel-text-secondary">{r.guest_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="bg-hotel-gold text-white px-6 py-2 rounded flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-colors"
          >
            <Search size={16} />
            {t("search")}
          </button>
        </div>
      </div>
      {sourceRoom && (
        <div className="bg-white rounded border p-4 space-y-4">
          <h3 className="text-base font-semibold text-hotel-text-primary">
            {t("moveGuestFromTo")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source room */}
            <div className="bg-hotel-cream border border-hotel-border rounded p-4">
              <h4 className="text-sm font-semibold text-hotel-gold mb-2">
                {t("currentRoom")}
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-hotel-text-secondary">{t("roomNumber")}:</span>{" "}
                  <strong>{sourceRoom.room_num}</strong>
                </p>
                <p>
                  <span className="text-hotel-text-secondary">{t("guestName")}:</span>{" "}
                  <strong>{sourceRoom.guest_name}</strong>
                </p>
                <p>
                  <span className="text-hotel-text-secondary">{t("twinName")}:</span>{" "}
                  {sourceRoom.twin_name || "—"}
                </p>
                <p>
                  <span className="text-hotel-text-secondary">{t("arrivalDate")}:</span>{" "}
                  {sourceRoom.arrival_date}
                </p>
                <p>
                  <span className="text-hotel-text-secondary">{t("departDate")}:</span>{" "}
                  {sourceRoom.depart_date}
                </p>
              </div>
            </div>
            {/* Target room selection */}
            <div className="bg-hotel-cream border border-hotel-border rounded p-4">
              <h4 className="text-sm font-semibold text-hotel-text-primary mb-2">
                {t("newRoom")}
              </h4>
              <div className="relative mb-3">
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => handleNewRoomChange(e.target.value)}
                  placeholder={t("selectRoom")}
                  title={t("selectRoom")}
                  className="w-full border border-hotel-border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-hotel-gold"
                />
                {showNewRoomSuggestions && newRoomSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-hotel-border rounded z-50 max-h-48 overflow-y-auto">
                    {newRoomSuggestions.map((r) => (
                      <button
                        key={r.room_num}
                        onClick={() => handleSelectNewRoom(r)}
                        className="w-full text-left px-4 py-2 hover:bg-hotel-cream transition-colors border-b last:border-b-0 text-sm"
                      >
                        <div className="font-medium text-hotel-text-primary">
                          {r.room_num}
                        </div>
                        <div className="text-xs text-hotel-text-secondary">
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
                          <span className="text-hotel-text-secondary">
                            {t("designation")}:
                          </span>{" "}
                          {r.designation}
                        </p>
                        <p>
                          <span className="text-hotel-text-secondary">{t("price1")}:</span>{" "}
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
              className="bg-hotel-gold text-white px-8 py-3 rounded flex items-center gap-2 hover:bg-hotel-gold-dark disabled:opacity-50"
            >
              <ArrowRightLeft size={18} />
              {t("confirmMove")}
            </button>
          </div>
        </div>
      )}

      {showConfirmation && sourceRoom && targetRoom && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded max-w-md w-full mx-4 p-4 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-hotel-cream mx-auto">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-hotel-text-primary">Are you sure?</h2>
              <p className="text-sm text-hotel-text-secondary">
                You are about to move a guest from one room to another. This
                action will update all related records.
              </p>
            </div>

            <div className="bg-white rounded p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-hotel-text-primary">From:</span>
                <span className="font-bold text-hotel-text-primary">
                  {sourceRoom.room_num}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm font-medium text-hotel-text-primary">
                  Guest:
                </span>
                <span className="font-bold text-hotel-text-primary">
                  {sourceRoom.guest_name}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm font-medium text-hotel-text-primary">To:</span>
                <span className="font-bold text-hotel-text-primary">
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
                className="flex-1 px-4 py-2 border border-hotel-border rounded text-hotel-text-primary font-medium hover:bg-hotel-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMove}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded font-medium hover:shadow-lg transition-colors"
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


