import { useState } from "react";
import { Plus, Save, Trash2, Search, X } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { validateLaundryService } from "../../utils/housekeepingValidation";
import type { HSERVICE } from "../../types";

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

  const confirmSave = () => {
    if (!selected) return;

    if (isNew) setLaundryServices((prev) => [...prev, selected]);
    else
      setLaundryServices((prev) =>
        prev.map((s) =>
          s.designation === selected.designation &&
          s.category === selected.category
            ? selected
            : s,
        ),
      );
    setSelected(null);
    setShowSaveConfirm(false);
  };

  const handleDelete = () => {
    if (!selected) return;
    setLaundryServices((prev) =>
      prev.filter(
        (s) =>
          !(
            s.designation === selected.designation &&
            s.category === selected.category
          ),
      ),
    );
    setSelected(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
          {t("laundryServices")}
        </h1>
        <p className="text-sm text-gray-600">
          {t("manageLaundryServicesDesc")}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => {
            setSelected({ ...blank });
            setIsNew(true);
          }}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200"
        >
          <Plus size={16} />
          {t("newRecord")}
        </button>
      </div>
      {selected && (
        <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-7 space-y-4">
          <h3 className="text-lg font-bold text-emerald-700">
            {isNew ? t("newService") : t("editService")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("designation")}
              </label>
              <input
                type="text"
                value={selected.designation}
                onChange={(e) =>
                  setSelected({ ...selected, designation: e.target.value })
                }
                title={t("designation")}
                className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("type")}
              </label>
              <input
                type="text"
                value={selected.type}
                onChange={(e) =>
                  setSelected({ ...selected, type: e.target.value })
                }
                title={t("type")}
                className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("qty")}
              </label>
              <input
                type="number"
                value={selected.qty}
                onChange={(e) =>
                  setSelected({ ...selected, qty: Number(e.target.value) })
                }
                title={t("qty")}
                className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("puv")}
              </label>
              <input
                type="number"
                value={selected.puv}
                onChange={(e) =>
                  setSelected({ ...selected, puv: Number(e.target.value) })
                }
                title={t("puv")}
                className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("category")}
              </label>
              <select
                value={selected.category}
                onChange={(e) =>
                  setSelected({ ...selected, category: e.target.value })
                }
                title={t("category")}
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("roomNumber")}
              </label>
              <input
                type="text"
                value={selected.room_num}
                onChange={(e) =>
                  setSelected({ ...selected, room_num: e.target.value })
                }
                title={t("roomNumber")}
                className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("guestName")}
              </label>
              <input
                type="text"
                value={selected.guest_name}
                onChange={(e) =>
                  setSelected({ ...selected, guest_name: e.target.value })
                }
                title={t("guestName")}
                className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-5 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200"
            >
              <Save size={16} />
              {t("save")}
            </button>
            {!isNew && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
              >
                <Trash2 size={16} />
                {t("delete")}
              </button>
            )}
            <button
              onClick={() => setSelected(null)}
              className="border-2 border-gray-300 px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
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
      <div className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-100">
          <h2 className="text-lg font-bold text-gray-800">
            {t("laundryServicesDirectory")}
          </h2>
        </div>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={`${t("search")} services by designation, type, or category...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg text-sm font-medium transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2 border-emerald-200">
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
                  className="text-left px-6 py-3 font-bold text-gray-700"
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
                className="border-b hover:bg-emerald-50/50 cursor-pointer transition-colors duration-150"
                onClick={() => {
                  setSelected({ ...s });
                  setIsNew(false);
                }}
              >
                <td className="px-6 py-3 font-semibold text-emerald-600">
                  {s.designation}
                </td>
                <td className="px-6 py-3 text-gray-700">{s.type}</td>
                <td className="px-6 py-3 text-gray-700">{s.qty}</td>
                <td className="px-6 py-3 text-gray-700">
                  {s.puv.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-gray-700">{s.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredServices.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
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
