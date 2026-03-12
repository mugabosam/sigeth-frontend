import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { BanquetService } from "../../types";

export default function ServicesPrices() {
  const { t } = useLang();
  const { events, banquetServices, setBanquetServices } = useHotelData();
  const [selectedLot, setSelectedLot] = useState<number | null>(null);
  const [selected, setSelected] = useState<BanquetService | null>(null);
  const [isNew, setIsNew] = useState(false);

  const event = events.find((e) => e.lot === selectedLot);
  const filtered = banquetServices.filter((b) => b.lot === selectedLot);

  const handleSave = () => {
    if (!selected || !event) return;
    const record = { ...selected, lot: event.lot, nature: event.nature };
    if (isNew) setBanquetServices((prev) => [...prev, record]);
    else
      setBanquetServices((prev) =>
        prev.map((b) =>
          b.item === selected.item && b.lot === selected.lot ? record : b,
        ),
      );
    setSelected(null);
  };

  const handleDelete = () => {
    if (!selected) return;
    setBanquetServices((prev) =>
      prev.filter((b) => !(b.item === selected.item && b.lot === selected.lot)),
    );
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("servicesPrices")} — Bform
        </h1>
      </div>
      {/* Event selection */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("selectEvent")}
        </label>
        <div className="flex flex-wrap gap-2">
          {events.map((e) => (
            <button
              key={e.lot}
              onClick={() => setSelectedLot(e.lot)}
              className={`px-4 py-2 rounded-lg text-sm border ${selectedLot === e.lot ? "bg-amber-500 text-white border-amber-500" : "hover:bg-gray-50"}`}
            >
              {e.lot} — {e.nature}
            </button>
          ))}
        </div>
      </div>
      {selectedLot !== null && event && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {t("servicesFor")}: {event.nature}
            </h2>
            <button
              onClick={() => {
                setSelected({
                  date: new Date().toISOString().split("T")[0],
                  lot: event.lot,
                  nature: event.nature,
                  item: "",
                  unity: 1,
                  qty: 0,
                  puv: 0,
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {t("date")}
                  </label>
                  <input
                    type="date"
                    value={selected.date}
                    onChange={(e) =>
                      setSelected({ ...selected, date: e.target.value })
                    }
                    title={t("date")}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {t("item")}
                  </label>
                  <input
                    type="text"
                    value={selected.item}
                    onChange={(e) =>
                      setSelected({ ...selected, item: e.target.value })
                    }
                    title={t("item")}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {t("unity")}
                  </label>
                  <input
                    type="number"
                    value={selected.unity}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        unity: Number(e.target.value),
                      })
                    }
                    title={t("unity")}
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
                    {t("amount")}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={(selected.qty * selected.puv).toLocaleString()}
                    title={t("amount")}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
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
                    t("date"),
                    t("item"),
                    t("unity"),
                    t("qty"),
                    t("puv"),
                    t("amount"),
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
                {filtered.map((b, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelected({ ...b });
                      setIsNew(false);
                    }}
                  >
                    <td className="px-4 py-3">{b.date}</td>
                    <td className="px-4 py-3">{b.item}</td>
                    <td className="px-4 py-3">{b.unity}</td>
                    <td className="px-4 py-3">{b.qty}</td>
                    <td className="px-4 py-3">{b.puv.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold">
                      {(b.qty * b.puv).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
