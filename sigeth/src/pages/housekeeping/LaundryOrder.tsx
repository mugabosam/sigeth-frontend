import { useState, useMemo } from "react";
import {
  Save,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
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
  const { catlaundry, setJlaundry, rooms } = useHotelData();
  const [selectedCat, setSelectedCat] = useState("");
  const [roomNum, setRoomNum] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [items, setItems] = useState<BufferItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  // Filter occupied rooms matching the typed room number
  const occupiedSuggestions = useMemo(() => {
    if (!roomNum.trim()) return [];
    return rooms.filter(
      (r) => r.status === "OCC" && r.room_num.startsWith(roomNum),
    );
  }, [roomNum, rooms]);

  const handleSelectRoom = (num: string) => {
    setRoomNum(num);
    setShowSuggestions(false);
    const newErrors = { ...errors };
    delete newErrors["roomNum"];
    setErrors(newErrors);
  };

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
    if (qty < 0 || qty > 999) return;
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, orderQty: qty } : item)),
    );
  };

  const validateOrder = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!roomNum.trim()) {
      newErrors["roomNum"] = t("roomNumberRequired");
    } else {
      const room = rooms.find((r) => r.room_num === roomNum);
      if (!room) {
        newErrors["roomNum"] = t("roomNotFound");
      } else if (room.status !== "OCC") {
        newErrors["roomNum"] = t("roomNotOccupied");
      }
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

  // Open confirmation modal
  const handleSave = () => {
    if (!validateOrder()) return;
    setConfirmSaveOpen(true);
  };

  // Execute after user confirms
  const confirmSave = async () => {
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

      setResultMessage(t("laundryOrderSuccess"));
      setShowResultModal(true);
      setItems([]);
      setSelectedCat("");
      setRoomNum("");
      setErrors({});
    } catch (error) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : t("laundryOrderFailed");
      setResultMessage(`Error: ${errorMessage}`);
      setShowResultModal(true);
    } finally {
      setConfirmSaveOpen(false);
    }
  };

  const totalOrder = items.reduce((s, i) => s + i.orderQty * i.puv, 0);

  // Guest name from the matched occupied room
  const matchedRoom = rooms.find(
    (r) => r.room_num === roomNum && r.status === "OCC",
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
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
              className={`w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                errors["orderDate"]
                  ? "border-hotel-danger bg-red-50"
                  : ""
              }`}
            />
            {errors["orderDate"] && (
              <p className="text-hotel-danger text-xs mt-2 font-medium">
                {errors["orderDate"]}
              </p>
            )}
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
              {t("roomNumber")}
            </label>
            <input
              type="text"
              value={roomNum}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setRoomNum(val);
                setShowSuggestions(true);
                if (val.trim()) {
                  const newErrors = { ...errors };
                  delete newErrors["roomNum"];
                  setErrors(newErrors);
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="e.g., 101"
              title={t("roomNumber")}
              className={`w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                errors["roomNum"]
                  ? "border-hotel-danger bg-red-50"
                  : ""
              }`}
            />
            {errors["roomNum"] && (
              <p className="text-hotel-danger text-xs mt-2 font-medium">
                {errors["roomNum"]}
              </p>
            )}
            {/* Autocomplete dropdown for occupied rooms */}
            {showSuggestions && roomNum.trim() && occupiedSuggestions.length > 0 && (
              <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-hotel-border rounded shadow-lg max-h-48 overflow-y-auto">
                {occupiedSuggestions.map((r) => (
                  <li key={r.room_num}>
                    <button
                      type="button"
                      onMouseDown={() => handleSelectRoom(r.room_num)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 transition-colors flex justify-between items-center"
                    >
                      <span className="font-semibold text-hotel-gold">{r.room_num}</span>
                      <span className="text-hotel-text-secondary text-xs">
                        {r.guest_name} — {r.designation}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
              {t("laundryCategory")}
            </label>
            <select
              value={selectedCat}
              onChange={(e) => handleSelectCategory(e.target.value)}
              title={t("laundryCategory")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
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
        {/* Show matched guest info */}
        {matchedRoom && (
          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs">
            <span className="font-semibold text-hotel-gold">{t("guest")}:</span>{" "}
            <span className="text-hotel-text-primary">{matchedRoom.guest_name}</span>
            {matchedRoom.designation && (
              <>
                {" — "}
                <span className="text-hotel-text-secondary">{matchedRoom.designation}</span>
              </>
            )}
          </div>
        )}
        {errors["items"] && (
          <p className="text-hotel-danger text-sm">{errors["items"]}</p>
        )}
      </div>
      {items.length > 0 && (
        <div className="bg-white rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-hotel-navy text-white sticky top-0">
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
                    className="text-left py-2 px-2 font-medium"
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
                  className="border-b border-hotel-border hover:bg-hotel-cream transition-colors"
                >
                  <td className="py-2 px-2 text-hotel-text-primary">
                    {item.designation}
                  </td>
                  <td className="py-2 px-2 text-hotel-text-primary">{item.type}</td>
                  <td className="py-2 px-2 text-hotel-text-primary">
                    {item.puv.toLocaleString()}
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={item.orderQty}
                      min={0}
                      onChange={(e) =>
                        handleQtyChange(i, Number(e.target.value))
                      }
                      title={t("qty")}
                      className="w-20 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
                    />
                  </td>
                  <td className="py-2 px-2 font-semibold text-hotel-gold">
                    {(item.orderQty * item.puv).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-2 py-2 border-t border-hotel-border flex justify-between items-center">
            <span className="font-bold text-hotel-text-primary">
              {t("total")}:{" "}
              <span className="text-hotel-gold">
                {totalOrder.toLocaleString()}
              </span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
              >
                <Save size={14} />
                {t("placeOrder")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmSaveOpen}
        title={t("confirm")}
        message={`${t("confirmLaundryOrder")} ${roomNum}?`}
        onConfirm={confirmSave}
        onCancel={() => setConfirmSaveOpen(false)}
      />

      {/* Success/Error Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white border border-hotel-border rounded p-4 max-w-sm mx-auto">
            <div className="flex items-center gap-3 mb-4">
              {resultMessage.includes("Error") ? (
                <div className="w-10 h-10 rounded-full bg-hotel-danger/20 flex items-center justify-center">
                  <AlertTriangle className="text-hotel-danger" size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-hotel-success/20 flex items-center justify-center">
                  <CheckCircle2 className="text-hotel-success" size={20} />
                </div>
              )}
              <h3 className="text-base font-semibold text-hotel-text-primary">
                {resultMessage.includes("Error") ? t("error") : t("success")}
              </h3>
            </div>
            <p className="text-sm text-hotel-text-secondary mb-4">
              {resultMessage}
            </p>
            <button
              onClick={() => setShowResultModal(false)}
              className="w-full bg-hotel-gold text-white py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
