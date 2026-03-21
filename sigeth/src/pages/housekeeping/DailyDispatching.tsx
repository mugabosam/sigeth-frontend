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
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
        >
          <Save size={14} />
          {t("saveAll")}
        </button>
      </div>
      <div className="bg-white rounded overflow-hidden">
        <h2 className="text-sm font-semibold text-hotel-text-primary mb-2 uppercase tracking-wide px-2">
          {t("roomsAssignment")}
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-hotel-navy text-white sticky top-0">
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
                  className="text-left py-2 px-2 font-medium"
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
                  className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors"
                >
                  <td className="py-2 px-2 font-medium text-hotel-text-primary">
                    {room.room_num}
                  </td>
                  <td className="py-2 px-2 text-hotel-text-primary">
                    {room.guest_name || "—"}
                  </td>
                  <td className="py-2 px-2 text-hotel-text-primary">
                    {room.arrival_date || "—"}
                  </td>
                  <td className="py-2 px-2 text-hotel-text-primary">
                    {room.depart_date || "—"}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        room.status === "VD"
                          ? "bg-hotel-cream text-hotel-gold"
                          : room.status === "OCC"
                            ? "bg-hotel-cream text-hotel-gold"
                            : "bg-hotel-cream text-hotel-gold"
                      }`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <select
                      value={assigned?.staff_number ?? ""}
                      onChange={(e) =>
                        handleAssign(room.room_num, Number(e.target.value))
                      }
                      title={t("selectStaff")}
                      className="border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold w-full"
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
          <div className="px-4 py-8 text-center text-hotel-text-secondary">
            <p className="text-sm">{t("noRoomsHousekeeping")}</p>
          </div>
        )}
      </div>

      {/* Daily Journal (JSTAFF.dat) - Available for printing */}
      {assignments.length > 0 && (
        <div className="bg-white rounded overflow-hidden">
          <div className="flex justify-between items-center px-2 mb-2">
            <h2 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide">
              {t("dailyHousekeepingJournal")}
            </h2>
            <div className="flex gap-2">
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
          </div>
          <table className="w-full text-sm">
            <thead className="bg-hotel-navy text-white sticky top-0">
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
                    className="text-left py-2 px-2 font-medium"
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
                  className="border-b border-hotel-border hover:bg-hotel-cream transition-colors print:hover:bg-white"
                >
                  <td className="py-2 px-2 font-medium text-hotel-text-primary">
                    {a.staff_name}
                  </td>
                  <td className="py-2 px-2 text-hotel-text-primary">{a.room_num}</td>
                  <td className="py-2 px-2 text-hotel-text-primary">
                    {a.guest_name || "—"}
                  </td>
                  <td className="py-2 px-2 text-hotel-text-primary">
                    {a.arrival_date || "—"}
                  </td>
                  <td className="py-2 px-2 text-hotel-text-primary">
                    {a.depart_date || "—"}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        a.status === "VD"
                          ? "bg-hotel-cream text-hotel-gold"
                          : a.status === "OCC"
                            ? "bg-hotel-cream text-hotel-gold"
                            : "bg-hotel-cream text-hotel-gold"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 font-medium text-hotel-text-primary">
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
