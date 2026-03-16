import { useState } from "react";
import { Search } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { frontOfficeApi } from "../../services/sigethApi";

export default function FindRoom() {
  const { t } = useLang();
  const { rooms } = useHotelData();
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<(typeof rooms)[0] | null>(null);
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
          r.room_num.toLowerCase().includes(q) ||
          r.guest_name.toLowerCase().includes(q) ||
          r.designation.toLowerCase().includes(q),
      )
      .slice(0, 10);
    setSuggestions(matches);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (r: (typeof rooms)[0]) => {
    setFound(r);
    setQuery(r.room_num);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = async () => {
    let result: (typeof rooms)[0] | undefined | null = rooms.find(
      (r) => r.room_num === query || r.guest_name.toLowerCase() === query.toLowerCase(),
    );
    if (!result) {
      try {
        const apiResult = await frontOfficeApi.findRoom({ room_num: query, guest_name: query });
        result = apiResult[0];
      } catch {
        result = null;
      }
    }
    setFound(result ?? null);
    setSuggestions([]);
    setShowSuggestions(false);
    if (!result) alert(t("noRoomFound"));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t("findRoom")}
        </h1>
      </div>
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3 relative">
          <div className="flex-1 relative">
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={`${t("roomNumber")} / ${t("guestName")}`}
              title={`${t("roomNumber")} / ${t("guestName")}`}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {suggestions.map((r) => (
                  <button
                    key={r.room_num}
                    onClick={() => handleSelectSuggestion(r)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b last:border-b-0 text-sm"
                  >
                    <div className="font-medium text-gray-800">
                      {t("roomText")} {r.room_num} — {r.guest_name || "—"}
                    </div>
                    <div className="text-xs text-gray-500">{r.designation}</div>
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
      {found && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ffind_form — {t("room")} {found.room_num}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {(
              [
                [t("guestName"), found.guest_name || "—"],
                [t("roomNumber"), found.room_num],
                [t("arrivalDate"), found.arrival_date || "—"],
                [t("departDate"), found.depart_date || "—"],
                [t("pricePerNight"), found.puv.toLocaleString()],
                [t("twinNum"), String(found.twin_num)],
                [t("twinName"), found.twin_name || "—"],
                [t("deposit"), found.deposit.toLocaleString()],
                [t("status"), found.status],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500">{label}</span>
                <p className="font-medium text-gray-800">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
