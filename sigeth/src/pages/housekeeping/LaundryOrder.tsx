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
    <div className="min-h-screen bg-gradient-to-br from-hotel-paper to-hotel-cream p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
          {t("laundryOrder")}
        </h1>
        <p className="text-sm text-hotel-text-secondary">{t("placeLaundryOrderDesc")}</p>
      </div>
      <div className="bg-white rounded border border-hotel-border p-7 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-semibold text-hotel-text-primary mb-2">
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
              className={`w-full border-2 rounded px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none ${
                errors["orderDate"]
                  ? "border-hotel-gold bg-hotel-cream focus:border-hotel-gold"
                  : "border-hotel-border hover:border-hotel-border focus:border-hotel-gold"
              }`}
            />
            {errors["orderDate"] && (
              <p className="text-hotel-gold text-xs mt-2 font-medium">
                {errors["orderDate"]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-hotel-text-primary mb-2">
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
              className={`w-full border-2 rounded px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none ${
                errors["roomNum"]
                  ? "border-hotel-gold bg-hotel-cream focus:border-hotel-gold"
                  : "border-hotel-border hover:border-hotel-border focus:border-hotel-gold"
              }`}
            />
            {errors["roomNum"] && (
              <p className="text-hotel-gold text-xs mt-2 font-medium">
                {errors["roomNum"]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-hotel-text-primary mb-2">
              {t("laundryCategory")}
            </label>
            <select
              value={selectedCat}
              onChange={(e) => handleSelectCategory(e.target.value)}
              title={t("laundryCategory")}
              className="w-full border-2 border-hotel-border hover:border-hotel-border focus:border-hotel-gold focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors"
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
          <p className="text-hotel-gold text-sm">{errors["items"]}</p>
        )}
      </div>
      {items.length > 0 && (
        <div className="bg-white rounded border border-hotel-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white border-b-2 border-hotel-border">
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
                    className="text-left px-6 py-3 font-bold text-hotel-text-primary"
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
                  className="border-b hover:bg-hotel-cream/50 transition-colors duration-150"
                >
                  <td className="px-6 py-3 text-hotel-text-primary">
                    {item.designation}
                  </td>
                  <td className="px-6 py-3 text-hotel-text-primary">{item.type}</td>
                  <td className="px-6 py-3 text-hotel-text-primary">
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
                      className="w-20 border-2 border-hotel-border hover:border-hotel-border focus:border-hotel-gold focus:outline-none rounded px-2 py-1.5 text-sm font-medium transition-colors"
                    />
                  </td>
                  <td className="px-6 py-3 font-semibold text-hotel-gold">
                    {(item.orderQty * item.puv).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-gradient-to-r from-hotel-paper to-hotel-cream border-t-2 border-hotel-border flex justify-between items-center">
            <span className="font-bold text-hotel-text-primary">
              {t("total")}:{" "}
              <span className="text-hotel-gold">
                {totalOrder.toLocaleString()}
              </span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-colors duration-200"
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



