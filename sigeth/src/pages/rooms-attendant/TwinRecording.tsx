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

  const handleSearch = () => {
    const found = rooms.find((r) => r.room_num === query && r.status === "OCC");
    if (found) setSelectedRoom({ ...found });
    else alert(t("roomNotFoundOrNotOccupied"));
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
      <h1 className="text-2xl font-bold text-gray-800">{t("twinRecording")}</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("roomNumber")}
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
