import { useState } from "react";
import { Search } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function FindRoom() {
  const { t } = useLang();
  const { rooms } = useHotelData();
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<(typeof rooms)[0] | null>(null);

  const handleSearch = () => {
    const r = rooms.find(
      (r) =>
        r.room_num === query ||
        r.guest_name.toLowerCase().includes(query.toLowerCase()),
    );
    setFound(r ?? null);
    if (!r) alert(t("noRoomFound"));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t("findRoom")}</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("roomNumberOrGuest")}
            className="flex-1 border rounded-lg px-4 py-2 text-sm"
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
      {found && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ffind_form — {t("room")} {found.room_num}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {(
              [
                [t("roomNumber"), found.room_num],
                [t("designation"), found.designation],
                [t("category"), String(found.categorie)],
                [t("price1"), found.price_1.toLocaleString()],
                [t("price2"), found.price_2.toLocaleString()],
                [t("guestName"), found.guest_name || "—"],
                [t("twinName"), found.twin_name || "—"],
                [t("twinNum"), String(found.twin_num)],
                [t("currency"), found.current_mon],
                [t("status"), found.status],
                [t("arrivalDate"), found.arrival_date || "—"],
                [t("departDate"), found.depart_date || "—"],
                [t("nights"), String(found.qty)],
                [t("pricePerNight"), found.puv.toLocaleString()],
                [t("deposit"), found.deposit.toLocaleString()],
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
