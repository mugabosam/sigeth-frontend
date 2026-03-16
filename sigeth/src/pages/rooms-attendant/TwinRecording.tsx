import { useState } from "react";
import { Search, Save } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function TwinRecording() {
  const { t } = useLang();
  const { rooms, setRooms } = useHotelData();
  const [query, setQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<(typeof rooms)[0] | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<typeof rooms>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    const found = rooms.find((r) => r.room_num === query && r.status === "OCC");
    if (found) setSelectedRoom({ ...found });
    else alert(t("roomNotFoundOrNotOccupied"));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleChange = (
    field: "twin_name" | "twin_num",
    value: string | number,
  ) => {
    if (!selectedRoom) return;
    setSelectedRoom({ ...selectedRoom, [field]: value });
  };

  const handleSave = () => {
    if (!selectedRoom) return;
    setRooms((prev) =>
      prev.map((r) =>
        r.room_num === selectedRoom.room_num ? selectedRoom : r,
      ),
    );
    setSelectedRoom(null);
    setQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t("twinRecording")}
        </h1>
      </div>
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3 relative">
          <div className="relative w-48">
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={t("roomNumber")}
              title={t("roomNumber")}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-32 overflow-y-auto">
                {suggestions.map((r) => (
                  <button
                    key={r.room_num}
                    onClick={() => handleSelectSuggestion(r)}
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
      {selectedRoom && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Twin_form — {t("room")} {selectedRoom.room_num}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ["room_num", t("roomNumber")],
                ["guest_name", t("guestName")],
                ["arrival_date", t("arrivalDate")],
                ["depart_date", t("departDate")],
                ["qty", t("nightNum")],
                ["puv", t("rateDay")],
              ] as [keyof (typeof rooms)[0], string][]
            ).map(([field, label]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={selectedRoom[field] ?? ""}
                  readOnly
                  title={label}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("twinNum")}
              </label>
              <input
                type="number"
                value={selectedRoom.twin_num}
                onChange={(e) =>
                  handleChange("twin_num", Number(e.target.value))
                }
                title={t("twinNum")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("twinName")}
              </label>
              <input
                type="text"
                value={selectedRoom.twin_name}
                onChange={(e) => handleChange("twin_name", e.target.value)}
                title={t("twinName")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("deposit")}
              </label>
              <input
                type="number"
                value={selectedRoom.deposit}
                readOnly
                title={t("deposit")}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("status")}
              </label>
              <input
                type="text"
                value={selectedRoom.status}
                readOnly
                title={t("status")}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              className="bg-amber-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
            >
              <Save size={16} />
              {t("save")}
            </button>
            <button
              onClick={() => setSelectedRoom(null)}
              className="border px-6 py-2 rounded-lg text-sm"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
