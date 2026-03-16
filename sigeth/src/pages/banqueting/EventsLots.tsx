import { useState } from "react";
import { Plus, Save, Trash2, Info } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { useNotification } from "../../hooks/useNotification";
import {
  validateEventRecord,
  type ValidationResult,
} from "../../utils/banquetingValidation";
import { createErrorNotification } from "../../utils/errorFormatter";
import type { EventRecord } from "../../types";

// Predefined event types per Banqueting specifications
// "Un Lot repose sur le groupage de services rattachés à un événement
// qui vise la fixation des prix négociés et la comptabilisation des services rendus"
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

export default function EventsLots() {
  const { t } = useLang();
  const { addNotification } = useNotification();
  const { events, setEvents } = useHotelData();
  const [selected, setSelected] = useState<EventRecord | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState<ValidationResult>({
    isValid: true,
    errors: [],
  });
  const [confirmAction, setConfirmAction] = useState(false);
  const [confirmType, setConfirmType] = useState<"save" | "delete">("save");

  const handleSave = () => {
    if (!selected) return;

    // Validate form
    const validation = validateEventRecord(selected);
    if (!validation.isValid) {
      setErrors(validation);
      const errorMessage = createErrorNotification(validation.errors, t);
      addNotification(errorMessage, "Banqueting", "error");
      return;
    }

    setConfirmType("save");
    setConfirmAction(true);
  };

  const confirmSave = () => {
    if (!selected) return;
    setErrors({ isValid: true, errors: [] });

    if (isNew) setEvents((prev) => [...prev, selected]);
    else
      setEvents((prev) =>
        prev.map((e) => (e.lot === selected.lot ? selected : e)),
      );
    setSelected(null);
    setConfirmAction(false);
  };

  const handleDelete = () => {
    if (!selected) return;
    setConfirmType("delete");
    setConfirmAction(true);
  };

  const confirmDelete = () => {
    if (!selected) return;
    setEvents((prev) => prev.filter((e) => e.lot !== selected.lot));
    setSelected(null);
    setConfirmAction(false);
  };

  const getErrorMessage = (field: string) => {
    const error = errors.errors.find((e) => e.field === field);
    return error ? t(error.message as any) : "";
  };

  const handleFieldChange = (field: keyof EventRecord, value: any) => {
    if (!selected) return;
    const updated: EventRecord = {
      lot: field === "lot" ? (value as number) : selected.lot,
      nature: field === "nature" ? (value as string) : selected.nature,
    };
    setSelected(updated);

    // Real-time validation
    const validation = validateEventRecord(updated);
    setErrors(validation);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            {t("eventsLots")}
          </h1>
          <button
            onClick={() => {
              setSelected({ lot: events.length + 1, nature: "" });
              setIsNew(true);
              setErrors({ isValid: true, errors: [] });
            }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all"
          >
            <Plus size={16} />
            {t("newRecord")}
          </button>
        </div>
        {selected && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 p-6 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
              <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Lot (Event):</span> A Lot groups
                services attached to an event for negotiating prices and
                accounting for services provided. At each Lot, multiple supplies
                or services are defined, quantified, and priced.
              </p>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {isNew ? t("newEvent") : t("editEvent")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {t("lot")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={selected.lot}
                  onChange={(e) =>
                    handleFieldChange("lot", Number(e.target.value))
                  }
                  title={t("lot")}
                  className={`w-full border-2 hover:border-gray-300 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    getErrorMessage("lot")
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-emerald-500"
                  }`}
                />
                {getErrorMessage("lot") && (
                  <p className="text-xs text-red-500 mt-1">
                    {getErrorMessage("lot")}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={selected.nature}
                  onChange={(e) => handleFieldChange("nature", e.target.value)}
                  title="Event Type"
                  className={`w-full border-2 hover:border-gray-300 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    getErrorMessage("nature")
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-emerald-500"
                  }`}
                >
                  <option value="">Select event type...</option>
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {getErrorMessage("nature") && (
                  <p className="text-xs text-red-500 mt-1">
                    {getErrorMessage("nature")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all"
              >
                <Save size={16} />
                {t("save")}
              </button>
              {!isNew && (
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-red-600 transition-all"
                >
                  <Trash2 size={16} />
                  {t("delete")}
                </button>
              )}
              <button
                onClick={() => setSelected(null)}
                className="border-2 border-gray-200 hover:border-gray-300 px-6 py-2 rounded-lg text-sm font-medium transition-all"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-emerald-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  {t("lot")}
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Event Type
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr
                  key={e.lot}
                  className="border-b hover:bg-emerald-50/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelected({ ...e });
                    setIsNew(false);
                  }}
                >
                  <td className="px-4 py-3 font-mono">{e.lot}</td>
                  <td className="px-4 py-3">
                    {EVENT_TYPES.find((t) => t.value === e.nature)?.label ||
                      e.nature}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {confirmAction && confirmType === "save" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                <Save size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Confirm Event
              </h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                {isNew ? "Add" : "Update"} event lot{" "}
                <span className="font-semibold text-emerald-700">
                  {selected?.lot}
                </span>{" "}
                as a{" "}
                <span className="font-semibold">
                  {EVENT_TYPES.find((t) => t.value === selected?.nature)?.label}
                </span>
                ?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmAction(false)}
                  className="border-2 border-gray-200 hover:border-gray-300 px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={confirmSave}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmAction && confirmType === "delete" && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Delete event lot{" "}
                <span className="font-semibold text-red-600">
                  {selected?.lot}
                </span>{" "}
                (
                <span className="font-semibold">
                  {EVENT_TYPES.find((t) => t.value === selected?.nature)?.label}
                </span>
                )? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmAction(false)}
                  className="border-2 border-gray-200 hover:border-gray-300 px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all"
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
