import { useState } from "react";
import { Save } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { RSTAFF } from "../../types";

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

  const handleSave = () => {
    setRstaff(assignments);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("dailyDispatching")}
        </h1>
        <button
          onClick={handleSave}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
        >
          <Save size={16} />
          {t("saveAll")}
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
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
                  className="text-left px-4 py-3 font-medium text-gray-600"
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
                <tr key={room.room_num} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{room.room_num}</td>
                  <td className="px-4 py-3">{room.guest_name || "—"}</td>
                  <td className="px-4 py-3">{room.arrival_date || "—"}</td>
                  <td className="px-4 py-3">{room.depart_date || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${room.status === "VD" ? "bg-yellow-100 text-yellow-700" : room.status === "OCC" ? "bg-blue-100 text-blue-700" : "bg-gray-100"}`}
                    >
                      {room.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={assigned?.staff_number ?? ""}
                      onChange={(e) =>
                        handleAssign(room.room_num, Number(e.target.value))
                      }
                      title={t("selectStaff")}
                      className="border rounded-lg px-3 py-1.5 text-sm w-full"
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
      </div>
    </div>
  );
}
