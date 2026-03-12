import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";

export default function ListRooms() {
  const { t } = useLang();
  const { rooms, statuses } = useHotelData();

  const sorted = [...rooms].sort((a, b) =>
    a.room_num.localeCompare(b.room_num),
  );

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("listRooms")} — Lrooms.prt
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-700"
          >
            <Printer size={16} />
            {t("print")}
          </button>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-green-700"
          >
            <FileSpreadsheet size={16} />
            {t("excel")}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
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
                  className="text-left px-4 py-3 font-medium text-gray-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.room_num} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{r.room_num}</td>
                <td className="px-4 py-3">{r.designation}</td>
                <td className="px-4 py-3">{r.price_1.toLocaleString()}</td>
                <td className="px-4 py-3">{r.price_2.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                    {statusLabel(r.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
