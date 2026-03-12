import { useState } from "react";
import { Save, Trash2, Plus } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { CATROOM } from "../../types";

export default function RoomCategories() {
  const { t } = useLang();
  const { catrooms, setCatrooms } = useHotelData();
  const [selected, setSelected] = useState<CATROOM | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleSave = () => {
    if (!selected) return;
    if (isNew) setCatrooms((prev) => [...prev, selected]);
    else
      setCatrooms((prev) =>
        prev.map((c) => (c.code === selected.code ? selected : c)),
      );
    setSelected(null);
  };

  const handleDelete = () => {
    if (!selected) return;
    setCatrooms((prev) => prev.filter((c) => c.code !== selected.code));
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("roomCategories")}
        </h1>
        <button
          onClick={() => {
            setSelected({ code: catrooms.length + 1, name: "" });
            setIsNew(true);
          }}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
        >
          <Plus size={16} />
          {t("newRecord")}
        </button>
      </div>
      {selected && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold">
            {isNew ? t("newCategory") : t("editCategory")} — Catform
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("code")}
              </label>
              <input
                type="number"
                value={selected.code}
                onChange={(e) =>
                  setSelected({ ...selected, code: Number(e.target.value) })
                }
                title={t("code")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("categoryName")}
              </label>
              <input
                type="text"
                value={selected.name}
                onChange={(e) =>
                  setSelected({ ...selected, name: e.target.value })
                }
                title={t("categoryName")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                {t("code")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                {t("categoryName")}
              </th>
            </tr>
          </thead>
          <tbody>
            {catrooms.map((c) => (
              <tr
                key={c.code}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelected({ ...c });
                  setIsNew(false);
                }}
              >
                <td className="px-4 py-3 font-medium">{c.code}</td>
                <td className="px-4 py-3">{c.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
