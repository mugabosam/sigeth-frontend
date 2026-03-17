import { useState } from "react";
import { Plus, Save, Trash2, Search, X } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { useNotification } from "../../hooks/useNotification";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  validateHousekeepingStaff,
  type ValidationResult,
} from "../../utils/housekeepingValidation";
import { createErrorNotification } from "../../utils/errorFormatter";
import type { HSTAFF } from "../../types";
import { housekeepingApi } from "../../services/sigethApi";

export default function HousekeepingStaff() {
  const { t } = useLang();
  const { addNotification } = useNotification();
  const { staff, setStaff } = useHotelData();
  const [selected, setSelected] = useState<HSTAFF | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<ValidationResult>({
    isValid: true,
    errors: [],
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Live search filter
  const filteredStaff = staff.filter((s) => {
    const search = searchTerm.toLowerCase();
    return (
      s.number.toString().includes(search) ||
      s.first_name.toLowerCase().includes(search) ||
      s.last_name.toLowerCase().includes(search) ||
      s.poste.toLowerCase().includes(search)
    );
  });

  const handleSave = () => {
    if (!selected) return;

    // Validate form
    const validation = validateHousekeepingStaff(selected);
    if (!validation.isValid) {
      setErrors(validation);
      const errorMessage = createErrorNotification(validation.errors, t);
      addNotification(errorMessage, "Housekeeping", "error");
      return;
    }

    // Check for duplicates when creating new
    if (isNew && staff.some((s) => s.number === selected.number)) {
      setErrors({
        isValid: false,
        errors: [{ field: "number", message: "codeAlreadyExists" }],
      });
      addNotification(t("codeAlreadyExists"), "Housekeeping", "error");
      return;
    }

    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    if (!selected) return;

    setErrors({ isValid: true, errors: [] });

    try {
      const saved = isNew
        ? await housekeepingApi.createStaff(selected)
        : selected.id
          ? await housekeepingApi.updateStaff(selected.id, selected)
          : await housekeepingApi.createStaff(selected);

      if (isNew || !selected.id) {
        setStaff((prev) => [...prev, saved]);
      } else {
        setStaff((prev) =>
          prev.map((s) => (s.id === saved.id ? saved : s)),
        );
      }
    } catch (error) {
      addNotification(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : t("loginError"),
        "Housekeeping",
        "error",
      );
      return;
    }

    setSelected(null);
    setShowSaveConfirm(false);
  };

  const handleDelete = async () => {
    if (!selected) return;

    try {
      if (selected.id) {
        await housekeepingApi.deleteStaff(selected.id);
      }
      setStaff((prev) => prev.filter((s) => s.id !== selected.id));
    } catch (error) {
      addNotification(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : t("loginError"),
        "Housekeeping",
        "error",
      );
      return;
    }

    setSelected(null);
    setShowDeleteConfirm(false);
  };

  const getErrorMessage = (field: string) => {
    const error = errors.errors.find((e) => e.field === field);
    return error ? t(error.message as any) : "";
  };

  const handleFieldChange = (field: keyof HSTAFF, value: any) => {
    if (!selected) return;
    const updated: HSTAFF = {
      number: field === "number" ? (value as number) : selected.number,
      first_name:
        field === "first_name" ? (value as string) : selected.first_name,
      last_name: field === "last_name" ? (value as string) : selected.last_name,
      poste: field === "poste" ? (value as string) : selected.poste,
    };
    setSelected(updated);

    // Real-time validation
    const validation = validateHousekeepingStaff(updated);
    setErrors(validation);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-4 space-y-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent mb-1">
            {t("housekeepingStaff")}
          </h1>
          <p className="text-sm text-hotel-text-secondary">
            Manage your housekeeping team members and personnel
          </p>
        </div>
        <button
          onClick={() => {
            setSelected({
              number: staff.length + 1,
              first_name: "",
              last_name: "",
              poste: "",
            });
            setIsNew(true);
            setErrors({ isValid: true, errors: [] });
          }}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors duration-200"
        >
          <Plus size={18} />
          {t("newRecord")}
        </button>
      </div>
      {selected && (
        <div className="bg-white rounded border border-emerald-100 p-7 space-y-3">
          <div>
            <h3 className="text-base font-bold text-hotel-text-primary">
              {isNew ? t("newStaff") : t("editStaff")}
            </h3>
            <p className="text-xs text-hotel-text-secondary mt-1">
              Fill in the staff information below
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-hotel-text-primary mb-2">
                {t("staffNumber")}
              </label>
              <input
                type="number"
                value={selected.number}
                onChange={(e) =>
                  handleFieldChange("number", Number(e.target.value))
                }
                title={t("staffNumber")}
                className={`w-full border-2 rounded px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors ${
                  getErrorMessage("number")
                    ? "border-red-400 bg-red-50"
                    : "border-hotel-border hover:border-hotel-border"
                }`}
              />
              {getErrorMessage("number") && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  {getErrorMessage("number")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-hotel-text-primary mb-2">
                {t("firstName")}
              </label>
              <input
                type="text"
                value={selected.first_name}
                onChange={(e) =>
                  handleFieldChange("first_name", e.target.value)
                }
                pattern="^[a-zA-Z\s\-']{2,}$"
                title={t("firstName")}
                placeholder="Letters only"
                className={`w-full border-2 rounded px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors ${
                  getErrorMessage("first_name")
                    ? "border-red-400 bg-red-50"
                    : "border-hotel-border hover:border-hotel-border"
                }`}
              />
              {getErrorMessage("first_name") && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  {getErrorMessage("first_name")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-hotel-text-primary mb-2">
                {t("lastName")}
              </label>
              <input
                type="text"
                value={selected.last_name}
                onChange={(e) => handleFieldChange("last_name", e.target.value)}
                pattern="^[a-zA-Z\s\-']{2,}$"
                title={t("lastName")}
                placeholder="Letters only"
                className={`w-full border-2 rounded px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors ${
                  getErrorMessage("last_name")
                    ? "border-red-400 bg-red-50"
                    : "border-hotel-border hover:border-hotel-border"
                }`}
              />
              {getErrorMessage("last_name") && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  {getErrorMessage("last_name")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-hotel-text-primary mb-2">
                {t("poste")}
              </label>
              <input
                type="text"
                value={selected.poste}
                onChange={(e) => handleFieldChange("poste", e.target.value)}
                title={t("poste")}
                className={`w-full border-2 rounded px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors ${
                  getErrorMessage("poste")
                    ? "border-red-400 bg-red-50"
                    : "border-hotel-border hover:border-hotel-border"
                }`}
              />
              {getErrorMessage("poste") && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  {getErrorMessage("poste")}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-5 border-t border-hotel-border">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors duration-200"
            >
              <Save size={16} />
              {t("save")}
            </button>
            {!isNew && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-colors duration-200"
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
              className="border-2 border-hotel-border px-6 py-2.5 rounded text-sm font-semibold text-hotel-text-primary hover:bg-hotel-cream transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSaveConfirm}
        title={isNew ? "Add Housekeeping Staff" : "Update Housekeeping Staff"}
        message={`Are you sure you want to ${isNew ? "add" : "update"} staff member #${selected?.number} ${selected?.first_name} ${selected?.last_name}?`}
        confirmText={isNew ? "Add" : "Update"}
        cancelText="Cancel"
        isDangerous={false}
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Housekeeping Staff"
        message={`Are you sure you want to delete staff member #${selected?.number}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Staff Table */}
      <div className="bg-white rounded border border-emerald-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-hotel-text-primary">Staff Directory</h2>
        </div>
        <div className="px-6 py-4 border-b border-hotel-border">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={`${t("search")} staff by name, number, or position...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border-2 border-hotel-border hover:border-hotel-border focus:border-emerald-500 focus:outline-none rounded text-sm font-medium transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-hotel-text-secondary"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white border-b-2 border-emerald-200">
            <tr>
              {[
                t("staffNumber"),
                t("firstName"),
                t("lastName"),
                t("poste"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-3 font-bold text-hotel-text-primary"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((s) => (
              <tr
                key={s.number}
                className="border-b hover:bg-emerald-50/50 cursor-pointer transition-colors duration-150"
                onClick={() => {
                  setSelected({ ...s });
                  setIsNew(false);
                  setErrors({ isValid: true, errors: [] });
                }}
              >
                <td className="px-6 py-3 font-semibold text-emerald-600">
                  {s.number}
                </td>
                <td className="px-6 py-3 text-hotel-text-primary">{s.first_name}</td>
                <td className="px-6 py-3 text-hotel-text-primary">{s.last_name}</td>
                <td className="px-6 py-3 text-hotel-text-secondary italic">{s.poste}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStaff.length === 0 && (
          <div className="px-6 py-12 text-center text-hotel-text-secondary">
            <p className="text-sm">
              {searchTerm
                ? `No staff members match "${searchTerm}". Try a different search.`
                : 'No staff members found. Click "New Record" to add one.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
