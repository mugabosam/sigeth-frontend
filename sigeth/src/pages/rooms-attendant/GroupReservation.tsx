import { useState } from "react";
import { Search, Plus, Save, Trash2 } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { GRC } from "../../types";

export default function GroupReservation() {
  const { t } = useLang();
  const { groupReservations, setGroupReservations } = useHotelData();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GRC | null>(null);
  const [isNew, setIsNew] = useState(false);

  const blank: GRC = {
    code_g: "",
    groupe_name: "",
    phone: "",
    nationality: "",
    email: "",
    tin: "",
    number_pers: 0,
    arrival_date: "",
    depart_date: "",
    puv: 0,
    current_mon: "RWF",
    exchange: 1,
    qty: 0,
    payt_mode: "Cash",
    discount: 0,
    stay_cost: 0,
    deposit: 0,
    status: 0,
  };

  const handleSearch = () => {
    const found = groupReservations.find(
      (g) =>
        g.groupe_name.toLowerCase().includes(query.toLowerCase()) ||
        g.code_g === query,
    );
    if (found) {
      setSelected({ ...found });
      setIsNew(false);
    } else {
      setSelected({ ...blank, groupe_name: query });
      setIsNew(true);
    }
  };

  const calc = (f: GRC) => {
    const arr = f.arrival_date ? new Date(f.arrival_date) : null;
    const dep = f.depart_date ? new Date(f.depart_date) : null;
    const qty =
      arr && dep
        ? Math.max(Math.round((dep.getTime() - arr.getTime()) / 86400000), 0)
        : 0;
    const base = qty * f.puv;
    const stay_cost = f.discount > 0 ? base * (1 - f.discount / 100) : base;
    return { ...f, qty, stay_cost };
  };

  const handleChange = (field: keyof GRC, value: string | number) => {
    if (!selected) return;
    const updated = { ...selected, [field]: value };
    setSelected(calc(updated));
  };

  const handleSave = () => {
    if (!selected) return;
    if (isNew) setGroupReservations((prev) => [...prev, selected]);
    else
      setGroupReservations((prev) =>
        prev.map((g) => (g.code_g === selected.code_g ? selected : g)),
      );
    setSelected(null);
    setQuery("");
  };

  const handleDelete = () => {
    if (!selected) return;
    setGroupReservations((prev) =>
      prev.filter((g) => g.code_g !== selected.code_g),
    );
    setSelected(null);
    setQuery("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {t("groupReservation")}
      </h1>
      {/* Query window */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchGroupName")}
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
      {/* Group_form */}
      {selected && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isNew ? t("newGroup") : t("editGroup")} — Group_form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ["groupe_name", t("groupName"), "text"],
                ["phone", t("phone"), "text"],
                ["email", t("email"), "email"],
                ["tin", t("tin"), "text"],
                ["arrival_date", t("arrivalDate"), "date"],
                ["puv", t("rateDay"), "number"],
                ["stay_cost", t("stayCost"), "number"],
                ["current_mon", t("currency"), "text"],
                ["depart_date", t("departDate"), "date"],
                ["qty", t("nightNum"), "number"],
                ["deposit", t("deposit"), "number"],
              ] as [keyof GRC, string, string][]
            ).map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={selected[field] ?? ""}
                  readOnly={field === "qty" || field === "stay_cost"}
                  onChange={(e) =>
                    handleChange(
                      field,
                      type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                    )
                  }
                  title={label}
                  className={`w-full border rounded-lg px-3 py-2 text-sm ${field === "qty" || field === "stay_cost" ? "bg-gray-50" : ""}`}
                />
              </div>
            ))}
          </div>
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
      {/* Existing groups list */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("groupCode"),
                t("groupName"),
                t("phone"),
                t("arrivalDate"),
                t("departDate"),
                t("persons"),
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
            {groupReservations.map((g) => (
              <tr
                key={g.code_g}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelected({ ...g });
                  setIsNew(false);
                }}
              >
                <td className="px-4 py-3">{g.code_g}</td>
                <td className="px-4 py-3 font-medium">{g.groupe_name}</td>
                <td className="px-4 py-3">{g.phone}</td>
                <td className="px-4 py-3">{g.arrival_date}</td>
                <td className="px-4 py-3">{g.depart_date}</td>
                <td className="px-4 py-3">{g.number_pers}</td>
                <td className="px-4 py-3">
                  {g.stay_cost.toLocaleString()} {g.current_mon}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${g.status === 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {g.status === 0 ? t("statusOpen") : t("statusClosed")}
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
