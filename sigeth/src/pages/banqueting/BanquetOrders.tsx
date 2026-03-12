import { useState } from "react";
import { Save, ShoppingCart } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { JBANQUET } from "../../types";

interface BufferItem {
  item: string;
  unity: number;
  price: number;
  qty: number;
  total: number;
}

export default function BanquetOrders() {
  const { t } = useLang();
  const { groupReservations, events, banquetServices, jbanquet, setJbanquet } =
    useHotelData();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedLot, setSelectedLot] = useState<number | null>(null);
  const [buffer, setBuffer] = useState<BufferItem[]>([]);
  const [error, setError] = useState("");

  const activeGroups = groupReservations.filter((g) => g.status === 0);
  const group = activeGroups.find((g) => g.code_g === selectedGroup);

  const loadServices = (lot: number) => {
    setSelectedLot(lot);
    const items = banquetServices.filter((b) => b.lot === lot);
    setBuffer(
      items.map((b) => ({
        item: b.item,
        unity: b.unity,
        price: b.puv,
        qty: 0,
        total: 0,
      })),
    );
  };

  const updateQty = (idx: number, qty: number) => {
    setBuffer((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, qty, total: b.price * qty } : b)),
    );
  };

  const handleTransfer = () => {
    if (!group || selectedLot === null) return;
    const event = events.find((e) => e.lot === selectedLot);
    if (!event) return;
    const orderItems = buffer.filter((b) => b.qty > 0);
    if (orderItems.length === 0) {
      setError(t("noItemsSelected"));
      return;
    }
    const date = new Date().toISOString().split("T")[0];
    const entries: JBANQUET[] = orderItems.map((b) => ({
      date,
      room_num: "",
      groupe_name: group.groupe_name,
      lot: event.lot,
      nature: event.nature,
      item: b.item,
      unity: b.unity,
      qty: b.qty,
      price: b.price,
      total: b.total,
    }));
    setJbanquet((prev) => [...prev, ...entries]);
    setBuffer([]);
    setSelectedLot(null);
    setError("");
  };

  const grandTotal = buffer.reduce((s, b) => s + b.total, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {t("banquetOrders")} — T_BANQUET → JBANQUET
      </h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {/* Step 1: Select active group */}
      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
        <h3 className="font-semibold text-sm">
          {t("step")} 1: {t("selectGroup")}
        </h3>
        <select
          value={selectedGroup}
          onChange={(e) => {
            setSelectedGroup(e.target.value);
            setSelectedLot(null);
            setBuffer([]);
            setError("");
          }}
          title={t("selectGroup")}
          className="border rounded-lg px-3 py-2 text-sm w-full max-w-md"
        >
          <option value="">{t("selectGroup")}...</option>
          {activeGroups.map((g) => (
            <option key={g.code_g} value={g.code_g}>
              {g.code_g} — {g.groupe_name}
            </option>
          ))}
        </select>
        {selectedGroup && !group && (
          <p className="text-red-600 text-sm">{t("groupClosed")}</p>
        )}
      </div>
      {/* Step 2: Select event */}
      {group && (
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
          <h3 className="font-semibold text-sm">
            {t("step")} 2: {t("selectEvent")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {events.map((e) => (
              <button
                key={e.lot}
                onClick={() => loadServices(e.lot)}
                className={`px-4 py-2 rounded-lg text-sm border ${selectedLot === e.lot ? "bg-amber-500 text-white border-amber-500" : "hover:bg-gray-50"}`}
              >
                {e.lot} — {e.nature}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Step 3: Enter quantities */}
      {buffer.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm">
              {t("step")} 3: {t("enterQuantities")}
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[t("item"), t("unity"), t("price"), t("qty"), t("total")].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-medium text-gray-600"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {buffer.map((b, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-3">{b.item}</td>
                  <td className="px-4 py-3">{b.unity}</td>
                  <td className="px-4 py-3">{b.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={b.qty}
                      onChange={(e) => updateQty(i, Number(e.target.value))}
                      title={t("qty")}
                      className="w-20 border rounded-lg px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {b.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-amber-50 border-t">
              <tr>
                <td colSpan={4} className="px-4 py-3 font-semibold text-right">
                  {t("grandTotal")}
                </td>
                <td className="px-4 py-3 font-bold">
                  {grandTotal.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="p-4 border-t">
            <button
              onClick={handleTransfer}
              className="bg-amber-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
            >
              <Save size={16} />
              {t("transferToJournal")}
            </button>
          </div>
        </div>
      )}
      {/* Existing JBANQUET records */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <ShoppingCart size={18} />
          <h3 className="font-semibold text-sm">
            {t("journalEntries")}: {jbanquet.length}
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("date"),
                t("groupName"),
                t("nature"),
                t("item"),
                t("qty"),
                t("price"),
                t("total"),
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
            {jbanquet.map((j, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{j.date}</td>
                <td className="px-4 py-3">{j.groupe_name}</td>
                <td className="px-4 py-3">{j.nature}</td>
                <td className="px-4 py-3">{j.item}</td>
                <td className="px-4 py-3">{j.qty}</td>
                <td className="px-4 py-3">{j.price.toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold">
                  {j.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
