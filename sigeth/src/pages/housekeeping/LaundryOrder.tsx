import { useState } from "react";
import { Save } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { JLAUNDRY } from "../../types";
import { housekeepingApi } from "../../services/sigethApi";

type BufferItem = {
  id?: string;
  designation: string;
  type?: string;
  unity: number;
  puv: number;
  qty: number;
  orderQty: number;
};

export default function LaundryOrder() {
  const { t } = useLang();
  const { catlaundry, setJlaundry } = useHotelData();
  const [selectedCat, setSelectedCat] = useState("");
  const [roomNum, setRoomNum] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [items, setItems] = useState<BufferItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelectCategory = async (cat: string) => {
    setSelectedCat(cat);
    try {
      const loaded = await housekeepingApi.loadLaundryBuffer({ category: cat });
      setItems(
        loaded.map((s) => ({
          id: s.id,
          designation: s.designation,
          type: "",
          unity: s.unity,
          puv: s.price,
          qty: s.qty,
          orderQty: 0,
        })),
      );
    } catch {
      setItems([]);
    }
  };

  const handleQtyChange = (idx: number, qty: number) => {
    // Validate quantity: must be between 0 and 999
    if (qty < 0 || qty > 999) return;
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, orderQty: qty } : item)),
    );
  };

  const validateOrder = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!roomNum.trim()) {
      newErrors["roomNum"] = t("roomNumberRequired");
    }

    if (!orderDate) {
      newErrors["orderDate"] = t("dateRequired");
    }

    if (items.filter((i) => i.orderQty > 0).length === 0) {
      newErrors["items"] = t("fieldRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateOrder()) return;

    try {
      for (const item of items.filter((i) => i.orderQty > 0 && i.id)) {
        await housekeepingApi.updateLaundryBuffer(item.id!, {
          qty: item.orderQty,
          room_num: roomNum,
          date: orderDate,
        });
      }

      await housekeepingApi.confirmLaundry({ room_num: roomNum });
      const journal = await housekeepingApi.laundryJournal();
      setJlaundry(journal as JLAUNDRY[]);
    } catch {
      return;
    }

    setItems([]);
    setSelectedCat("");
    setRoomNum("");
    setErrors({});
  };

  const totalOrder = items.reduce((s, i) => s + i.orderQty * i.puv, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
          {t("laundryOrder")}
        </h1>
        <p className="text-sm text-gray-600">{t("placeLaundryOrderDesc")}</p>
      </div>
      <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-7 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("date")}
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => {
                setOrderDate(e.target.value);
                if (e.target.value) {
                  const newErrors = { ...errors };
                  delete newErrors["orderDate"];
                  setErrors(newErrors);
                }
              }}
              title={t("date")}
              className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none ${
                errors["orderDate"]
                  ? "border-red-400 bg-red-50 focus:border-red-500"
                  : "border-gray-200 hover:border-gray-300 focus:border-emerald-500"
              }`}
            />
            {errors["orderDate"] && (
              <p className="text-red-600 text-xs mt-2 font-medium">
                {errors["orderDate"]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("roomNumber")}
            </label>
            <input
              type="text"
              value={roomNum}
              onChange={(e) => {
                setRoomNum(e.target.value.toUpperCase());
                if (e.target.value.trim()) {
                  const newErrors = { ...errors };
                  delete newErrors["roomNum"];
                  setErrors(newErrors);
                }
              }}
              placeholder="e.g., 101"
              title={t("roomNumber")}
              className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none ${
                errors["roomNum"]
                  ? "border-red-400 bg-red-50 focus:border-red-500"
                  : "border-gray-200 hover:border-gray-300 focus:border-emerald-500"
              }`}
            />
            {errors["roomNum"] && (
              <p className="text-red-600 text-xs mt-2 font-medium">
                {errors["roomNum"]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("laundryCategory")}
            </label>
            <select
              value={selectedCat}
              onChange={(e) => handleSelectCategory(e.target.value)}
              title={t("laundryCategory")}
              className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
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
        {errors["items"] && (
          <p className="text-red-500 text-sm">{errors["items"]}</p>
        )}
      </div>
      {items.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-emerald-200">
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
                    className="text-left px-6 py-3 font-bold text-gray-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-emerald-50/50 transition-colors duration-150"
                >
                  <td className="px-6 py-3 text-gray-700">
                    {item.designation}
                  </td>
                  <td className="px-6 py-3 text-gray-700">{item.type}</td>
                  <td className="px-6 py-3 text-gray-700">
                    {item.puv.toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      value={item.orderQty}
                      min={0}
                      onChange={(e) =>
                        handleQtyChange(i, Number(e.target.value))
                      }
                      title={t("qty")}
                      className="w-20 border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-2 py-1.5 text-sm font-medium transition-all"
                    />
                  </td>
                  <td className="px-6 py-3 font-semibold text-emerald-700">
                    {(item.orderQty * item.puv).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border-t-2 border-emerald-200 flex justify-between items-center">
            <span className="font-bold text-gray-800">
              {t("total")}:{" "}
              <span className="text-emerald-700">
                {totalOrder.toLocaleString()}
              </span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200"
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
