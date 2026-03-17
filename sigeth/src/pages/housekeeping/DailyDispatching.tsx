import { useState } from "react";
import { Save, Printer, FileSpreadsheet } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { RSTAFF } from "../../types";
import { housekeepingApi } from "../../services/sigethApi";

export default function DailyDispatching() {
  const { t } = useLang();
  const { rooms, staff, rstaff, setRstaff } = useHotelData();
  const [assignments, setAssignments] = useState<RSTAFF[]>(rstaff);

  // Rooms that need housekeeping attention
  const roomsToAssign = rooms.filter((r) =>
    ["VD", "CO", "OCC", "VC"].includes(r.status),
  );

  const handleAssign = (roomNum: string, staffNum: number) => {
    const room = rooms.find((r) => r.room_num === roomNum);
    const staffMember = staff.find((s) => s.number === staffNum);
    if (!room || !staffMember) return;
    const today = new Date().toISOString().split("T")[0];
    const entry: RSTAFF = {
      date: today,
      room_num: room.room_num,
      guest_name: room.guest_name,
      arrival_date: room.arrival_date,
      depart_date: room.depart_date,
      status: room.status,
      staff_number: staffMember.number,
      staff_name: `${staffMember.first_name} ${staffMember.last_name}`,
    };
    setAssignments((prev) => {
      const filtered = prev.filter((a) => a.room_num !== roomNum);
      return [...filtered, entry];
    });
  };

  const handleSave = async () => {
    try {
      const saved: RSTAFF[] = [];
      for (const assignment of assignments) {
        const item = await housekeepingApi.assignStaff({
          staff_number: assignment.staff_number,
          room_num: assignment.room_num,
        });
        saved.push(item);
      }
      setRstaff(saved);
    } catch {
      // keep existing in-memory assignments visible when API save fails
      setRstaff(assignments);
    }
  };

  const handleExport = () => {
    const header =
      "Staff_Name,Room_num,Guest_Name,Arrival_date,Depart_date,Status,Date";
    const rows = assignments.map(
      (a) =>
        `${a.staff_name},${a.room_num},${a.guest_name},${a.arrival_date},${a.depart_date},${a.status},${a.date}`,
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], {
      type: "text/csv",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Ljstaff_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
          {t("dailyDispatching")}
        </h1>
        <p className="text-sm text-hotel-text-secondary">{t("assignStaffDesc")}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors duration-200"
        >
          <Save size={16} />
          {t("saveAll")}
        </button>
      </div>
      <div className="bg-white rounded border border-emerald-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-100">
          <h2 className="text-base font-bold text-hotel-text-primary">
            {t("roomsAssignment")}
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white border-b-2 border-emerald-200">
            <tr>
              {[
                t("roomNumber"),
                t("guestName"),
                t("arrivalDate"),
                t("departDate"),
                t("status"),
                t("assignedStaff"),
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
            {roomsToAssign.map((room) => {
              const assigned = assignments.find(
                (a) => a.room_num === room.room_num,
              );
              return (
                <tr
                  key={room.room_num}
                  className="border-b hover:bg-emerald-50/50 cursor-pointer transition-colors duration-150"
                >
                  <td className="px-6 py-3 font-semibold text-emerald-600">
                    {room.room_num}
                  </td>
                  <td className="px-6 py-3 text-hotel-text-primary">
                    {room.guest_name || "—"}
                  </td>
                  <td className="px-6 py-3 text-hotel-text-primary">
                    {room.arrival_date || "—"}
                  </td>
                  <td className="px-6 py-3 text-hotel-text-primary">
                    {room.depart_date || "—"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        room.status === "VD"
                          ? "bg-yellow-100 text-yellow-700"
                          : room.status === "OCC"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={assigned?.staff_number ?? ""}
                      onChange={(e) =>
                        handleAssign(room.room_num, Number(e.target.value))
                      }
                      title={t("selectStaff")}
                      className="border-2 border-hotel-border hover:border-hotel-border focus:border-emerald-500 focus:outline-none rounded px-3 py-2 text-sm w-full font-medium transition-colors"
                    >
                      <option value="">{t("selectStaff")}</option>
                      {staff.map((s) => (
                        <option key={s.number} value={s.number}>
                          {s.first_name} {s.last_name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {roomsToAssign.length === 0 && (
          <div className="px-6 py-12 text-center text-hotel-text-secondary">
            <p className="text-sm">{t("noRoomsHousekeeping")}</p>
          </div>
        )}
      </div>

      {/* Daily Journal (JSTAFF.dat) - Available for printing */}
      {assignments.length > 0 && (
        <div className="bg-white rounded border border-emerald-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
            <h2 className="text-base font-bold text-hotel-text-primary">
              {t("dailyHousekeepingJournal")}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm hover:bg-gray-700 transition-colors"
              >
                <Printer size={16} />
                {t("print")}
              </button>
              <button
                onClick={handleExport}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm hover:shadow-lg transition-colors"
              >
                <FileSpreadsheet size={16} />
                {t("excel")}
              </button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-white border-b-2 border-emerald-200">
              <tr>
                {[
                  t("staffName"),
                  t("roomNumber"),
                  t("guestName"),
                  t("arrivalDate"),
                  t("departDate"),
                  t("status"),
                  t("date"),
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
              {assignments.map((a, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-emerald-50/50 transition-colors print:hover:bg-white"
                >
                  <td className="px-6 py-3 font-semibold text-emerald-600">
                    {a.staff_name}
                  </td>
                  <td className="px-6 py-3 text-hotel-text-primary">{a.room_num}</td>
                  <td className="px-6 py-3 text-hotel-text-primary">
                    {a.guest_name || "—"}
                  </td>
                  <td className="px-6 py-3 text-hotel-text-primary">
                    {a.arrival_date || "—"}
                  </td>
                  <td className="px-6 py-3 text-hotel-text-primary">
                    {a.depart_date || "—"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        a.status === "VD"
                          ? "bg-yellow-100 text-yellow-700"
                          : a.status === "OCC"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium text-hotel-text-primary">
                    {a.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
