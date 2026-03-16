import { useState } from "react";
import { Search, Plus, Save, Trash2 } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { useNotification } from "../../hooks/useNotification";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  validateGroupReservation,
  type ValidationResult,
} from "../../utils/roomsAttendantValidation";
import { createErrorNotification } from "../../utils/errorFormatter";
import { COUNTRIES, getPhoneCodeByNationality } from "../../utils/countries";
import type { GRC } from "../../types";

export default function GroupReservation() {
  const { t } = useLang();
  const { groupReservations, setGroupReservations, currencies, paymentModes } =
    useHotelData();
  const { addNotification } = useNotification();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GRC | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [suggestions, setSuggestions] = useState<GRC[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationResult>({
    isValid: true,
    errors: [],
  });

  const blank: GRC = {
    code_g: "",
    groupe_name: "",
    phone: "",
    nationality: "",
    email: "",
    tin: "",
    number_pers: 0,
    arrival_date: "",
    depart_date: "",
    puv: 0,
    current_mon: "RWF",
    exchange: 1,
    qty: 0,
    payt_mode: "Cash",
    discount: 0,
    stay_cost: 0,
    deposit: 0,
    status: 0,
  };

  const getErrorMessage = (field: string): string => {
    const fieldError = errors.errors.find((e) => e.field === field);
    return fieldError ? t(fieldError.message as any) : "";
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = value.toLowerCase();
    const matches = groupReservations
      .filter(
        (g) =>
          g.groupe_name.toLowerCase().includes(q) ||
          g.code_g.toLowerCase().includes(q),
      )
      .slice(0, 8);
    setSuggestions(matches);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (g: GRC) => {
    setSelected({ ...g });
    setIsNew(false);
    setQuery(g.groupe_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    const found = groupReservations.find(
      (g) =>
        g.groupe_name.toLowerCase().includes(query.toLowerCase()) ||
        g.code_g === query,
    );
    if (found) {
      setSelected({ ...found });
      setIsNew(false);
    } else {
      setSelected({ ...blank, groupe_name: query });
      setIsNew(true);
    }
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const calc = (f: GRC) => {
    const arr = f.arrival_date ? new Date(f.arrival_date) : null;
    const dep = f.depart_date ? new Date(f.depart_date) : null;
    const qty =
      arr && dep
        ? Math.max(Math.round((dep.getTime() - arr.getTime()) / 86400000), 0)
        : 0;
    const base = qty * f.puv * f.number_pers;
    const stay_cost = f.discount > 0 ? base * (1 - f.discount / 100) : base;
    return { ...f, qty, stay_cost };
  };

  const handleChange = (field: keyof GRC, value: string | number) => {
    if (!selected) return;
    const updated = calc({ ...selected, [field]: value });
    setSelected(updated);
    // Validate in real-time
    const validationResult = validateGroupReservation(updated);
    setErrors(validationResult);
  };

  const handleSave = () => {
    setConfirmSaveOpen(true);
  };

  const confirmSave = () => {
    if (!selected) return;

    // Validate before saving
    const validationResult = validateGroupReservation(selected);
    setErrors(validationResult);

    if (!validationResult.isValid) {
      addNotification(
        createErrorNotification(validationResult.errors, t),
        "Validation Error",
        "error",
      );
      return;
    }

    if (isNew) setGroupReservations((prev) => [...prev, selected]);
    else
      setGroupReservations((prev) =>
        prev.map((g) => (g.code_g === selected.code_g ? selected : g)),
      );
    addNotification(
      `Group reservation for ${selected.groupe_name} ${isNew ? "created" : "updated"}`,
      "Rooms Attendant",
      "success",
    );
    setSelected(null);
    setQuery("");
    setConfirmSaveOpen(false);
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!selected) return;
    setGroupReservations((prev) =>
      prev.filter((g) => g.code_g !== selected.code_g),
    );
    addNotification(
      `Group reservation for ${selected.groupe_name} deleted`,
      "Rooms Attendant",
      "success",
    );
    setSelected(null);
    setQuery("");
    setConfirmDeleteOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t("groupReservation")}
        </h1>
      </div>
      {/* Query window */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          {t("queryWindow")}
        </h3>
        <div className="flex gap-3 flex-wrap relative">
          <div className="flex-1 relative">
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={t("searchGroupName")}
              title={t("searchGroupName")}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {suggestions.map((g) => (
                  <button
                    key={g.code_g}
                    onClick={() => handleSelectSuggestion(g)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b last:border-b-0 text-sm"
                  >
                    <div className="font-medium text-gray-800">
                      {g.groupe_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {g.code_g} • {g.number_pers} persons
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-all transform hover:scale-105"
          >
            <Search size={16} />
            {t("search")}
          </button>
          <button
            onClick={() => {
              setSelected({ ...blank });
              setIsNew(true);
            }}
            className="border-2 border-green-500 text-green-700 px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium bg-green-50 hover:bg-green-100 transition-all transform hover:scale-105"
          >
            <Plus size={16} />
            {t("newRecord")}
          </button>
        </div>
      </div>
      {/* Group_form */}
      {selected && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isNew ? t("newGroup") : t("editGroup")} — Group_form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ["groupe_name", t("groupName"), "text", true, {}],
                [
                  "phone",
                  t("phone"),
                  "tel",
                  true,
                  { pattern: "^\\+[1-9]\\d{1,14}$", placeholder: "+250..." },
                ],
                ["email", t("email"), "email", false, {}],
                ["tin", t("tin"), "text", false, {}],
                ["number_pers", t("persons"), "number", true, { min: "1" }],
                ["arrival_date", t("arrivalDate"), "date", true, {}],
                ["puv", t("rateDay"), "number", true, { min: "0" }],
                ["stay_cost", t("stayCost"), "number", false, {}],
                ["depart_date", t("departDate"), "date", true, {}],
                ["qty", t("nightNum"), "number", false, {}],
                ["deposit", t("deposit"), "number", true, { min: "0" }],
              ] as [keyof GRC, string, string, boolean, Record<string, any>][]
            ).map(([field, label, type, required, attrs]) => {
              const errorMsg = getErrorMessage(field as string);
              const phoneCode =
                field === "phone"
                  ? getPhoneCodeByNationality(selected.nationality)
                  : undefined;
              return (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                  </label>
                  {field === "phone" && phoneCode ? (
                    <div className="flex items-center gap-1">
                      <span className="bg-gray-100 border border-gray-300 rounded-l-lg px-3 py-2 text-xs font-semibold text-gray-600 whitespace-nowrap">
                        {phoneCode}
                      </span>
                      <input
                        type={type}
                        placeholder="788 123 456"
                        value={selected[field] ?? ""}
                        required={required}
                        onChange={(e) =>
                          handleChange(
                            field,
                            type === "number"
                              ? Number(e.target.value)
                              : e.target.value,
                          )
                        }
                        title={label}
                        className={`flex-1 border rounded-r-lg px-3 py-2 text-sm ${
                          errorMsg
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                  ) : (
                    <input
                      type={type}
                      value={selected[field] ?? ""}
                      readOnly={
                        (field as string) === "qty" ||
                        (field as string) === "stay_cost"
                      }
                      required={required}
                      onChange={(e) =>
                        handleChange(
                          field,
                          type === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                        )
                      }
                      {...attrs}
                      title={label}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${
                        (field as string) === "qty" ||
                        (field as string) === "stay_cost"
                          ? "bg-gray-50"
                          : ""
                      } ${
                        errorMsg
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  )}
                  {errorMsg && (
                    <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
                  )}
                </div>
              );
            })}
            {/* Nationality — Country select dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("nationality")}
              </label>
              <select
                value={selected.nationality}
                onChange={(e) => {
                  handleChange("nationality", e.target.value);
                }}
                title={t("nationality")}
                className="w-full border rounded-lg px-3 py-2 text-sm border-gray-300"
              >
                <option value="">{t("selectCountry")}</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.nationality}>
                    {c.flag} {c.name} ({c.phoneCode})
                  </option>
                ))}
              </select>
            </div>
            {/* Currency field — opens Monnaies.dat lookup */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("currency")}
              </label>
              <button
                type="button"
                onClick={() => setShowCurrencyModal(true)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-left bg-white hover:bg-gray-50"
              >
                {selected.current_mon || t("selectCurrency")}
              </button>
            </div>
            {/* Payment mode — Modep.dat dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("paymentMode")}
              </label>
              <select
                value={selected.payt_mode}
                onChange={(e) => handleChange("payt_mode", e.target.value)}
                title={t("paymentMode")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                {paymentModes.map((m) => (
                  <option key={m.code} value={m.label}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSave}
              className="bg-amber-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-amber-600"
            >
              <Save size={16} />
              {t("save")}
            </button>
            {!isNew && (
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-red-600"
              >
                <Trash2 size={16} />
                {t("delete")}
              </button>
            )}
            <button
              onClick={() => setSelected(null)}
              className="border px-6 py-2 rounded-lg text-sm"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
      {/* Existing groups list */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("groupCode"),
                t("groupName"),
                t("phone"),
                t("arrivalDate"),
                t("departDate"),
                t("persons"),
                t("stayCost"),
                t("status"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-medium text-gray-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupReservations.map((g) => (
              <tr
                key={g.code_g}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelected({ ...g });
                  setIsNew(false);
                }}
              >
                <td className="px-4 py-3">{g.code_g}</td>
                <td className="px-4 py-3 font-medium">{g.groupe_name}</td>
                <td className="px-4 py-3">{g.phone}</td>
                <td className="px-4 py-3">{g.arrival_date}</td>
                <td className="px-4 py-3">{g.depart_date}</td>
                <td className="px-4 py-3">{g.number_pers}</td>
                <td className="px-4 py-3">
                  {g.stay_cost.toLocaleString()} {g.current_mon}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${g.status === 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {g.status === 0 ? t("statusOpen") : t("statusClosed")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Monnaies.dat currency lookup modal */}
      {showCurrencyModal && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("selectCurrency")}
            </h3>
            <table className="w-full text-sm mb-4">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-2">{t("currency")}</th>
                  <th className="text-left px-3 py-2">{t("localRate")}</th>
                </tr>
              </thead>
              <tbody>
                {currencies.map((c) => (
                  <tr
                    key={c.code}
                    className="border-b hover:bg-amber-50 cursor-pointer"
                    onClick={() => {
                      handleChange("current_mon", c.code);
                      if (c.code !== "RWF") {
                        handleChange("puv", c.exchange_rate);
                      }
                      setShowCurrencyModal(false);
                    }}
                  >
                    <td className="px-3 py-2 font-medium">
                      {c.code} — {c.label}
                    </td>
                    <td className="px-3 py-2">
                      {c.exchange_rate.toLocaleString()} RWF
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setShowCurrencyModal(false)}
              className="border px-4 py-2 rounded-lg text-sm w-full"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmSaveOpen}
        title={isNew ? "Create Group Reservation" : "Update Group Reservation"}
        message={`Are you sure you want to ${isNew ? "create a new" : "update this"} group reservation for ${selected?.groupe_name}?`}
        confirmText={isNew ? "Create" : "Update"}
        cancelText="Cancel"
        isDangerous={false}
        onConfirm={confirmSave}
        onCancel={() => setConfirmSaveOpen(false)}
      />
      <ConfirmationModal
        isOpen={confirmDeleteOpen}
        title="Delete Group Reservation"
        message={`Are you sure you want to delete the group reservation for ${selected?.groupe_name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />{" "}
    </div>
  );
}
