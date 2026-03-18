import { useState } from "react";
import { Plus, Save, Trash2, Info } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { useNotification } from "../../hooks/useNotification";
import {
  validateBanquetService,
  type ValidationResult,
} from "../../utils/banquetingValidation";
import { createErrorNotification } from "../../utils/errorFormatter";
import type { BanquetService } from "../../types";
import { banquetingApi } from "../../services/sigethApi";

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

export default function ServicesPrices() {
  const { t } = useLang();
  const { addNotification } = useNotification();
  const { events, banquetServices, setBanquetServices } = useHotelData();
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [selected, setSelected] = useState<BanquetService | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState<ValidationResult>({
    isValid: true,
    errors: [],
  });
  const [confirmAction, setConfirmAction] = useState(false);
  const [confirmType, setConfirmType] = useState<"save" | "delete">("save");

  const event = events.find((e) => e.lot === selectedLot);
  const filtered = banquetServices.filter((b) => b.lot === selectedLot);

  const handleSave = () => {
    if (!selected || !event) return;

    // Validate form
    const validation = validateBanquetService(selected);
    if (!validation.isValid) {
      setErrors(validation);
      const errorMessage = createErrorNotification(validation.errors, t);
      addNotification(errorMessage, "Banqueting", "error");
      return;
    }

    setConfirmType("save");
    setConfirmAction(true);
  };

  const confirmSave = async () => {
    if (!selected || !event) return;
    setErrors({ isValid: true, errors: [] });

    const record = { ...selected, lot: event.lot, nature: event.nature };
    try {
      const saved = isNew
        ? await banquetingApi.createService(record)
        : selected.id
          ? await banquetingApi.updateService(selected.id, record)
          : await banquetingApi.createService(record);

      if (isNew || !selected.id) {
        setBanquetServices((prev) => [...prev, saved]);
      } else {
        setBanquetServices((prev) =>
          prev.map((b) => (b.id === saved.id ? saved : b)),
        );
      }
    } catch {
      return;
    }

    setSelected(null);
    setConfirmAction(false);
  };

  const handleDelete = () => {
    if (!selected) return;
    setConfirmType("delete");
    setConfirmAction(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    if (selected.id) {
      try {
        await banquetingApi.deleteService(selected.id);
      } catch {
        return;
      }
    }
    setBanquetServices((prev) => prev.filter((b) => b.id !== selected.id));
    setSelected(null);
    setConfirmAction(false);
  };

  const getErrorMessage = (field: string) => {
    const error = errors.errors.find((e) => e.field === field);
    return error ? t(error.message as any) : "";
  };

  const handleFieldChange = (field: keyof BanquetService, value: any) => {
    if (!selected) return;
    const updated: BanquetService = {
      date: field === "date" ? (value as string) : selected.date,
      lot: field === "lot" ? (value as string) : selected.lot,
      nature: field === "nature" ? (value as string) : selected.nature,
      item: field === "item" ? (value as string) : selected.item,
      unity: field === "unity" ? (value as string) : selected.unity,
      qty: field === "qty" ? (value as number) : selected.qty,
      puv: field === "puv" ? (value as number) : selected.puv,
    };
    setSelected(updated);

    // Real-time validation
    const validation = validateBanquetService(updated);
    setErrors(validation);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
          {t("servicesPrices")}
        </h1>
        {/* Event selection */}
        <div className="bg-white rounded border-2 border-emerald-200 p-4">
          <label className="block text-sm font-medium text-hotel-text-primary mb-2">
            {t("selectEvent")}
          </label>
          <div className="flex flex-wrap gap-2">
            {events.map((e) => (
              <button
                key={e.lot}
                onClick={() => setSelectedLot(e.lot)}
                className={`px-4 py-2 rounded text-sm border-2 transition-colors ${selectedLot === e.lot ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-600" : "border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"}`}
              >
                {e.lot} —{" "}
                {EVENT_TYPES.find((t) => t.value === e.nature)?.label ||
                  e.nature}
              </button>
            ))}
          </div>
        </div>
        {selectedLot !== null && event && (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-hotel-text-primary">
                {t("servicesFor")}:{" "}
                {EVENT_TYPES.find((t) => t.value === event.nature)?.label ||
                  event.nature}
              </h2>
              <button
                onClick={() => {
                  setSelected({
                    date: new Date().toISOString().split("T")[0],
                    lot: event.lot,
                    nature: event.nature,
                    item: "",
                    unity: "",
                    qty: 0,
                    puv: 0,
                  });
                  setIsNew(true);
                  setErrors({ isValid: true, errors: [] });
                }}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors"
              >
                <Plus size={16} />
                {t("newRecord")}
              </button>
            </div>
            {selected && (
              <div className="bg-white rounded border-2 border-emerald-200 p-4 space-y-4">
                {/* Spec Note: Fields marked with [System] are generated by system and read-only */}
                <div className="p-3 bg-hotel-cream border border-blue-200 rounded flex gap-2">
                  <Info
                    size={16}
                    className="text-blue-600 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">BANQUET.dat Entry:</span>{" "}
                    Update services and supplies for event. Lot and Nature are
                    system-generated and reference EVENTS.dat.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* System-Generated Fields (Read-Only) */}
                  <div>
                    <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                      Lot{" "}
                      <span className="text-gray-400 text-xs">[System]</span>
                    </label>
                    <input
                      type="number"
                      value={selected.lot}
                      disabled
                      className="w-full border-2 border-hotel-border bg-white rounded px-4 py-2.5 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                      Event Type{" "}
                      <span className="text-gray-400 text-xs">[System]</span>
                    </label>
                    <input
                      type="text"
                      value={
                        EVENT_TYPES.find((t) => t.value === selected.nature)
                          ?.label || selected.nature
                      }
                      disabled
                      className="w-full border-2 border-hotel-border bg-white rounded px-4 py-2.5 text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Editable Service Fields per Specification */}
                <div className="border-t-2 border-hotel-border pt-4">
                  <h4 className="text-sm font-semibold text-hotel-text-primary mb-4">
                    Service Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                        Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={selected.item}
                        onChange={(e) =>
                          handleFieldChange("item", e.target.value)
                        }
                        title="Designation"
                        placeholder="Name of service or supply"
                        className={`w-full border-2 hover:border-hotel-border focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors ${
                          getErrorMessage("item")
                            ? "border-red-500 focus:border-red-500"
                            : "border-hotel-border focus:border-emerald-500"
                        }`}
                      />
                      {getErrorMessage("item") && (
                        <p className="text-xs text-red-500 mt-1">
                          {getErrorMessage("item")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                        Unity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={selected.unity}
                        onChange={(e) =>
                          handleFieldChange("unity", e.target.value)
                        }
                        title="Unity"
                        placeholder="e.g. Pcs, Set, L"
                        className="w-full border-2 border-hotel-border hover:border-hotel-border focus:border-emerald-500 focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={selected.qty}
                        onChange={(e) =>
                          handleFieldChange("qty", Number(e.target.value))
                        }
                        title="Quantity"
                        className={`w-full border-2 hover:border-hotel-border focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors ${
                          getErrorMessage("qty")
                            ? "border-red-500 focus:border-red-500"
                            : "border-hotel-border focus:border-emerald-500"
                        }`}
                      />
                      {getErrorMessage("qty") && (
                        <p className="text-xs text-red-500 mt-1">
                          {getErrorMessage("qty")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                        Price (Unit Price){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={selected.puv}
                        onChange={(e) =>
                          handleFieldChange("puv", Number(e.target.value))
                        }
                        title="Unit Price"
                        className={`w-full border-2 hover:border-hotel-border focus:outline-none rounded px-4 py-2.5 text-sm font-medium transition-colors ${
                          getErrorMessage("puv")
                            ? "border-red-500 focus:border-red-500"
                            : "border-hotel-border focus:border-emerald-500"
                        }`}
                      />
                      {getErrorMessage("puv") && (
                        <p className="text-xs text-red-500 mt-1">
                          {getErrorMessage("puv")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                        Total Amount
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={(selected.qty * selected.puv).toLocaleString()}
                        title="Total Amount"
                        className="w-full border-2 border-hotel-border rounded px-4 py-2.5 text-sm font-medium bg-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t-2 border-hotel-border">
                  <button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2 rounded flex items-center gap-2 text-sm hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors"
                  >
                    <Save size={16} />
                    {t("save")}
                  </button>
                  {!isNew && (
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 text-white px-6 py-2 rounded flex items-center gap-2 text-sm hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                      {t("delete")}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelected(null);
                      setErrors({ isValid: true, errors: [] });
                    }}
                    className="border-2 border-hotel-border hover:border-hotel-border px-6 py-2 rounded text-sm font-medium transition-colors"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            )}
            <div className="bg-white rounded border-2 border-emerald-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white border-b-2 border-emerald-200">
                  <tr>
                    {[
                      "Lot",
                      "Event Type",
                      "Designation",
                      "Unity",
                      "Qty",
                      "Price",
                      "Amount",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-medium text-hotel-text-secondary"
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
                      className="border-b hover:bg-emerald-50/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelected({ ...b });
                        setIsNew(false);
                      }}
                    >
                      <td className="px-4 py-3 font-mono">{b.lot}</td>
                      <td className="px-4 py-3">
                        {EVENT_TYPES.find((t) => t.value === b.nature)?.label ||
                          b.nature}
                      </td>
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

        {/* Confirmation Modals */}
        {confirmAction && confirmType === "save" && selected && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded p-4 max-w-md mx-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                <Save size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-hotel-text-primary mb-2">
                Confirm Service
              </h3>
              <p className="text-hotel-text-secondary mb-6 text-sm leading-relaxed">
                {isNew ? "Add" : "Update"} service{" "}
                <span className="font-semibold text-emerald-700">
                  "{selected.item}"
                </span>
                ?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmAction(false)}
                  className="border-2 border-hotel-border hover:border-hotel-border px-6 py-2.5 rounded text-sm font-semibold text-hotel-text-primary hover:bg-hotel-cream transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={confirmSave}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2.5 rounded text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmAction && confirmType === "delete" && selected && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded p-4 max-w-md mx-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold text-hotel-text-primary mb-2">
                Confirm Delete
              </h3>
              <p className="text-hotel-text-secondary mb-6 text-sm leading-relaxed">
                Delete service{" "}
                <span className="font-semibold text-red-600">
                  "{selected.item}"
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmAction(false)}
                  className="border-2 border-hotel-border hover:border-hotel-border px-6 py-2.5 rounded text-sm font-semibold text-hotel-text-primary hover:bg-hotel-cream transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded text-sm font-semibold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-colors"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
