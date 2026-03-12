import { useState } from "react";
import { Save } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { JLAUNDRY } from "../../types";

export default function LaundryOrder() {
  const { t } = useLang();
  const { laundryServices, catlaundry, setJlaundry } = useHotelData();
  const [selectedCat, setSelectedCat] = useState("");
  const [roomNum, setRoomNum] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [items, setItems] = useState<
    ((typeof laundryServices)[0] & { orderQty: number })[]
  >([]);

  const handleSelectCategory = (cat: string) => {
    setSelectedCat(cat);
    setItems(
      laundryServices
        .filter((s) => s.category === cat)
        .map((s) => ({ ...s, orderQty: 0 })),
    );
  };

  const handleQtyChange = (idx: number, qty: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, orderQty: qty } : item)),
    );
  };

  const handleSave = () => {
    const entries: JLAUNDRY[] = items
      .filter((i) => i.orderQty > 0)
      .map((i) => ({
        date: orderDate,
        room_num: roomNum,
        designation: i.designation,
        unity: 1,
        qty: i.orderQty,
        price: i.puv,
        total: i.orderQty * i.puv,
      }));
    setJlaundry((prev) => [...prev, ...entries]);
    setItems([]);
    setSelectedCat("");
    setRoomNum("");
  };

  const totalOrder = items.reduce((s, i) => s + i.orderQty * i.puv, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{t("laundryOrder")}</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t("date")}
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              title={t("date")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t("roomNumber")}
            </label>
            <input
              type="text"
              value={roomNum}
              onChange={(e) => setRoomNum(e.target.value)}
              title={t("roomNumber")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t("laundryCategory")}
            </label>
            <select
              value={selectedCat}
              onChange={(e) => handleSelectCategory(e.target.value)}
              title={t("laundryCategory")}
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
        </div>
      </div>
      {items.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  t("designation"),
                  t("type"),
                  t("pricePerUnit"),
                  t("qty"),
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
              {items.map((item, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{item.designation}</td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3">{item.puv.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.orderQty}
                      min={0}
                      onChange={(e) =>
                        handleQtyChange(i, Number(e.target.value))
                      }
                      title={t("qty")}
                      className="w-20 border rounded-lg px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {(item.orderQty * item.puv).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
            <span className="font-semibold">
              {t("total")}: {totalOrder.toLocaleString()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-amber-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
              >
                <Save size={16} />
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
