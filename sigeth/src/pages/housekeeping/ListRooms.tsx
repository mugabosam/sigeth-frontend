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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
          {t("listRooms")}
        </h1>
        <p className="text-sm text-hotel-text-secondary">Complete list of all rooms</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors"
        >
          <Printer size={16} />
          {t("print")}
        </button>
        <button
          onClick={handleExport}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors"
        >
          <FileSpreadsheet size={16} />
          {t("excel")}
        </button>
      </div>
      <div className="bg-white rounded border border-emerald-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-hotel-border">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={`${t("search")} rooms by number, designation, or status...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border-2 border-hotel-border hover:border-hotel-border focus:border-emerald-500 focus:outline-none rounded text-sm font-medium transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-hotel-text-secondary"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white border-b-2 border-emerald-200">
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
                  className="text-left px-6 py-3 font-bold text-hotel-text-primary"
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
                className="border-b hover:bg-emerald-50/50 transition-colors duration-150"
              >
                <td className="px-6 py-3 font-semibold text-emerald-600">
                  {r.room_num}
                </td>
                <td className="px-6 py-3 text-hotel-text-primary">{r.designation}</td>
                <td className="px-6 py-3 text-hotel-text-primary">
                  {r.price_1.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-hotel-text-primary">
                  {r.price_2.toLocaleString()}
                </td>
                <td className="px-6 py-3">
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    {statusLabel(r.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRooms.length === 0 && (
          <div className="px-6 py-12 text-center text-hotel-text-secondary">
            <p className="text-sm">
              {searchTerm ? `No rooms match "${searchTerm}"` : "No rooms found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
