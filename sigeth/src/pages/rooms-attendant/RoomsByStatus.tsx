import { Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { RoomStatusCode } from "../../types";

export default function RoomsByStatus({
  statusFilter,
}: {
  statusFilter: RoomStatusCode;
}) {
  const { t } = useLang();
  const { rooms } = useHotelData();
  const filtered = rooms.filter((r) => r.status === statusFilter);

  const titles: Record<string, string> = {
    VC: t("vacantRooms"),
    OCC: t("occupiedRooms"),
    CO: t("checkedOutRooms"),
  };
  const codes: Record<string, string> = {
    VC: "Lvacant.prt",
    OCC: "Locc.prt",
    CO: "Lchout.prt",
  };

  const exportCSV = () => {
    const headers = [
      "room_num",
      "designation",
      "price_1",
      "price_2",
      "current_mon",
      "status",
    ];
    const rows = filtered.map((r) =>
      headers
        .map((h) => String((r as unknown as Record<string, unknown>)[h] ?? ""))
        .join(","),
    );
    const blob = new Blob([headers.join(",") + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = codes[statusFilter]?.replace(".prt", ".csv") ?? "rooms.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {titles[statusFilter] ?? t("roomsByStatus")}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
          >
            <Printer size={16} />
            {t("print")}
          </button>
          <button
            onClick={exportCSV}
            className="border border-green-600 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-green-50"
          >
            <FileSpreadsheet size={16} />
            Excel
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <p className="text-sm text-gray-500">
            {codes[statusFilter]} — {filtered.length} {t("rooms")}
          </p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("roomNumber"),
                t("designation"),
                t("price1"),
                t("price2"),
                t("currency"),
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
            {filtered.map((r) => (
              <tr key={r.room_num} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{r.room_num}</td>
                <td className="px-4 py-3">{r.designation}</td>
                <td className="px-4 py-3">{r.price_1.toLocaleString()}</td>
                <td className="px-4 py-3">{r.price_2.toLocaleString()}</td>
                <td className="px-4 py-3">{r.current_mon}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${statusFilter === "VC" ? "bg-green-100 text-green-700" : statusFilter === "OCC" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {statusFilter}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  {t("noRecords")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
