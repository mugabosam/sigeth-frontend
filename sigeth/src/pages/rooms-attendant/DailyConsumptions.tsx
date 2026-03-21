import { useState } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

// TODO: Module 3 (Sales) — when built, call:
// const data = await salesApi.dailyConsumptions({ room_num, date });
// Response columns: date, order_num, refep, designation, unity, qty, price, debit, credit

export default function DailyConsumptions() {
  const { t } = useLang();
  // wired for future use
  useHotelData();

  const today = new Date().toISOString().slice(0, 10);
  const [filterRoom, setFilterRoom] = useState("");
  const [filterDate, setFilterDate] = useState(today);

  return (
    <div className="space-y-4 p-4">
      {/* Search Form */}
      <div className="bg-white rounded p-4">
        <h3 className="text-base font-bold text-hotel-text-primary mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          Search Consumptions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-hotel-text-primary mb-2">
              {t("roomNumber")}
            </label>
            <input
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              placeholder={t("roomNumber")}
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-hotel-text-primary mb-2">
              {t("date")}
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
            />
          </div>
          <div className="flex items-end">
            <button
              disabled
              title="Available after Sales module is connected"
              className="w-full bg-hotel-gold text-white p-2.5 rounded flex items-center justify-center opacity-50 cursor-not-allowed"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Empty results */}
      <div className="bg-white rounded p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-hotel-cream flex items-center justify-center mb-4">
          <ShoppingBag size={28} className="text-hotel-text-secondary" />
        </div>
        <p className="text-hotel-text-secondary text-sm">
          Daily consumptions will be available once the Sales module is connected.
        </p>
        <p className="text-hotel-text-secondary text-xs mt-2 opacity-60">
          Module 3 — Sales &amp; Billing (restaurant, bar, minibar, spa, shop)
        </p>
      </div>
    </div>
  );
}
