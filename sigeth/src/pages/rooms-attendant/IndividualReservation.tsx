import { useState } from "react";
import { Search, Plus, Save, Trash2 } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { RCS } from "../../types";

type Mode = "1112" | "1114" | "1116";

export default function IndividualReservation({
  mode = "1112",
}: {
  mode?: Mode;
}) {
  const { t } = useLang();
  const { reservations, setReservations, rooms, setRooms } = useHotelData();
  const [queryRoom, setQueryRoom] = useState("");
  const [queryGuest, setQueryGuest] = useState("");
  const [selected, setSelected] = useState<RCS | null>(null);
  const [isNew, setIsNew] = useState(false);

  const blank: RCS = {
    code_p: "",
    groupe_name: "",
    room_num: "",
    guest_name: "",
    id_card: "",
    nationality: "",
    phone: "",
    email: "",
    arrival_date: "",
    depart_date: "",
    adulte: 1,
    children: 0,
    age: 0,
    twin_num: 0,
    twin_name: "",
    city: "",
    country: "",
    current_mon: "RWF",
    puv: 0,
    payt_mode: "Cash",
    airport_time: "",
    discount: 0,
    stay_cost: 0,
    deposit: 0,
    status: 0,
  };

  const titles: Record<Mode, string> = {
    "1112": t("individualReservation"),
    "1114": t("checkInWithReservation"),
    "1116": t("checkInWithoutReservation"),
  };

  const handleSearch = () => {
    const found = reservations.find(
      (r) =>
        (queryRoom && r.room_num === queryRoom) ||
        (queryGuest &&
          r.guest_name.toLowerCase().includes(queryGuest.toLowerCase())),
    );
    if (found) {
      setSelected({ ...found });
      setIsNew(false);
    } else {
      setSelected({ ...blank, room_num: queryRoom, guest_name: queryGuest });
      setIsNew(true);
    }
  };

  const calc = (f: RCS): RCS => {
    const arr = f.arrival_date ? new Date(f.arrival_date) : null;
    const dep = f.depart_date ? new Date(f.depart_date) : null;
    const qty =
      arr && dep
        ? Math.max(Math.round((dep.getTime() - arr.getTime()) / 86400000), 0)
        : 0;
    const base = qty * f.puv;
    const stay_cost = f.discount > 0 ? base * (1 - f.discount / 100) : base;
    return { ...f, stay_cost };
  };

  const handleChange = (field: keyof RCS, value: string | number) => {
    if (!selected) return;
    setSelected(calc({ ...selected, [field]: value }));
  };

  const handleSave = () => {
    if (!selected) return;
    if (isNew) setReservations((prev) => [...prev, selected]);
    else
      setReservations((prev) =>
        prev.map((r) =>
          r.room_num === selected.room_num &&
          r.guest_name === selected.guest_name
            ? selected
            : r,
        ),
      );

    // For check-in modes (1114/1116), also update RDF.dat
    if (mode === "1114" || mode === "1116") {
      setRooms((prev) =>
        prev.map((room) =>
          room.room_num === selected.room_num
            ? {
                ...room,
                guest_name: selected.guest_name,
                arrival_date: selected.arrival_date,
                depart_date: selected.depart_date,
                puv: selected.puv,
                status: "OCC" as const,
              }
            : room,
        ),
      );
    }
    setSelected(null);
    setQueryRoom("");
    setQueryGuest("");
  };

  const handleDelete = () => {
    if (!selected) return;
    setReservations((prev) =>
      prev.filter(
        (r) =>
          !(
            r.room_num === selected.room_num &&
            r.guest_name === selected.guest_name
          ),
      ),
    );
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{titles[mode]}</h1>
      {/* Query window */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3 flex-wrap">
          <input
            value={queryRoom}
            onChange={(e) => setQueryRoom(e.target.value)}
            placeholder={t("roomNumber")}
            className="border rounded-lg px-4 py-2 text-sm w-32"
          />
          <input
            value={queryGuest}
            onChange={(e) => setQueryGuest(e.target.value)}
            placeholder={t("guestName")}
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
          <button
            onClick={() => {
              setSelected({ ...blank });
              setIsNew(true);
            }}
            className="border border-amber-500 text-amber-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-50"
          >
            <Plus size={16} />
            {t("newRecord")}
          </button>
        </div>
      </div>
      {/* Indiv_form */}
      {selected && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isNew ? t("newReservation") : t("editReservation")} — Indiv_form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                ["room_num", t("roomNumber"), "text"],
                ["guest_name", t("guestName"), "text"],
                ["id_card", t("idCard"), "text"],
                ["nationality", t("nationality"), "text"],
                ["phone", t("phone"), "text"],
                ["email", t("email"), "email"],
                ["city", t("city"), "text"],
                ["country", t("country"), "text"],
                ["arrival_date", t("arrivalDate"), "date"],
                ["depart_date", t("departDate"), "date"],
                ["adulte", t("adults"), "number"],
                ["children", t("children"), "number"],
                ["age", t("age"), "number"],
                ["current_mon", t("currency"), "text"],
                ["puv", t("pricePerNight"), "number"],
                ["airport_time", t("airportTime"), "text"],
                ["stay_cost", t("stayCost"), "number"],
                ["deposit", t("deposit"), "number"],
              ] as [keyof RCS, string, string][]
            ).map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={selected[field] ?? ""}
                  readOnly={field === "stay_cost"}
                  onChange={(e) =>
                    handleChange(
                      field,
                      type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                    )
                  }
                  title={label}
                  className={`w-full border rounded-lg px-3 py-2 text-sm ${field === "stay_cost" ? "bg-gray-50" : ""}`}
                />
              </div>
            ))}
          </div>
          {/* Available rooms browser */}
          {(mode === "1112" || mode === "1114" || mode === "1116") && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">
                {t("availableRooms")}
              </h4>
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      {[
                        t("roomNumber"),
                        t("designation"),
                        t("price1"),
                        t("price2"),
                        t("status"),
                      ].map((h) => (
                        <th key={h} className="text-left py-1 px-2">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rooms
                      .filter((r) => r.status === "VC")
                      .map((r) => (
                        <tr
                          key={r.room_num}
                          className="border-b hover:bg-amber-50 cursor-pointer"
                          onClick={() => handleChange("room_num", r.room_num)}
                        >
                          <td className="py-1 px-2 font-medium">
                            {r.room_num}
                          </td>
                          <td className="py-1 px-2">{r.designation}</td>
                          <td className="py-1 px-2">
                            {r.price_1.toLocaleString()}
                          </td>
                          <td className="py-1 px-2">
                            {r.price_2.toLocaleString()}
                          </td>
                          <td className="py-1 px-2">
                            <span className="text-green-600">VC</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              className="bg-amber-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
            >
              <Save size={16} />
              {t("save")}
            </button>
            {!isNew && (
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-red-600"
              >
                <Trash2 size={16} />
                {t("delete")}
              </button>
            )}
            <button
              onClick={() => setSelected(null)}
              className="border px-6 py-2 rounded-lg text-sm"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
      {/* Current reservations */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("roomNumber"),
                t("guestName"),
                t("phone"),
                t("arrivalDate"),
                t("departDate"),
                t("stayCost"),
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
            {reservations.map((r, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelected({ ...r });
                  setIsNew(false);
                }}
              >
                <td className="px-4 py-3">{r.room_num}</td>
                <td className="px-4 py-3 font-medium">{r.guest_name}</td>
                <td className="px-4 py-3">{r.phone}</td>
                <td className="px-4 py-3">{r.arrival_date}</td>
                <td className="px-4 py-3">{r.depart_date}</td>
                <td className="px-4 py-3">{r.stay_cost.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${r.status === 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {r.status === 0 ? t("statusOpen") : t("statusClosed")}
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
