import { useState, useMemo } from "react";
import { Search, Plus, Save, Trash2, AlertTriangle } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  validateGroupReservation,
  type ValidationResult,
} from "../../utils/roomsAttendantValidation";
import { createErrorNotification } from "../../utils/errorFormatter";
import SearchableCountrySelect from "../../components/ui/SearchableCountrySelect";
import type { GRC } from "../../types";
import { frontOfficeApi } from "../../services/sigethApi";

export default function GroupReservation() {
  const { t } = useLang();
  const { groupReservations, setGroupReservations, currencies, paymentModes } =
    useHotelData();
  const [errorMsg, setErrorMsg] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GRC | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [suggestions, setSuggestions] = useState<GRC[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [localPuv, setLocalPuv] = useState(0);
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
    payt_mode: paymentModes[0]?.id ?? "",
    discount: 0,
    stay_cost: 0,
    deposit: 0,
    status: 0,
  };

  const getErrorMessage = (field: string): string => {
    const fieldError = errors.errors.find((e) => e.field === field);
    return fieldError ? t(fieldError.message as any) : "";
  };

  const currencyOptions = useMemo(
    () => [
      { code: "RWF", label: "Rwandan Franc", exchange_rate: 1 },
      ...currencies,
    ],
    [currencies],
  );

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
    setLocalPuv(g.current_mon === "RWF" ? g.puv : 0);
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
      setLocalPuv(found.current_mon === "RWF" ? found.puv : 0);
      setIsNew(false);
    } else {
      setSelected({ ...blank, groupe_name: query });
      setLocalPuv(0);
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
    return { ...f, stay_cost };
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

  const confirmSave = async () => {
    if (!selected) return;

    // Validate before saving
    const validationResult = validateGroupReservation(selected);
    setErrors(validationResult);

    if (!validationResult.isValid) {
      setErrorMsg(createErrorNotification(validationResult.errors, t));
      setConfirmSaveOpen(false);
      return;
    }

    try {
      const saved = isNew
        ? await frontOfficeApi.createGroup(selected)
        : selected.id
          ? await frontOfficeApi.updateGroup(selected.id, selected)
          : await frontOfficeApi.createGroup(selected);

      if (isNew || !selected.id) {
        setGroupReservations((prev) => [...prev, saved]);
      } else {
        setGroupReservations((prev) =>
          prev.map((g) => (g.id === saved.id ? saved : g)),
        );
      }
    } catch (error) {
      setErrorMsg(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : t("loginError"),
      );
      setConfirmSaveOpen(false);
      return;
    }

    setSelected(null);
    setQuery("");
    setConfirmSaveOpen(false);
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;

    if (selected.id) {
      try {
        await frontOfficeApi.deleteGroup(selected.id);
      } catch (error) {
        setErrorMsg(
          typeof error === "object" && error !== null && "message" in error
            ? String((error as { message: string }).message)
            : t("loginError"),
        );
        setConfirmDeleteOpen(false);
        return;
      }
    }

    setGroupReservations((prev) => prev.filter((g) => g.id !== selected.id));
    setSelected(null);
    setQuery("");
    setConfirmDeleteOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white border border-hotel-border rounded p-4">
        <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
          {t("groupReservation")}
        </h1>
      </div>
      {/* Query window */}
      <div className="bg-white border border-hotel-border rounded p-4">
        <h3 className="text-sm font-semibold text-hotel-text-primary mb-3 uppercase tracking-wide">
          {t("queryWindow")}
        </h3>
        <div className="flex gap-2 flex-wrap relative">
          <div className="flex-1 relative">
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={t("searchGroupName")}
              title={t("searchGroupName")}
              className="w-full border border-hotel-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-hotel-border rounded z-50 max-h-48 overflow-y-auto">
                {suggestions.map((g) => (
                  <button
                    key={g.code_g}
                    onClick={() => handleSelectSuggestion(g)}
                    className="w-full text-left px-3 py-2 hover:bg-hotel-cream transition-colors border-b last:border-b-0 text-sm"
                  >
                    <div className="font-medium text-hotel-text-primary">
                      {g.groupe_name}
                    </div>
                    <div className="text-xs text-hotel-text-secondary">
                      {g.code_g} • {g.number_pers} persons
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
          >
            <Search size={16} />
            {t("search")}
          </button>
          <button
            onClick={() => {
              setSelected({ ...blank });
              setIsNew(true);
              setLocalPuv(0);
            }}
            className="border border-hotel-border text-hotel-text-primary px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-cream transition-colors"
          >
            <Plus size={16} />
            {t("newRecord")}
          </button>
        </div>
      </div>
      {/* Group_form */}
      {selected && (
        <div className="bg-white border border-hotel-border rounded p-4 space-y-3">
          <h3 className="text-base font-display font-semibold text-hotel-text-primary">
            {isNew ? t("newGroup") : t("editGroup")} — Group_form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {(
              [
                ["groupe_name", t("groupName"), "text", true, {}],
                [
                  "phone",
                  t("phone"),
                  "tel",
                  true,
                  {
                    pattern: "^(\\+[1-9]\\d{1,14}|\\d{5,15})$",
                    placeholder: "+250...",
                  },
                ],
                ["email", t("email"), "email", false, {}],
                ["tin", t("tin"), "text", false, {}],
                ["number_pers", t("persons"), "number", true, { min: "1" }],
                ["arrival_date", t("arrivalDate"), "date", true, {}],
                ["puv", t("rateDay"), "number", true, { min: "0" }],
                [
                  "discount",
                  t("discount"),
                  "number",
                  false,
                  { min: "0", max: "100" },
                ],
                ["stay_cost", t("stayCost"), "number", false, {}],
                ["depart_date", t("departDate"), "date", true, {}],
                ["qty", t("nightNum"), "number", false, {}],
                ["deposit", t("deposit"), "number", true, { min: "0" }],
              ] as [keyof GRC, string, string, boolean, Record<string, any>][]
            ).map(([field, label, type, required, attrs]) => {
              const errorMsg = getErrorMessage(field as string);
              return (
                <div key={field}>
                  <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                    {label}{" "}
                    {required && <span className="text-hotel-danger">*</span>}
                  </label>
                  <input
                    type={type}
                    value={
                      type === "number" && selected[field] === 0
                        ? ""
                        : (selected[field] ?? "")
                    }
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
                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                      (field as string) === "qty" ||
                      (field as string) === "stay_cost"
                        ? "bg-hotel-cream"
                        : ""
                    } ${
                      errorMsg ? "border-hotel-danger" : "border-hotel-border"
                    }`}
                  />
                  {errorMsg && (
                    <p className="text-xs text-hotel-danger mt-1">{errorMsg}</p>
                  )}
                </div>
              );
            })}
            {/* Nationality — Searchable country select */}
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("nationality")}
              </label>
              <SearchableCountrySelect
                value={selected.nationality}
                onChange={(value) => handleChange("nationality", value)}
                placeholder={t("select")}
                type="nationality"
              />
            </div>
            {/* Currency dropdown */}
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("currency")}
              </label>
              <select
                value={selected.current_mon || "RWF"}
                onChange={(e) => {
                  const code = e.target.value;
                  if (code === "RWF") {
                    if (localPuv > 0) handleChange("puv", localPuv);
                    handleChange("current_mon", "RWF");
                  } else {
                    const rate =
                      currencyOptions.find((c) => c.code === code)
                        ?.exchange_rate || 1;
                    if (localPuv > 0) {
                      const converted = Math.round(localPuv / rate);
                      handleChange("puv", converted);
                    }
                    handleChange("current_mon", code);
                  }
                }}
                className="w-full border border-hotel-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              >
                {currencyOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.label}{" "}
                    {c.code !== "RWF"
                      ? `(1 = ${c.exchange_rate.toLocaleString()} RWF)`
                      : "(local)"}
                  </option>
                ))}
              </select>
            </div>
            {/* Payment mode — Modep.dat dropdown */}
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("paymentMode")}
              </label>
              <select
                value={selected.payt_mode}
                onChange={(e) => handleChange("payt_mode", e.target.value)}
                title={t("paymentMode")}
                className="w-full border border-hotel-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              >
                {paymentModes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-hotel-border">
            <button
              onClick={handleSave}
              className="bg-hotel-gold text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
            >
              <Save size={16} />
              {t("save")}
            </button>
            {!isNew && (
              <button
                onClick={handleDelete}
                className="bg-hotel-danger text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
              >
                <Trash2 size={16} />
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
      {/* Existing groups list */}
      <div className="bg-white border border-hotel-border rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-hotel-navy text-white">
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
                <th key={h} className="text-left py-2 px-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupReservations.map((g) => (
              <tr
                key={g.code_g}
                className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer"
                onClick={() => {
                  setSelected({ ...g });
                  setLocalPuv(g.current_mon === "RWF" ? g.puv : 0);
                  setIsNew(false);
                }}
              >
                <td className="py-2 px-2 text-hotel-text-primary">
                  {g.code_g}
                </td>
                <td className="py-2 px-2 font-medium text-hotel-text-primary">
                  {g.groupe_name}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">{g.phone}</td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {g.arrival_date}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {g.depart_date}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {g.number_pers}
                </td>
                <td className="py-2 px-2 text-hotel-text-primary">
                  {g.stay_cost.toLocaleString()} {g.current_mon}
                </td>
                <td className="py-2 px-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${g.status === 0 ? "bg-hotel-cream text-hotel-success" : "bg-hotel-cream text-hotel-text-secondary"}`}
                  >
                    {g.status === 0 ? t("statusOpen") : t("statusClosed")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      />

      {/* Error Dialog */}
      {errorMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border border-hotel-border rounded p-4 w-full max-w-md text-center space-y-3">
            <AlertTriangle size={40} className="text-hotel-danger mx-auto" />
            <h3 className="text-base font-display font-semibold text-hotel-text-primary">
              Error
            </h3>
            <p className="text-xs text-hotel-text-secondary whitespace-pre-wrap">
              {errorMsg}
            </p>
            <button
              onClick={() => setErrorMsg("")}
              className="bg-hotel-danger text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


