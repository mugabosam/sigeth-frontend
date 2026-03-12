import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { HSTAFF } from "../../types";

export default function HousekeepingStaff() {
  const { t } = useLang();
  const { staff, setStaff } = useHotelData();
  const [selected, setSelected] = useState<HSTAFF | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleSave = () => {
    if (!selected) return;
    if (isNew) setStaff((prev) => [...prev, selected]);
    else
      setStaff((prev) =>
        prev.map((s) => (s.number === selected.number ? selected : s)),
      );
    setSelected(null);
  };

  const handleDelete = () => {
    if (!selected) return;
    setStaff((prev) => prev.filter((s) => s.number !== selected.number));
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("housekeepingStaff")}
        </h1>
        <button
          onClick={() => {
            setSelected({
              number: staff.length + 1,
              first_name: "",
              last_name: "",
              poste: "",
            });
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
            {isNew ? t("newStaff") : t("editStaff")} — Staff_form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("staffNumber")}
              </label>
              <input
                type="number"
                value={selected.number}
                onChange={(e) =>
                  setSelected({ ...selected, number: Number(e.target.value) })
                }
                title={t("staffNumber")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("firstName")}
              </label>
              <input
                type="text"
                value={selected.first_name}
                onChange={(e) =>
                  setSelected({ ...selected, first_name: e.target.value })
                }
                title={t("firstName")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("lastName")}
              </label>
              <input
                type="text"
                value={selected.last_name}
                onChange={(e) =>
                  setSelected({ ...selected, last_name: e.target.value })
                }
                title={t("lastName")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("poste")}
              </label>
              <input
                type="text"
                value={selected.poste}
                onChange={(e) =>
                  setSelected({ ...selected, poste: e.target.value })
                }
                title={t("poste")}
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
              {[
                t("staffNumber"),
                t("firstName"),
                t("lastName"),
                t("poste"),
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
            {staff.map((s) => (
              <tr
                key={s.number}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelected({ ...s });
                  setIsNew(false);
                }}
              >
                <td className="px-4 py-3 font-medium">{s.number}</td>
                <td className="px-4 py-3">{s.first_name}</td>
                <td className="px-4 py-3">{s.last_name}</td>
                <td className="px-4 py-3">{s.poste}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
