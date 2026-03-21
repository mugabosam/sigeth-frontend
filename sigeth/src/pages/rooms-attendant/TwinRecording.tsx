import { useState } from "react";
import { Search, Save, CheckCircle2, AlertTriangle, ArrowRight, AlertCircle } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { frontOfficeApi } from "../../services/sigethApi";

interface TwinResult {
  detail: string;
  room: ReturnType<typeof useHotelData>["rooms"][0];
  old_puv: number;
  new_puv: number;
  price_changed: boolean;
  twin_num: number;
  twin_name: string;
  current_mon: string;
}

export default function TwinRecording() {
  const { t } = useLang();
  const { rooms, setRooms } = useHotelData();
  const [query, setQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<(typeof rooms)[0] | null>(
    null,
  );
  const [twinName, setTwinName] = useState("");
  const [suggestions, setSuggestions] = useState<typeof rooms>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [resultModal, setResultModal] = useState<TwinResult | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
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
    setSuggestions(matches);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (r: (typeof rooms)[0]) => {
    setSelectedRoom({ ...r });
    setQuery(r.room_num);
    setTwinName("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    const found = rooms.find((r) => r.room_num === query && r.status === "OCC");
    if (found) {
      setSelectedRoom({ ...found });
      setTwinName("");
    } else {
      alert(t("roomNotFoundOrNotOccupied"));
    }
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!selectedRoom || !twinName.trim()) return;

    setSaving(true);
    try {
      if (!selectedRoom.id) {
        throw new Error("Room id is required for twin recording.");
      }
      const result = await frontOfficeApi.twin(selectedRoom.id, {
        twin_name: twinName.trim(),
      });
      // Update rooms list with the new room data
      setRooms((prev) =>
        prev.map((r) => (r.id === result.room.id ? result.room : r)),
      );
      setResultModal({
        ...result,
        twin_name: twinName.trim(),
        current_mon: result.current_mon || selectedRoom.current_mon || "RWF",
      });
      setSelectedRoom(null);
      setQuery("");
      setTwinName("");
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "response" in error &&
              typeof (error as { response?: { data?: { detail?: string } } }).response?.data?.detail === "string"
            ? (error as { response: { data: { detail: string } } }).response.data.detail
            : t("loginError");
      setErrorModal(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-white rounded p-4">
        <h3 className="text-base font-bold text-hotel-text-primary mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full" />
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3 relative">
          <div className="relative w-48">
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={t("roomNumber")}
              title={t("roomNumber")}
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded z-50 max-h-32 overflow-y-auto">
                {suggestions.map((r) => (
                  <button
                    key={r.room_num}
                    onClick={() => handleSelectSuggestion(r)}
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
            className="bg-hotel-gold text-white p-2.5 rounded flex items-center justify-center hover:bg-hotel-gold-dark transition-colors"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Room details + twin name form */}
      {selectedRoom && (
        <div className="bg-white rounded p-4 space-y-4">
          <h3 className="text-base font-semibold text-hotel-text-primary">
            {t("twinRecording")} — {t("room")} {selectedRoom.room_num}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(
              [
                ["room_num", t("roomNumber")],
                ["guest_name", t("guestName")],
                ["arrival_date", t("arrivalDate")],
                ["depart_date", t("departDate")],
                ["qty", t("nightNum")],
                ["puv", t("rateDay")],
                ["current_mon", t("currency")],
                ["deposit", t("deposit")],
                ["status", t("status")],
              ] as [keyof (typeof rooms)[0], string][]
            ).map(([field, label]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={selectedRoom[field] ?? ""}
                  readOnly
                  title={label}
                  className="w-full border rounded px-3 py-2 text-sm bg-gray-50"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("twinName")}
              </label>
              <input
                type="text"
                value={twinName}
                onChange={(e) => setTwinName(e.target.value)}
                placeholder={t("twinName")}
                title={t("twinName")}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!twinName.trim() || saving}
              className="bg-hotel-gold text-white px-6 py-2 rounded flex items-center gap-2 text-sm hover:bg-hotel-gold-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {t("save")}
            </button>
            <button
              onClick={() => { setSelectedRoom(null); setTwinName(""); }}
              className="border px-6 py-2 rounded text-sm"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && selectedRoom && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded max-w-md w-full mx-4 p-4 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-hotel-cream mx-auto">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-hotel-text-primary">Are you sure?</h2>
              <p className="text-sm text-hotel-text-secondary">
                Add <strong>{twinName}</strong> as twin guest to
                room <strong>{selectedRoom.room_num}</strong> ({selectedRoom.guest_name})?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-hotel-text-primary font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirm(false);
                  await handleSave();
                }}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-hotel-gold text-white rounded font-medium hover:bg-hotel-gold-dark transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Result Modal */}
      {resultModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-emerald-50 p-6 text-center">
              <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-emerald-800">
                Twin Guest Added Successfully
              </h3>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-hotel-text-secondary">{t("roomNumber")}:</span>
                  <p className="font-semibold text-hotel-text-primary">{resultModal.room.room_num}</p>
                </div>
                <div>
                  <span className="text-hotel-text-secondary">{t("twinName")}:</span>
                  <p className="font-semibold text-hotel-text-primary">{resultModal.twin_name}</p>
                </div>
                <div>
                  <span className="text-hotel-text-secondary">Occupants:</span>
                  <p className="font-semibold text-hotel-text-primary">{resultModal.twin_num}</p>
                </div>
              </div>

              {/* Price change box */}
              {resultModal.price_changed ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-800 mb-2">
                    Room Rate Updated
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="text-center">
                      <p className="text-xs text-amber-600">Previous (Single)</p>
                      <p className="text-lg font-bold text-amber-700">
                        {resultModal.old_puv.toLocaleString()} {resultModal.current_mon}
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-amber-500 shrink-0" />
                    <div className="text-center">
                      <p className="text-xs text-emerald-600">New (Double)</p>
                      <p className="text-lg font-bold text-emerald-700">
                        {resultModal.new_puv.toLocaleString()} {resultModal.current_mon}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-hotel-text-secondary">
                    Room rate unchanged — {resultModal.new_puv.toLocaleString()} {resultModal.current_mon}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setResultModal(null)}
                className="w-full bg-emerald-500 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="bg-red-50 p-6 text-center">
              <div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-800">Error</h3>
              <p className="text-sm text-red-600 mt-2">{errorModal}</p>
            </div>
            <div className="p-4">
              <button
                onClick={() => setErrorModal(null)}
                className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
