import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { HSERVICE } from "../../types";

export default function LaundryServices() {
  const { t } = useLang();
  const { laundryServices, setLaundryServices, catlaundry } = useHotelData();
  const [selected, setSelected] = useState<HSERVICE | null>(null);
  const [isNew, setIsNew] = useState(false);

  const blank: HSERVICE = {
    designation: "",
    type: "",
    qty: 0,
    puv: 0,
    category: "",
    room_num: "",
    guest_name: "",
  };

  const handleSave = () => {
    if (!selected) return;
    if (isNew) setLaundryServices((prev) => [...prev, selected]);
    else
      setLaundryServices((prev) =>
        prev.map((s) =>
          s.designation === selected.designation &&
          s.category === selected.category
            ? selected
            : s,
        ),
      );
    setSelected(null);
  };

  const handleDelete = () => {
    if (!selected) return;
    setLaundryServices((prev) =>
      prev.filter(
        (s) =>
          !(
            s.designation === selected.designation &&
            s.category === selected.category
          ),
      ),
    );
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("laundryServices")}
        </h1>
        <button
          onClick={() => {
            setSelected({ ...blank });
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
            {isNew ? t("newService") : t("editService")} — Laundry_form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("designation")}
              </label>
              <input
                type="text"
                value={selected.designation}
                onChange={(e) =>
                  setSelected({ ...selected, designation: e.target.value })
                }
                title={t("designation")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("type")}
              </label>
              <input
                type="text"
                value={selected.type}
                onChange={(e) =>
                  setSelected({ ...selected, type: e.target.value })
                }
                title={t("type")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("qty")}
              </label>
              <input
                type="number"
                value={selected.qty}
                onChange={(e) =>
                  setSelected({ ...selected, qty: Number(e.target.value) })
                }
                title={t("qty")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("puv")}
              </label>
              <input
                type="number"
                value={selected.puv}
                onChange={(e) =>
                  setSelected({ ...selected, puv: Number(e.target.value) })
                }
                title={t("puv")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("category")}
              </label>
              <select
                value={selected.category}
                onChange={(e) =>
                  setSelected({ ...selected, category: e.target.value })
                }
                title={t("category")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">{t("selectCategory")}</option>
                {catlaundry.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("roomNumber")}
              </label>
              <input
                type="text"
                value={selected.room_num}
                onChange={(e) =>
                  setSelected({ ...selected, room_num: e.target.value })
                }
                title={t("roomNumber")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("guestName")}
              </label>
              <input
                type="text"
                value={selected.guest_name}
                onChange={(e) =>
                  setSelected({ ...selected, guest_name: e.target.value })
                }
                title={t("guestName")}
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
                t("designation"),
                t("type"),
                t("qty"),
                t("puv"),
                t("category"),
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
            {laundryServices.map((s, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelected({ ...s });
                  setIsNew(false);
                }}
              >
                <td className="px-4 py-3">{s.designation}</td>
                <td className="px-4 py-3">{s.type}</td>
                <td className="px-4 py-3">{s.qty}</td>
                <td className="px-4 py-3">{s.puv.toLocaleString()}</td>
                <td className="px-4 py-3">{s.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
