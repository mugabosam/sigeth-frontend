import { useState } from "react";
import { Save, Trash2, Plus } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  validateRoomCategory,
  type ValidationResult,
} from "../../utils/housekeepingValidation";
import type { CATROOM } from "../../types";

export default function RoomCategories() {
  const { t } = useLang();
  const { catrooms, setCatrooms } = useHotelData();
  const [selected, setSelected] = useState<CATROOM | null>(null);
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
    const validation = validateRoomCategory(selected);
    if (!validation.isValid) {
      setErrors(validation);
      return;
    }

    // Check for duplicates when creating new
    if (isNew && catrooms.some((c) => c.code === selected.code)) {
      setErrors({
        isValid: false,
        errors: [{ field: "code", message: "codeAlreadyExists" }],
      });
      return;
    }

    setShowSaveConfirm(true);
  };

  const confirmSave = () => {
    if (!selected) return;

    setErrors({ isValid: true, errors: [] });

    if (isNew) setCatrooms((prev: CATROOM[]) => [...prev, selected]);
    else
      setCatrooms((prev: CATROOM[]) =>
        prev.map((c) => (c.code === selected.code ? selected : c)),
      );
    setSelected(null);
    setShowSaveConfirm(false);
  };

  const handleDelete = () => {
    if (!selected) return;
    setCatrooms((prev) => prev.filter((c) => c.code !== selected.code));
    setSelected(null);
    setShowDeleteConfirm(false);
  };

  const getErrorMessage = (field: string) => {
    const error = errors.errors.find((e) => e.field === field);
    return error ? t(error.message as any) : "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
          {t("roomCategories")}
        </h1>
        <p className="text-sm text-gray-600">{t("manageCategoriesDesc")}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => {
            setSelected({ code: catrooms.length + 1, name: "" });
            setIsNew(true);
            setErrors({ isValid: true, errors: [] });
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
            {isNew ? t("newCategory") : t("editCategory")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("code")}
              </label>
              <input
                type="number"
                value={selected.code}
                onChange={(e) =>
                  setSelected({ ...selected, code: Number(e.target.value) })
                }
                title={t("code")}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none ${
                  getErrorMessage("code")
                    ? "border-red-400 bg-red-50 focus:border-red-500"
                    : "border-gray-200 hover:border-gray-300 focus:border-emerald-500"
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
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none ${
                  getErrorMessage("name")
                    ? "border-red-400 bg-red-50 focus:border-red-500"
                    : "border-gray-200 hover:border-gray-300 focus:border-emerald-500"
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
        title={isNew ? t("addCategory") : t("updateCategory")}
        message={`${isNew ? t("confirmAddCategory") : t("confirmUpdateCategory")} "${selected?.name}"?`}
        confirmText={isNew ? t("save") : t("save")}
        cancelText={t("cancel")}
        isDangerous={false}
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title={t("deleteCategory")}
        message={`${t("confirmDeleteCategory")} "${selected?.name}"? ${t("cannotBeUndone")}`}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <div className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-100">
          <h2 className="text-lg font-bold text-gray-800">
            Room Categories Directory
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
            {catrooms.map((c) => (
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
        {catrooms.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            <p className="text-sm">
              No categories found. Click "New Record" to add one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
