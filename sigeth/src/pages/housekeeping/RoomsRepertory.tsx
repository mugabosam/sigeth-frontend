import { useState } from "react";
import { Search, Plus, Save, Trash2 } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { RDF } from "../../types";

export default function RoomsRepertory() {
  const { t } = useLang();
  const { rooms, setRooms, catrooms } = useHotelData();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RDF | null>(null);
  const [isNew, setIsNew] = useState(false);

  const blank: RDF = {
    categorie: 1,
    room_num: "",
    designation: "",
    price_1: 0,
    price_2: 0,
    guest_name: "",
    twin_name: "",
    twin_num: 0,
    current_mon: "RWF",
    status: "VC",
    arrival_date: "",
    depart_date: "",
    qty: 0,
    puv: 0,
    deposit: 0,
    date: new Date().toISOString().split("T")[0],
  };

  const handleSearch = () => {
    const found = rooms.find((r) => r.room_num === query);
    if (found) {
      setSelected({ ...found });
      setIsNew(false);
    } else {
      setSelected({ ...blank, room_num: query });
      setIsNew(true);
    }
  };

  const handleChange = (field: keyof RDF, value: string | number) => {
    if (!selected) return;
    setSelected({ ...selected, [field]: value });
  };

  const handleSave = () => {
    if (!selected) return;
    if (isNew) setRooms((prev) => [...prev, selected]);
    else
      setRooms((prev) =>
        prev.map((r) => (r.room_num === selected.room_num ? selected : r)),
      );
    setSelected(null);
    setQuery("");
  };

  const handleDelete = () => {
    if (!selected) return;
    setRooms((prev) => prev.filter((r) => r.room_num !== selected.room_num));
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {t("roomsRepertory")}
      </h1>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("roomNumber")}
            className="border rounded-lg px-4 py-2 text-sm w-40"
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
      {selected && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {isNew ? t("newRoom") : t("editRoom")} — Room_form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("category")}
              </label>
              <select
                value={selected.categorie}
                onChange={(e) =>
                  handleChange("categorie", Number(e.target.value))
                }
                title={t("category")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {catrooms.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            {(
              [
                ["room_num", t("roomNumber"), "text"],
                ["designation", t("designation"), "text"],
                ["price_1", t("price1"), "number"],
                ["price_2", t("price2"), "number"],
                ["current_mon", t("currency"), "text"],
                ["puv", t("puv"), "number"],
              ] as [keyof RDF, string, string][]
            ).map(([field, label, type]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={selected[field] ?? ""}
                  onChange={(e) =>
                    handleChange(
                      field,
                      type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                    )
                  }
                  title={label}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
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
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("roomNumber"),
                t("designation"),
                t("category"),
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
            {rooms.map((r) => (
              <tr
                key={r.room_num}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelected({ ...r });
                  setIsNew(false);
                }}
              >
                <td className="px-4 py-3 font-medium">{r.room_num}</td>
                <td className="px-4 py-3">{r.designation}</td>
                <td className="px-4 py-3">
                  {catrooms.find((c) => c.code === r.categorie)?.name ??
                    r.categorie}
                </td>
                <td className="px-4 py-3">{r.price_1.toLocaleString()}</td>
                <td className="px-4 py-3">{r.price_2.toLocaleString()}</td>
                <td className="px-4 py-3">{r.current_mon}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
                    {r.status}
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
