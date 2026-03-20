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
  const printTitles: Record<string, string> = {
    VC: t("vacantRoomsText"),
    OCC: t("occupiedRoomsText"),
    CO: t("checkoutRoomsText"),
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
    <div className="space-y-4 p-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white border border-hotel-border rounded p-4 p-4 rounded border border-hotel-border">
        <div>
          <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
            {titles[statusFilter] ?? t("roomsByStatus")}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded flex items-center gap-2 text-sm font-medium hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-colors duration-200"
          >
            <Printer size={18} />
            {t("print")}
          </button>
          <button
            onClick={exportCSV}
            className="border-2 border-hotel-border text-hotel-text-primary px-6 py-3 rounded flex items-center gap-2 text-sm font-medium bg-hotel-cream hover:bg-hotel-cream hover:shadow-lg transition-colors duration-200"
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>
        </div>
      </div>
      <div
        id="report-output"
        className="bg-white rounded border border-hotel-border overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-hotel-border bg-white border border-hotel-border rounded p-4">
          <h2 className="text-base font-bold bg-hotel-gold bg-clip-text text-transparent">
            {printTitles[statusFilter] ?? "Rooms situation"}{" "}
            <span className="font-normal text-sm text-hotel-text-secondary ml-2">
              {new Date().toLocaleDateString()}{" "}
              {new Date().toLocaleTimeString()}
            </span>
          </h2>
        </div>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-hotel-gold to-hotel-gold-dark">
              <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                Room Num
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                Designation
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                Price_1
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                Price_2
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                Currency
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.room_num}
                className="border-b border-hotel-border hover:bg-hotel-cream transition-colors duration-150"
              >
                <td className="px-4 py-3 font-medium text-hotel-text-primary">
                  {r.room_num}
                </td>
                <td className="px-4 py-3 text-hotel-text-primary">{r.designation}</td>
                <td className="px-4 py-3 text-hotel-text-primary">
                  {r.price_1.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-hotel-text-primary">
                  {r.price_2.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-hotel-text-primary">{r.current_mon}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      r.status === "OCC"
                        ? "bg-hotel-cream text-hotel-gold"
                        : r.status === "VC"
                          ? "bg-hotel-cream text-hotel-text-primary"
                          : "bg-hotel-cream text-hotel-text-primary"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-hotel-text-secondary font-medium"
                >
                  {t("noRecords")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #report-output, #report-output * { visibility: visible !important; }
          #report-output { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}


