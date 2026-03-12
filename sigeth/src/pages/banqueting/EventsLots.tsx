import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { EventRecord } from "../../types";

export default function EventsLots() {
  const { t } = useLang();
  const { events, setEvents } = useHotelData();
  const [selected, setSelected] = useState<EventRecord | null>(null);
  const [isNew, setIsNew] = useState(false);

  const handleSave = () => {
    if (!selected) return;
    if (isNew) setEvents((prev) => [...prev, selected]);
    else
      setEvents((prev) =>
        prev.map((e) => (e.lot === selected.lot ? selected : e)),
      );
    setSelected(null);
  };

  const handleDelete = () => {
    if (!selected) return;
    setEvents((prev) => prev.filter((e) => e.lot !== selected.lot));
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("eventsLots")} — Fevents_form
        </h1>
        <button
          onClick={() => {
            setSelected({ lot: events.length + 1, nature: "" });
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
            {isNew ? t("newEvent") : t("editEvent")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("lot")}
              </label>
              <input
                type="number"
                value={selected.lot}
                onChange={(e) =>
                  setSelected({ ...selected, lot: Number(e.target.value) })
                }
                title={t("lot")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("nature")}
              </label>
              <input
                type="text"
                value={selected.nature}
                onChange={(e) =>
                  setSelected({ ...selected, nature: e.target.value })
                }
                title={t("nature")}
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
                {t("lot")}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                {t("nature")}
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr
                key={e.lot}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelected({ ...e });
                  setIsNew(false);
                }}
              >
                <td className="px-4 py-3 font-mono">{e.lot}</td>
                <td className="px-4 py-3">{e.nature}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
