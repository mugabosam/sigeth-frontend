import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  validateRequestNote,
  type ValidationResult,
} from "../../utils/housekeepingValidation";
import type { REQUIS } from "../../types";

export default function RequestNote({
  posteDefault = "Housekeeping",
}: {
  posteDefault?: string;
}) {
  const { t } = useLang();
  const { requisitions, setRequisitions } = useHotelData();
  const [selected, setSelected] = useState<REQUIS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [errors, setErrors] = useState<ValidationResult>({
    isValid: true,
    errors: [],
  });

  const blank: REQUIS = {
    code_p: "",
    date_d: new Date().toISOString().split("T")[0],
    poste: posteDefault,
    libelle: "",
    qty: 0,
    credit_1: 0,
    credit_2: 0,
    date_r: "",
    statut: "Pending",
  };

  const filtered = requisitions.filter((r) => r.poste === posteDefault);

  const handleSave = () => {
    if (!selected) return;

    // Validate form
    const validation = validateRequestNote(selected);
    if (!validation.isValid) {
      setErrors(validation);
      return;
    }

    setShowSaveConfirm(true);
  };

  const confirmSave = () => {
    if (!selected) return;

    setErrors({ isValid: true, errors: [] });

    if (isNew) setRequisitions((prev) => [...prev, selected]);
    else
      setRequisitions((prev) =>
        prev.map((r) =>
          r.code_p === selected.code_p && r.date_d === selected.date_d
            ? selected
            : r,
        ),
      );
    setSelected(null);
    setShowSaveConfirm(false);
  };

  const handleDelete = () => {
    if (!selected) return;
    setRequisitions((prev) =>
      prev.filter(
        (r) => !(r.code_p === selected.code_p && r.date_d === selected.date_d),
      ),
    );
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
          {t("requestNote")}
        </h1>
        <p className="text-sm text-gray-600">{t("requisitionRequestsDesc")}</p>
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
            {isNew ? t("newRequest") : t("editRequest")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("codeP")}
              </label>
              <input
                type="text"
                value={selected.code_p}
                onChange={(e) => {
                  setSelected({ ...selected, code_p: e.target.value });
                  setErrors({ isValid: true, errors: [] });
                }}
                title={t("codeP")}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none ${
                  getErrorMessage("code_p")
                    ? "border-red-400 bg-red-50 focus:border-red-500"
                    : "border-gray-200 hover:border-gray-300 focus:border-emerald-500"
                }`}
              />
              {getErrorMessage("code_p") && (
                <p className="text-red-600 text-xs mt-2 font-medium">
                  {getErrorMessage("code_p")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("dateD")}
              </label>
              <input
                type="date"
                value={selected.date_d}
                onChange={(e) => {
                  setSelected({ ...selected, date_d: e.target.value });
                  setErrors({ isValid: true, errors: [] });
                }}
                title={t("dateD")}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none ${
                  getErrorMessage("date_d")
                    ? "border-red-400 bg-red-50 focus:border-red-500"
                    : "border-gray-200 hover:border-gray-300 focus:border-emerald-500"
                }`}
              />
              {getErrorMessage("date_d") && (
                <p className="text-red-600 text-xs mt-2 font-medium">
                  {getErrorMessage("date_d")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("poste")}
              </label>
              <input
                type="text"
                value={selected.poste}
                readOnly
                title={t("poste")}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("libelle")}
              </label>
              <input
                type="text"
                value={selected.libelle}
                onChange={(e) => {
                  setSelected({ ...selected, libelle: e.target.value });
                  setErrors({ isValid: true, errors: [] });
                }}
                title={t("libelle")}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none ${
                  getErrorMessage("libelle")
                    ? "border-red-400 bg-red-50 focus:border-red-500"
                    : "border-gray-200 hover:border-gray-300 focus:border-emerald-500"
                }`}
              />
              {getErrorMessage("libelle") && (
                <p className="text-red-600 text-xs mt-2 font-medium">
                  {getErrorMessage("libelle")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("qty")}
              </label>
              <input
                type="number"
                value={selected.qty}
                min="0"
                onChange={(e) => {
                  setSelected({ ...selected, qty: Number(e.target.value) });
                  setErrors({ isValid: true, errors: [] });
                }}
                title={t("qty")}
                className={`w-full border-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none ${
                  getErrorMessage("qty")
                    ? "border-red-400 bg-red-50 focus:border-red-500"
                    : "border-gray-200 hover:border-gray-300 focus:border-emerald-500"
                }`}
              />
              {getErrorMessage("qty") && (
                <p className="text-red-600 text-xs mt-2 font-medium">
                  {getErrorMessage("qty")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("credit1")}
              </label>
              <input
                type="number"
                value={selected.credit_1}
                onChange={(e) =>
                  setSelected({ ...selected, credit_1: Number(e.target.value) })
                }
                title={t("credit1")}
                className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("credit2")}
              </label>
              <input
                type="number"
                value={selected.credit_2}
                onChange={(e) =>
                  setSelected({ ...selected, credit_2: Number(e.target.value) })
                }
                title={t("credit2")}
                className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("dateR")}
              </label>
              <input
                type="date"
                value={selected.date_r}
                onChange={(e) =>
                  setSelected({ ...selected, date_r: e.target.value })
                }
                title={t("dateR")}
                className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("statut")}
              </label>
              <select
                value={selected.statut}
                onChange={(e) =>
                  setSelected({ ...selected, statut: e.target.value })
                }
                title={t("statut")}
                className="w-full border-2 border-gray-200 hover:border-gray-300 focus:border-emerald-500 focus:outline-none rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
              >
                <option value="Pending">{t("pending")}</option>
                <option value="Approved">{t("approved")}</option>
                <option value="Rejected">{t("rejected")}</option>
              </select>
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
      <div className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-emerald-100">
          <h2 className="text-lg font-bold text-gray-800">Request Records</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2 border-emerald-200">
            <tr>
              {[
                t("codeP"),
                t("dateD"),
                t("libelle"),
                t("qty"),
                t("credit1"),
                t("credit2"),
                t("dateR"),
                t("statut"),
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
            {filtered.map((r, i) => (
              <tr
                key={i}
                className="border-b hover:bg-emerald-50/50 cursor-pointer transition-colors duration-150"
                onClick={() => {
                  setSelected({ ...r });
                  setIsNew(false);
                }}
              >
                <td className="px-6 py-3 font-semibold text-emerald-600">
                  {r.code_p}
                </td>
                <td className="px-6 py-3 text-gray-700">{r.date_d}</td>
                <td className="px-6 py-3 text-gray-700">{r.libelle}</td>
                <td className="px-6 py-3 text-gray-700">{r.qty}</td>
                <td className="px-6 py-3 text-gray-700">
                  {r.credit_1.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-gray-700">
                  {r.credit_2.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-gray-700">{r.date_r || "—"}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      r.statut === "Approved"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.statut === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {r.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            <p className="text-sm">
              No requests found. Click "New Record" to add one.
            </p>
          </div>
        )}
      </div>

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSaveConfirm}
        title={isNew ? "Add Request" : "Update Request"}
        message={`Are you sure you want to ${isNew ? "add" : "update"} request for "${selected?.libelle}"?`}
        confirmText={isNew ? "Add" : "Update"}
        cancelText="Cancel"
        isDangerous={false}
        onConfirm={confirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Request"
        message={`Are you sure you want to delete the request for "${selected?.libelle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
