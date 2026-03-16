import { useState } from "react";
import { Save, ShoppingCart, Clock } from "lucide-react";
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

// Predefined event types per Banqueting specifications
const EVENT_TYPES = [
  { value: "Conference", label: "Conferences" },
  { value: "Seminar", label: "Seminars" },
  { value: "Wedding", label: "Weddings" },
  { value: "Celebration", label: "Celebrations" },
  { value: "Evening", label: "Evenings" },
  { value: "Concert", label: "Concerts" },
  { value: "Dinner", label: "Dinners" },
  { value: "SportsActivity", label: "Sports Activities" },
];

export default function BanquetOrders() {
  const { t } = useLang();
  const { groupReservations, events, banquetServices, jbanquet, setJbanquet } =
    useHotelData();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedLot, setSelectedLot] = useState<number | null>(null);
  const [buffer, setBuffer] = useState<BufferItem[]>([]);
  const [error, setError] = useState("");
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [itemsToTransfer, setItemsToTransfer] = useState(0);

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
    setItemsToTransfer(orderItems.length);
    setConfirmTransfer(true);
  };

  const confirmTransferAction = () => {
    if (!group || selectedLot === null) return;
    const event = events.find((e) => e.lot === selectedLot);
    if (!event) return;
    const orderItems = buffer.filter((b) => b.qty > 0);
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
    setConfirmTransfer(false);
  };

  const grandTotal = buffer.reduce((s, b) => s + b.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-4">
            {t("banquetOrders")}
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {/* Step 1: Select active group (from GRC.dat) */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 p-4 space-y-3">
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
            className="border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium w-full max-w-md transition-all"
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
        {/* Step 2: Select event (from EVENTS.dat) */}
        {group && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 p-4 space-y-3">
            <h3 className="font-semibold text-sm">
              {t("step")} 2: {t("selectEvent")}
            </h3>
            <div className="space-y-2">
              <div className="text-xs text-gray-600 font-medium">
                {t("availableEvents")}:
              </div>
              <div className="flex flex-wrap gap-2">
                {events.map((e) => (
                  <button
                    key={e.lot}
                    onClick={() => loadServices(e.lot)}
                    className={`px-4 py-2 rounded-lg text-sm border-2 transition-all ${selectedLot === e.lot ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-600" : "border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"}`}
                  >
                    <div className="font-bold">
                      {String(e.lot).padStart(2, "0")}
                    </div>
                    <div className="text-xs">
                      {EVENT_TYPES.find((t) => t.value === e.nature)?.label ||
                        e.nature}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Step 3: Enter quantities (from BANQUET.dat) */}
        {buffer.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 overflow-hidden">
            <div className="p-4 border-b-2 border-emerald-200 space-y-2">
              <h3 className="font-semibold text-sm">
                {t("step")} 3: {t("enterQuantities")}
              </h3>
              <p className="text-xs text-gray-600">
                <Clock size={14} className="inline mr-1" />
                <strong>{t("date")}:</strong> {t("autoGenerated")}.{" "}
                <strong>{t("qty")}:</strong> {t("enterQuantities")}.
              </p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-emerald-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {t("designation")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {t("unity")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {t("unitPrice")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {t("qty")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    {t("total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {buffer.map((b, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-emerald-50/50 transition-colors"
                  >
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
                        className="w-20 border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-2 py-1 text-sm transition-all"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {b.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-emerald-50 border-t-2 border-emerald-200">
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-3 font-semibold text-right"
                  >
                    {t("grandTotal")}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {grandTotal.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="p-4 border-t-2 border-emerald-200">
              <button
                onClick={handleTransfer}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all"
              >
                <Save size={16} />
                {t("transferToJournal")}
              </button>
            </div>
          </div>
        )}
        {/* Existing JBANQUET records */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 overflow-hidden">
          <div className="p-4 border-b-2 border-emerald-200 flex items-center gap-2 bg-emerald-50">
            <ShoppingCart size={18} className="text-emerald-600" />
            <h3 className="font-semibold text-sm text-gray-800">
              {t("journalEntries")}: {jbanquet.length}
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-emerald-200">
              <tr>
                {[
                  "Lot",
                  "Date",
                  "Designation",
                  "Unity",
                  "Qty",
                  "Price",
                  "Total",
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
                <tr
                  key={i}
                  className="border-b hover:bg-emerald-50/50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-semibold">
                    {String(j.lot).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3">{j.date}</td>
                  <td className="px-4 py-3">{j.item}</td>
                  <td className="px-4 py-3">{j.unity}</td>
                  <td className="px-4 py-3 font-semibold">{j.qty}</td>
                  <td className="px-4 py-3">{j.price.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold">
                    {j.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Approval Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 border-t-2 border-emerald-200">
            <div className="grid grid-cols-2 gap-12 max-w-2xl mx-auto">
              {/* Established By */}
              <div className="space-y-6">
                <div className="text-sm font-semibold text-gray-800">
                  {t("establishedBy")}
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">
                    {t("companyManager")}
                  </div>
                  <div className="border-b-2 border-gray-400 py-8"></div>
                  <div className="text-xs text-gray-600">
                    {t("signatureDate")}
                  </div>
                </div>
              </div>

              {/* Verified & Approved By */}
              <div className="space-y-6">
                <div className="text-sm font-semibold text-gray-800">
                  {t("verifiedApprovedBy")}
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">
                    {t("customerGroup")}
                  </div>
                  <div className="border-b-2 border-gray-400 py-8"></div>
                  <div className="text-xs text-gray-600">
                    {t("signatureDate")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Confirmation Modal */}
        {confirmTransfer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                <ShoppingCart size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Confirm Transfer to Journal
              </h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                You are about to transfer{" "}
                <span className="font-semibold text-emerald-700">
                  {itemsToTransfer} item(s)
                </span>{" "}
                to the journal for{" "}
                <span className="font-semibold">{group?.groupe_name}</span>.
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmTransfer(false)}
                  className="border-2 border-gray-200 hover:border-gray-300 px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmTransferAction}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all"
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
