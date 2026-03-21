import { useState } from "react";
import { Search, ArrowRightLeft, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
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
  const [newRoomSuggestions, setNewRoomSuggestions] = useState<typeof rooms>([]);
  const [showNewRoomSuggestions, setShowNewRoomSuggestions] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [targetRoom, setTargetRoom] = useState<(typeof rooms)[0] | null>(null);
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState("");

  // Single modal for all feedback (search error, move error, move success)
  const [feedbackModal, setFeedbackModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
    } else {
      setSourceRoom(null);
      setFeedbackModal({ type: "error", message: t("roomNotFoundOrNotOccupied") });
    }
    setRoomSuggestions([]);
    setShowRoomSuggestions(false);
  };

  const handleMove = () => {
    if (!sourceRoom || !newRoom) {
      setFeedbackModal({ type: "error", message: "Please select both source and target rooms" });
      return;
    }
    const target = rooms.find((r) => r.room_num === newRoom);
    if (!target || target.status !== "VC") {
      setFeedbackModal({ type: "error", message: t("targetRoomNotVacant") });
      return;
    }

    setTargetRoom(target);
    setMoveError("");
    setShowConfirmation(true);
  };

  const confirmMove = async () => {
    if (!sourceRoom || !targetRoom) return;

    const guestName = sourceRoom.guest_name;
    const fromRoom = sourceRoom.room_num;
    const toRoom = targetRoom.room_num;

    setMoving(true);
    setMoveError("");

    try {
      const moved = await frontOfficeApi.moveGuest({
        old_room_num: fromRoom,
        new_room_num: toRoom,
      });

      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === moved.old_room.id) return moved.old_room;
          if (r.id === moved.new_room.id) return moved.new_room;
          return r;
        }),
      );
      setReservations((prev) =>
        prev.map((r) =>
          r.room_num === fromRoom ? { ...r, room_num: toRoom } : r,
        ),
      );
      setSales((prev) =>
        prev.map((s) =>
          s.room_num === fromRoom ? { ...s, room_num: toRoom } : s,
        ),
      );
      addNotification(
        `Guest ${guestName} moved from room ${fromRoom} to ${toRoom}`,
        "Rooms Attendant",
        "success",
      );

      setSourceRoom(null);
      setOldRoom("");
      setNewRoom("");
      setShowConfirmation(false);
      setTargetRoom(null);

      setFeedbackModal({
        type: "success",
        message: `Guest ${guestName} moved from room ${fromRoom} to ${toRoom}`,
      });
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "response" in error &&
              typeof (error as { response?: { data?: { detail?: string } } }).response?.data?.detail === "string"
            ? (error as { response: { data: { detail: string } } }).response.data.detail
            : t("targetRoomNotVacant");
      setMoveError(msg);
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white border border-hotel-border rounded p-4">
        <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
          {t("moveGuest")}
        </h1>
      </div>

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

      {/* Feedback Modal — success or error, one style */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            <div className={`p-6 text-center ${feedbackModal.type === "success" ? "bg-emerald-50" : "bg-red-50"}`}>
              <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 ${
                feedbackModal.type === "success" ? "bg-emerald-100" : "bg-red-100"
              }`}>
                {feedbackModal.type === "success" ? (
                  <CheckCircle2 size={28} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={28} className="text-red-500" />
                )}
              </div>
              <h3 className={`text-lg font-bold ${
                feedbackModal.type === "success" ? "text-emerald-800" : "text-red-800"
              }`}>
                {feedbackModal.type === "success" ? "Success" : "Error"}
              </h3>
              <p className={`text-sm mt-2 ${
                feedbackModal.type === "success" ? "text-emerald-600" : "text-red-600"
              }`}>
                {feedbackModal.message}
              </p>
            </div>
            <div className="p-4">
              <button
                onClick={() => setFeedbackModal(null)}
                className={`w-full py-2.5 rounded-lg font-medium transition-colors text-white ${
                  feedbackModal.type === "success"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (with inline error on move failure) */}
      {showConfirmation && sourceRoom && targetRoom && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded max-w-md w-full mx-4 p-4 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-hotel-cream mx-auto">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-hotel-text-primary">Are you sure?</h2>
              <p className="text-sm text-hotel-text-secondary">
                Move <strong>{sourceRoom.guest_name}</strong> from
                room <strong>{sourceRoom.room_num}</strong> to
                room <strong>{targetRoom.room_num}</strong>?
              </p>
            </div>

            {moveError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{moveError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setTargetRoom(null);
                  setMoveError("");
                }}
                disabled={moving}
                className="flex-1 px-4 py-2 border border-hotel-border rounded text-hotel-text-primary font-medium hover:bg-hotel-cream transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmMove}
                disabled={moving}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-700 text-white rounded font-medium hover:shadow-lg transition-colors disabled:opacity-50"
              >
                {moving ? "Moving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
