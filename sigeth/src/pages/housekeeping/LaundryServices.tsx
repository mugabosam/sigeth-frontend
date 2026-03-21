import { useState } from "react";
import { Plus, Save, Trash2, Search, X } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { validateLaundryService } from "../../utils/housekeepingValidation";
import type { HSERVICE } from "../../types";
import { housekeepingApi } from "../../services/sigethApi";

export default function LaundryServices() {
  const { t } = useLang();
  const { laundryServices, setLaundryServices, catlaundry } = useHotelData();
  const [selected, setSelected] = useState<HSERVICE | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Live search filter
  const filteredServices = laundryServices.filter((s) => {
    const search = searchTerm.toLowerCase();
    return (
      s.designation.toLowerCase().includes(search) ||
      s.type.toLowerCase().includes(search) ||
      s.category.toLowerCase().includes(search) ||
      s.puv.toString().includes(search)
    );
  });

  const blank: HSERVICE = {
    designation: "",
    type: "",
    qty: 0,
    puv: 0,
    category: "",
    room_num: "",
    guest_name: "",
  };

  const handleSave = () => {
    if (!selected) return;

    // Validate form
    const validation = validateLaundryService(selected);
    if (!validation.isValid) {
      // Log validation errors, optional: show toast notification
      console.warn("Validation errors:", validation.errors);
      return;
    }

    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    if (!selected) return;

    try {
      const saved = isNew
        ? await housekeepingApi.createLaundryService(selected)
        : selected.id
          ? await housekeepingApi.updateLaundryService(selected.id, selected)
          : await housekeepingApi.createLaundryService(selected);

      if (isNew || !selected.id) {
        setLaundryServices((prev) => [...prev, saved]);
      } else {
        setLaundryServices((prev) =>
          prev.map((s) => (s.id === saved.id ? saved : s)),
        );
      }
    } catch {
      return;
    }

    setSelected(null);
    setShowSaveConfirm(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (selected.id) {
      try {
        await housekeepingApi.deleteLaundryService(selected.id);
      } catch {
        return;
      }
    }
    setLaundryServices((prev) => prev.filter((s) => s.id !== selected.id));
    setSelected(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => {
            setSelected({ ...blank });
            setIsNew(true);
          }}
          className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
        >
          <Plus size={14} />
          {t("newRecord")}
        </button>
      </div>
      {selected && (
        <div className="bg-white rounded p-4 space-y-4">
          <h3 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide">
            {isNew ? t("newService") : t("editService")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("designation")}
              </label>
              <input
                type="text"
                value={selected.designation}
                onChange={(e) =>
                  setSelected({ ...selected, designation: e.target.value })
                }
                title={t("designation")}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("type")}
              </label>
              <input
                type="text"
                value={selected.type}
                onChange={(e) =>
                  setSelected({ ...selected, type: e.target.value })
                }
                title={t("type")}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("qty")}
              </label>
              <input
                type="number"
                value={selected.qty}
                onChange={(e) =>
                  setSelected({ ...selected, qty: Number(e.target.value) })
                }
                title={t("qty")}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("puv")}
              </label>
              <input
                type="number"
                value={selected.puv}
                onChange={(e) =>
                  setSelected({ ...selected, puv: Number(e.target.value) })
                }
                title={t("puv")}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("category")}
              </label>
              <select
                value={selected.category}
                onChange={(e) =>
                  setSelected({ ...selected, category: e.target.value })
                }
                title={t("category")}
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
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("roomNumber")}
              </label>
              <input
                type="text"
                value={selected.room_num}
                onChange={(e) =>
                  setSelected({ ...selected, room_num: e.target.value })
                }
                title={t("roomNumber")}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("guestName")}
              </label>
              <input
                type="text"
                value={selected.guest_name}
                onChange={(e) =>
                  setSelected({ ...selected, guest_name: e.target.value })
                }
                title={t("guestName")}
                className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              />
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
                onClick={() => setShowDeleteConfirm(true)}
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

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSaveConfirm}
        title={isNew ? t("addLaundryService") : t("updateLaundryService")}
        message={`${isNew ? t("confirmAddService") : t("confirmUpdateService")} "${selected?.designation}"?`}
        confirmText={isNew ? t("add") : t("update")}
        cancelText={t("cancel")}
        isDangerous={false}
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title={t("deleteLaundryService")}
        message={`${t("confirmDeleteService")} "${selected?.designation}"? ${t("cannotBeUndone")}`}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Services Directory Table */}
      <div className="bg-white rounded overflow-hidden">
        <h2 className="text-sm font-semibold text-hotel-text-primary mb-2 uppercase tracking-wide px-2">
          {t("laundryServicesDirectory")}
        </h2>
        <div className="px-2 py-2 border-b border-hotel-border">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hotel-text-secondary"
              size={18}
            />
            <input
              type="text"
              placeholder={`${t("search")} services by designation, type, or category...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-hotel-text-secondary hover:text-hotel-text-secondary"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-hotel-navy text-white sticky top-0">
            <tr>
              {[
                t("designation"),
                t("type"),
                t("qty"),
                t("puv"),
                t("category"),
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
            {filteredServices.map((s, i) => (
              <tr
                key={i}
                className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors"
                onClick={() => {
                  setSelected({ ...s });
                  setIsNew(false);
                }}
              >
                <td className="py-2 px-2 font-medium text-hotel-text-primary">
                  {s.designation}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">{s.type}</td>
                <td className="py-2 px-2 text-hotel-text-primary">{s.qty}</td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {s.puv.toLocaleString()}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">{s.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredServices.length === 0 && (
          <div className="px-4 py-8 text-center text-hotel-text-secondary">
            <p className="text-sm">
              {searchTerm
                ? `No services match "${searchTerm}"`
                : 'No services found. Click "New Record" to add one.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



