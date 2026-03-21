import { useState } from "react";
import { Printer, FileSpreadsheet, Search, X } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function ListRooms() {
  const { t } = useLang();
  const { rooms, statuses } = useHotelData();
  const [searchTerm, setSearchTerm] = useState("");

  const sorted = [...rooms].sort((a, b) =>
    a.room_num.localeCompare(b.room_num),
  );

  // Live search filter
  const filteredRooms = sorted.filter((r) => {
    const search = searchTerm.toLowerCase();
    return (
      r.room_num.toLowerCase().includes(search) ||
      r.designation.toLowerCase().includes(search) ||
      r.price_1.toString().includes(search) ||
      r.price_2.toString().includes(search) ||
      r.status.toLowerCase().includes(search)
    );
  });

  const statusLabel = (code: string) =>
    statuses.find((s) => s.code === code)?.label ?? code;

  const handleExport = () => {
    const header = "Room_num,Designation,Price_1,Price_2,Status";
    const rows = sorted.map(
      (r) =>
        `${r.room_num},${r.designation},${r.price_1},${r.price_2},${r.status}`,
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Lrooms.csv";
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
        >
          <Printer size={14} />
          {t("print")}
        </button>
        <button
          onClick={handleExport}
          className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
        >
          <FileSpreadsheet size={14} />
          {t("excel")}
        </button>
      </div>
      <div className="bg-white rounded overflow-hidden">
        <div className="px-4 py-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hotel-text-secondary"
              size={18}
            />
            <input
              type="text"
              placeholder={`${t("search")} rooms by number, designation, or status...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-hotel-text-secondary hover:text-hotel-text-secondary"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-hotel-navy text-white sticky top-0">
            <tr>
              {[
                t("roomNum"),
                t("designation"),
                t("price1"),
                t("price2"),
                t("status"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-2 px-2 font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((r) => (
              <tr
                key={r.room_num}
                className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors"
              >
                <td className="py-2 px-2 font-medium text-hotel-text-primary">
                  {r.room_num}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">{r.designation}</td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {r.price_1.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {r.price_2.toLocaleString()}
                </td>
                <td className="py-2 px-2">
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-hotel-cream text-hotel-gold">
                    {statusLabel(r.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRooms.length === 0 && (
          <div className="px-4 py-8 text-center text-hotel-text-secondary">
            <p className="text-sm">
              {searchTerm ? `No rooms match "${searchTerm}"` : "No rooms found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
