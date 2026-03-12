import { useState } from "react";
import { Search, Save, Trash2 } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { RCS } from "../../types";

export default function GroupMemberReservation({
  mode = "1113",
}: {
  mode?: "1113" | "1117";
}) {
  const { t } = useLang();
  const {
    groupReservations,
    reservations,
    setReservations,
    rooms,
    setRooms,
    paymentModes,
  } = useHotelData();
  const [queryCode, setQueryCode] = useState("");
  const [queryGroup, setQueryGroup] = useState("");
  const [groupFound, setGroupFound] = useState<
    (typeof groupReservations)[0] | null
  >(null);
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

  const titles = {
    "1113": t("groupMemberReservation"),
    "1117": t("checkInGroupReservation"),
  };

  const handleSearchGroup = () => {
    const g = groupReservations.find(
      (g) =>
        (queryCode && g.code_g === queryCode) ||
        (queryGroup &&
          g.groupe_name.toLowerCase().includes(queryGroup.toLowerCase())),
    );
    if (g) {
      if (g.status === 1) {
        alert(t("groupClosed"));
        return;
      }
      setGroupFound(g);
    } else {
      alert(t("groupNotFound"));
    }
  };

  const handleSelectMember = (r: RCS) => {
    setSelected({ ...r });
    setIsNew(false);
  };
  const handleNewMember = () => {
    if (!groupFound) return;
    setSelected({
      ...blank,
      code_p: groupFound.code_g,
      groupe_name: groupFound.groupe_name,
      arrival_date: groupFound.arrival_date,
      depart_date: groupFound.depart_date,
      puv: groupFound.puv,
      current_mon: groupFound.current_mon,
      payt_mode: groupFound.payt_mode,
      discount: groupFound.discount,
    });
    setIsNew(true);
  };

  const calc = (f: RCS): RCS => {
    const arr = f.arrival_date ? new Date(f.arrival_date) : null;
    const dep = f.depart_date ? new Date(f.depart_date) : null;
    const qty =
      arr && dep
        ? Math.max(Math.round((dep.getTime() - arr.getTime()) / 86400000), 0)
        : 0;
    const base = qty * f.puv;
    return {
      ...f,
      stay_cost: f.discount > 0 ? base * (1 - f.discount / 100) : base,
    };
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
    // For check-in mode (1117), also update RDF.dat
    if (mode === "1117" && selected.room_num) {
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

  const groupMembers = groupFound
    ? reservations.filter(
        (r) =>
          r.code_p === groupFound.code_g ||
          r.groupe_name === groupFound.groupe_name,
      )
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{titles[mode]}</h1>
      {/* Group query */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">
          {t("queryWindow")} — {t("searchGroup")}
        </h3>
        <div className="flex gap-3 flex-wrap">
          <input
            value={queryCode}
            onChange={(e) => setQueryCode(e.target.value)}
            placeholder={t("groupCode")}
            className="border rounded-lg px-4 py-2 text-sm w-32"
          />
          <input
            value={queryGroup}
            onChange={(e) => setQueryGroup(e.target.value)}
            placeholder={t("groupName")}
            className="flex-1 border rounded-lg px-4 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSearchGroup()}
          />
          <button
            onClick={handleSearchGroup}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
          >
            <Search size={16} />
            {t("search")}
          </button>
        </div>
      </div>
      {/* Group info + members browser */}
      {groupFound && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-500">{t("groupCode")}:</span>{" "}
                <strong>{groupFound.code_g}</strong>
              </div>
              <div>
                <span className="text-gray-500">{t("groupName")}:</span>{" "}
                <strong>{groupFound.groupe_name}</strong>
              </div>
              <div>
                <span className="text-gray-500">{t("persons")}:</span>{" "}
                <strong>{groupFound.number_pers}</strong>
              </div>
              <div>
                <span className="text-gray-500">{t("status")}:</span>{" "}
                <strong>
                  {groupFound.status === 0
                    ? t("statusOpen")
                    : t("statusClosed")}
                </strong>
              </div>
            </div>
          </div>
          {/* Members list */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-700">
                {t("groupMembers")} ({groupMembers.length})
              </h3>
              <button
                onClick={handleNewMember}
                className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-amber-600"
              >
                + {t("newMember")}
              </button>
            </div>
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
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2 font-medium text-gray-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupMembers.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectMember(r)}
                  >
                    <td className="px-4 py-2">{r.room_num}</td>
                    <td className="px-4 py-2">{r.guest_name}</td>
                    <td className="px-4 py-2">{r.phone}</td>
                    <td className="px-4 py-2">{r.arrival_date}</td>
                    <td className="px-4 py-2">{r.depart_date}</td>
                    <td className="px-4 py-2">
                      {r.stay_cost.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {/* Gindiv_form */}
      {selected && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isNew ? t("newMember") : t("editMember")} — Gindiv_form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                ["groupe_name", t("groupName"), "text"],
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
              ] as [keyof RCS, string, string][]
            ).map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={selected[field] ?? ""}
                  readOnly={field === "groupe_name"}
                  onChange={(e) =>
                    handleChange(
                      field,
                      type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                    )
                  }
                  title={label}
                  className={`w-full border rounded-lg px-3 py-2 text-sm ${field === "groupe_name" ? "bg-gray-50" : ""}`}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("paymentMode")}
              </label>
              <select
                value={selected.payt_mode}
                onChange={(e) => handleChange("payt_mode", e.target.value)}
                title={t("paymentMode")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {paymentModes.map((m) => (
                  <option key={m.code} value={m.label}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            {(
              [
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
          {/* Available rooms for check-in mode */}
          {mode === "1117" && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">
                {t("availableRooms")}
              </h4>
              <div className="max-h-32 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      {[
                        t("roomNumber"),
                        t("designation"),
                        t("price1"),
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
                          <td className="py-1 px-2 text-green-600">VC</td>
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
    </div>
  );
}
