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
import { banquetingApi } from "../../services/sigethApi";

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

  const confirmSave = async () => {
    if (!selected) return;
    setErrors({ isValid: true, errors: [] });

    try {
      const saved = isNew
        ? await banquetingApi.createEvent(selected)
        : selected.id
          ? await banquetingApi.updateEvent(selected.id, selected)
          : await banquetingApi.createEvent(selected);

      if (isNew || !selected.id) {
        setEvents((prev) => [...prev, saved]);
      } else {
        setEvents((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
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
        await banquetingApi.deleteEvent(selected.id);
      } catch {
        return;
      }
    }
    setEvents((prev) => prev.filter((e) => e.id !== selected.id));
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
      lot: field === "lot" ? (value as string) : selected.lot,
      nature: field === "nature" ? (value as string) : selected.nature,
    };
    setSelected(updated);

    // Real-time validation
    const validation = validateEventRecord(updated);
    setErrors(validation);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            setSelected({ lot: String(events.length + 1).padStart(2, "0"), nature: "" });
            setIsNew(true);
            setErrors({ isValid: true, errors: [] });
          }}
          className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
        >
          <Plus size={14} />
          {t("newRecord")}
        </button>
      </div>
      {selected && (
        <div className="bg-white rounded p-4 space-y-4">
          <div className="p-3 bg-hotel-cream border border-hotel-border rounded flex gap-2">
            <Info size={16} className="text-hotel-gold flex-shrink-0 mt-0.5" />
            <p className="text-xs text-hotel-gold">
              <span className="font-semibold">Lot (Event):</span> A Lot groups
              services attached to an event for negotiating prices and
              accounting for services provided. At each Lot, multiple supplies
              or services are defined, quantified, and priced.
            </p>
          </div>
          <h3 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide">
            {isNew ? t("newEvent") : t("editEvent")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("lot")} <span className="text-hotel-gold">*</span>
              </label>
              <input
                type="text"
                value={selected.lot}
                onChange={(e) =>
                  handleFieldChange("lot", e.target.value)
                }
                title={t("lot")}
                className={`w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                  getErrorMessage("lot")
                    ? "border-hotel-gold"
                    : ""
                }`}
              />
              {getErrorMessage("lot") && (
                <p className="text-xs text-hotel-gold mt-1">
                  {getErrorMessage("lot")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                Event Type <span className="text-hotel-gold">*</span>
              </label>
              <select
                value={selected.nature}
                onChange={(e) => handleFieldChange("nature", e.target.value)}
                title="Event Type"
                className={`w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                  getErrorMessage("nature")
                    ? "border-hotel-gold"
                    : ""
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
                <p className="text-xs text-hotel-gold mt-1">
                  {getErrorMessage("nature")}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-hotel-border">
            <button
              onClick={handleSave}
              className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
            >
              <Save size={14} />
              {t("save")}
            </button>
            {!isNew && (
              <button
                onClick={handleDelete}
                className="bg-hotel-danger text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <Trash2 size={14} />
                {t("delete")}
              </button>
            )}
            <button
              onClick={() => setSelected(null)}
              className="border border-hotel-border text-hotel-text-primary px-4 py-2 rounded text-sm font-medium hover:bg-hotel-cream transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-hotel-navy text-white sticky top-0">
            <tr>
              <th className="text-left py-2 px-2 font-medium">
                {t("lot")}
              </th>
              <th className="text-left py-2 px-2 font-medium">
                Event Type
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr
                key={e.lot}
                className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors"
                onClick={() => {
                  setSelected({ ...e });
                  setIsNew(false);
                }}
              >
                <td className="py-2 px-2 font-medium text-hotel-text-primary font-mono">{e.lot}</td>
                <td className="py-2 px-2">
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
          <div className="bg-white rounded p-4 max-w-md mx-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-hotel-cream mb-4">
              <Save size={24} className="text-hotel-gold" />
            </div>
            <h3 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide mb-2">
              Confirm Event
            </h3>
            <p className="text-hotel-text-secondary mb-6 text-sm leading-relaxed">
              {isNew ? "Add" : "Update"} event lot{" "}
              <span className="font-semibold text-hotel-gold">
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
                className="border border-hotel-border text-hotel-text-primary px-4 py-2 rounded text-sm font-medium hover:bg-hotel-cream transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={confirmSave}
                className="bg-hotel-gold text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && confirmType === "delete" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 max-w-md mx-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-hotel-cream mb-4">
              <Trash2 size={24} className="text-hotel-gold" />
            </div>
            <h3 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide mb-2">
              Confirm Delete
            </h3>
            <p className="text-hotel-text-secondary mb-6 text-sm leading-relaxed">
              Delete event lot{" "}
              <span className="font-semibold text-hotel-gold">
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
                className="border border-hotel-border text-hotel-text-primary px-4 py-2 rounded text-sm font-medium hover:bg-hotel-cream transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={confirmDelete}
                className="bg-hotel-gold text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
