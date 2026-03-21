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
import { coreApi } from "../../services/sigethApi";

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

  const confirmSave = async () => {
    if (!selected) return;

    setErrors({ isValid: true, errors: [] });

    try {
      const payload = {
        code_cat: selected.code,
        designation: selected.name,
      };
      const saved = isNew
        ? await coreApi.createCatroom(payload)
        : selected.id
          ? await coreApi.updateCatroom(selected.id, payload)
          : await coreApi.createCatroom(payload);

      if (isNew || !selected.id) {
        setCatrooms((prev: CATROOM[]) => [...prev, saved]);
      } else {
        setCatrooms((prev: CATROOM[]) =>
          prev.map((c) => (c.id === saved.id ? saved : c)),
        );
      }
    } catch (error) {
      alert(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : "Failed to save room category",
      );
      return;
    }

    setSelected(null);
    setShowSaveConfirm(false);
  };

  const handleDelete = async () => {
    if (!selected) return;

    if (selected.id) {
      try {
        await coreApi.deleteCatroom(selected.id);
      } catch (error) {
        alert(
          typeof error === "object" && error !== null && "message" in error
            ? String((error as { message: string }).message)
            : "Failed to delete room category",
        );
        return;
      }
    }

    setCatrooms((prev) => prev.filter((c) => c.id !== selected.id));
    setSelected(null);
    setShowDeleteConfirm(false);
  };

  const getErrorMessage = (field: string) => {
    const error = errors.errors.find((e) => e.field === field);
    return error ? t(error.message as any) : "";
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => {
            setSelected({ code: catrooms.length + 1, name: "" });
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
          <h3 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide">
            {isNew ? t("newCategory") : t("editCategory")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("code")}
              </label>
              <input
                type="number"
                value={selected.code}
                onChange={(e) =>
                  setSelected({ ...selected, code: Number(e.target.value) })
                }
                title={t("code")}
                className={`w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                  getErrorMessage("code")
                    ? "border-hotel-gold bg-hotel-cream"
                    : ""
                }`}
              />
              {getErrorMessage("code") && (
                <p className="text-xs text-hotel-gold mt-2 font-medium">
                  {getErrorMessage("code")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("categoryName")}
              </label>
              <input
                type="text"
                value={selected.name}
                onChange={(e) =>
                  setSelected({ ...selected, name: e.target.value })
                }
                title={t("categoryName")}
                className={`w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                  getErrorMessage("name")
                    ? "border-hotel-gold bg-hotel-cream"
                    : ""
                }`}
              />
              {getErrorMessage("name") && (
                <p className="text-xs text-hotel-gold mt-2 font-medium">
                  {getErrorMessage("name")}
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
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-hotel-danger text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <Trash2 size={14} />
                {t("delete")}
              </button>
            )}
            <button
              onClick={() => {
                setSelected(null);
                setErrors({ isValid: true, errors: [] });
              }}
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

      <div className="bg-white rounded overflow-hidden">
        <h2 className="text-sm font-semibold text-hotel-text-primary mb-2 uppercase tracking-wide px-2">
          Room Categories Directory
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-hotel-navy text-white sticky top-0">
            <tr>
              <th className="text-left py-2 px-2 font-medium">
                {t("code")}
              </th>
              <th className="text-left py-2 px-2 font-medium">
                {t("categoryName")}
              </th>
            </tr>
          </thead>
          <tbody>
            {catrooms.map((c) => (
              <tr
                key={c.code}
                className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors"
                onClick={() => {
                  setSelected({ ...c });
                  setIsNew(false);
                  setErrors({ isValid: true, errors: [] });
                }}
              >
                <td className="py-2 px-2 font-medium text-hotel-text-primary">
                  {c.code}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">{c.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {catrooms.length === 0 && (
          <div className="px-4 py-8 text-center text-hotel-text-secondary">
            <p className="text-sm">
              No categories found. Click "New Record" to add one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}



