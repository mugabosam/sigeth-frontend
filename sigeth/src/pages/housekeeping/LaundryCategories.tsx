import { useState } from "react";
import { Save, Trash2, Plus } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  validateLaundryCategory,
  type ValidationResult,
} from "../../utils/housekeepingValidation";
import type { CATLAUNDRY } from "../../types";
import { housekeepingApi } from "../../services/sigethApi";

export default function LaundryCategories() {
  const { t } = useLang();
  const { catlaundry, setCatlaundry } = useHotelData();
  const [selected, setSelected] = useState<CATLAUNDRY | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState<ValidationResult>({
    isValid: true,
    errors: [],
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const handleSave = () => {
    if (!selected) return;

    // Validate form
    const validation = validateLaundryCategory(selected);
    if (!validation.isValid) {
      setErrors(validation);
      return;
    }

    // Check for duplicates when creating new
    if (isNew && catlaundry.some((c) => c.code === selected.code)) {
      setErrors({
        isValid: false,
        errors: [{ field: "code", message: "codeAlreadyExists" }],
      });
      return;
    }

    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    if (!selected) return;

    setErrors({ isValid: true, errors: [] });

    try {
      const payload = { code: selected.code, libelle: selected.name };
      const saved = isNew
        ? await housekeepingApi.createLaundryCategory(payload)
        : selected.id
          ? await housekeepingApi.updateLaundryCategory(selected.id, payload)
          : await housekeepingApi.createLaundryCategory(payload);

      if (isNew || !selected.id) {
        setCatlaundry((prev) => [...prev, saved]);
      } else {
        setCatlaundry((prev) =>
          prev.map((c) => (c.id === saved.id ? saved : c)),
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
        await housekeepingApi.deleteLaundryCategory(selected.id);
      } catch {
        return;
      }
    }
    setCatlaundry((prev) => prev.filter((c) => c.id !== selected.id));
    setSelected(null);
    setShowDeleteConfirm(false);
  };

  const getErrorMessage = (field: string) => {
    const error = errors.errors.find((e) => e.field === field);
    return error ? t(error.message as any) : "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-1">
            {t("laundryCategories")}
          </h1>
          <p className="text-sm text-gray-600">
            {t("manageLaundryCategoriesDesc")}
          </p>
        </div>
        <button
          onClick={() => {
            setSelected({ code: "", name: "" });
            setIsNew(true);
            setErrors({ isValid: true, errors: [] });
          }}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200"
        >
          <Plus size={18} />
          {t("newRecord")}
        </button>
      </div>
      {selected && (
        <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-7 space-y-5">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {isNew ? t("newCategory") : t("editCategory")}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Fill in the category information below
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("code")}
              </label>
              <input
                type="text"
                value={selected.code}
                onChange={(e) =>
                  setSelected({ ...selected, code: e.target.value })
                }
                title={t("code")}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors ${
                  getErrorMessage("code")
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              />
              {getErrorMessage("code") && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  {getErrorMessage("code")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("categoryName")}
              </label>
              <input
                type="text"
                value={selected.name}
                onChange={(e) =>
                  setSelected({ ...selected, name: e.target.value })
                }
                title={t("categoryName")}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors ${
                  getErrorMessage("name")
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              />
              {getErrorMessage("name") && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  {getErrorMessage("name")}
                </p>
              )}
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
              onClick={() => {
                setSelected(null);
                setErrors({ isValid: true, errors: [] });
              }}
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
        title={isNew ? t("addLaundryCategory") : t("updateLaundryCategory")}
        message={`${isNew ? t("confirmAddCategory") : t("confirmUpdateCategory")} "${selected?.name}"?`}
        confirmText={isNew ? t("add") : t("update")}
        cancelText={t("cancel")}
        isDangerous={false}
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title={t("deleteLaundryCategory")}
        message={`${t("confirmDeleteCategory")} "${selected?.name}"? ${t("cannotBeUndone")}`}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-100">
          <h2 className="text-lg font-bold text-gray-800">
            {t("laundryCategoriesDirectory")}
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2 border-emerald-200">
            <tr>
              <th className="text-left px-6 py-3 font-bold text-gray-700">
                {t("code")}
              </th>
              <th className="text-left px-6 py-3 font-bold text-gray-700">
                {t("categoryName")}
              </th>
            </tr>
          </thead>
          <tbody>
            {catlaundry.map((c) => (
              <tr
                key={c.code}
                className="border-b hover:bg-emerald-50/50 cursor-pointer transition-colors duration-150"
                onClick={() => {
                  setSelected({ ...c });
                  setIsNew(false);
                  setErrors({ isValid: true, errors: [] });
                }}
              >
                <td className="px-6 py-3 font-semibold text-emerald-600">
                  {c.code}
                </td>
                <td className="px-6 py-3 text-gray-700">{c.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {catlaundry.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            <p className="text-sm">{t("noCategoriesFound")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
