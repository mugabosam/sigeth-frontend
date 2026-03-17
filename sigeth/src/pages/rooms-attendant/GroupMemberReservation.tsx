import { useState, useMemo } from "react";
import { Search, Save, Trash2, AlertTriangle } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  validateGroupMemberReservation,
  type ValidationResult,
} from "../../utils/roomsAttendantValidation";
import { createErrorNotification } from "../../utils/errorFormatter";
import { COUNTRIES, getPhoneCodeByNationality } from "../../utils/countries";
import type { RCS } from "../../types";
import { frontOfficeApi } from "../../services/sigethApi";

export default function GroupMemberReservation({
  mode = "1113",
}: {
  mode?: "1113" | "1117";
}) {
  const { t } = useLang();
  const {
    groupReservations,
    reservations,
    setReservations,
    rooms,
    setRooms,
    paymentModes,
    currencies,
  } = useHotelData();
  const [errorMsg, setErrorMsg] = useState("");
  const [queryCode, setQueryCode] = useState("");
  const [queryGroup, setQueryGroup] = useState("");
  const [groupFound, setGroupFound] = useState<
    (typeof groupReservations)[0] | null
  >(null);
  const [selected, setSelected] = useState<RCS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [groupSuggestions, setGroupSuggestions] = useState<
    typeof groupReservations
  >([]);
  const [showGroupSuggestions, setShowGroupSuggestions] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [localPuv, setLocalPuv] = useState(0);
  const [errors, setErrors] = useState<ValidationResult>({
    isValid: true,
    errors: [],
  });

  const blank: RCS = {
    code_p: "",
    groupe_name: "",
    room_num: "",
    guest_name: "",
    id_card: "",
    nationality: "",
    phone: "",
    email: "",
    arrival_date: "",
    depart_date: "",
    adulte: 1,
    children: 0,
    age: 0,
    twin_num: 0,
    twin_name: "",
    city: "",
    country: "",
    current_mon: "RWF",
    puv: 0,
    payt_mode: paymentModes[0]?.id ?? "",
    airport_time: "",
    discount: 0,
    stay_cost: 0,
    deposit: 0,
    status: 0,
  };

  const getErrorMessage = (field: string): string => {
    const fieldError = errors.errors.find((e) => e.field === field);
    return fieldError ? t(fieldError.message as any) : "";
  };

  const currencyOptions = useMemo(() => [
    { code: "RWF", label: "Rwandan Franc", exchange_rate: 1 },
    ...currencies,
  ], [currencies]);

  const titles = {
    "1113": t("groupMemberReservation"),
    "1117": t("checkInGroupReservation"),
  };

  const handleGroupInputChange = (value: string, isCode: boolean) => {
    if (isCode) setQueryCode(value);
    else setQueryGroup(value);

    if (!value.trim()) {
      setGroupSuggestions([]);
      setShowGroupSuggestions(false);
      return;
    }

    const q = value.toLowerCase();
    const matches = groupReservations
      .filter(
        (g) =>
          (isCode
            ? g.code_g.toLowerCase().includes(q)
            : g.groupe_name.toLowerCase().includes(q)) && g.status === 0,
      )
      .slice(0, 8);

    setGroupSuggestions(matches);
    setShowGroupSuggestions(true);
  };

  const handleSelectGroupFromSuggestions = (
    g: (typeof groupReservations)[0],
  ) => {
    setGroupFound(g);
    setGroupSuggestions([]);
    setShowGroupSuggestions(false);
    setQueryCode(g.code_g);
    setQueryGroup(g.groupe_name);
  };

  const handleSearchGroup = () => {
    const g = groupReservations.find(
      (g) =>
        (queryCode && g.code_g === queryCode) ||
        (queryGroup &&
          g.groupe_name.toLowerCase().includes(queryGroup.toLowerCase())),
    );
    if (g) {
      if (g.status === 1) {
        alert(t("groupClosed"));
        return;
      }
      setGroupFound(g);
      setGroupSuggestions([]);
      setShowGroupSuggestions(false);
    } else {
      alert(t("groupNotFound"));
    }
  };

  const handleSelectMember = (r: RCS) => {
    setSelected({ ...r });
    setLocalPuv(r.current_mon === "RWF" ? r.puv : 0);
    setIsNew(false);
  };
  const handleNewMember = () => {
    if (!groupFound) return;
    const newMember = {
      ...blank,
      code_p: groupFound.code_g,
      groupe_name: groupFound.groupe_name,
      arrival_date: groupFound.arrival_date,
      depart_date: groupFound.depart_date,
      puv: groupFound.puv,
      current_mon: groupFound.current_mon,
      payt_mode: groupFound.payt_mode,
      discount: groupFound.discount,
    };
    setSelected(newMember);
    setLocalPuv(groupFound.current_mon === "RWF" ? groupFound.puv : 0);
    setIsNew(true);
  };

  const calc = (f: RCS): RCS => {
    const arr = f.arrival_date ? new Date(f.arrival_date) : null;
    const dep = f.depart_date ? new Date(f.depart_date) : null;
    const qty =
      arr && dep
        ? Math.max(Math.round((dep.getTime() - arr.getTime()) / 86400000), 0)
        : 0;
    const base = qty * f.puv;
    return {
      ...f,
      stay_cost: f.discount > 0 ? base * (1 - f.discount / 100) : base,
    };
  };

  const handleChange = (field: keyof RCS, value: string | number) => {
    if (!selected) return;
    const updated = calc({ ...selected, [field]: value });
    setSelected(updated);
    // Validate in real-time
    const validationResult = validateGroupMemberReservation(updated);
    setErrors(validationResult);
  };

  const handleSave = () => {
    setConfirmSaveOpen(true);
  };

  const confirmSave = async () => {
    if (!selected) return;

    // Validate before saving
    const validationResult = validateGroupMemberReservation(selected);
    setErrors(validationResult);

    if (!validationResult.isValid) {
      setErrorMsg(createErrorNotification(validationResult.errors, t));
      setConfirmSaveOpen(false);
      return;
    }

    try {
      if (mode === "1117") {
        const response = await frontOfficeApi.groupCheckin({
          code_p: selected.code_p,
          groupe_name: selected.groupe_name,
          guest_name: selected.guest_name,
          room_num: selected.room_num,
          arrival_date: selected.arrival_date,
          depart_date: selected.depart_date,
          puv: selected.puv,
          current_mon: selected.current_mon,
        });

        setReservations((prev) => {
          const exists = prev.some((r) => r.id === response.reservation.id);
          if (exists) {
            return prev.map((r) =>
              r.id === response.reservation.id ? response.reservation : r,
            );
          }
          return [...prev, response.reservation];
        });
        setRooms((prev) =>
          prev.map((room) =>
            room.id === response.room.id ? response.room : room,
          ),
        );
      } else {
        const saved = isNew
          ? await frontOfficeApi.createReservation(selected)
          : selected.id
            ? await frontOfficeApi.updateReservation(selected.id, selected)
            : await frontOfficeApi.createReservation(selected);

        if (isNew || !selected.id) {
          setReservations((prev) => [...prev, saved]);
        } else {
          setReservations((prev) =>
            prev.map((r) => (r.id === saved.id ? saved : r)),
          );
        }
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
    setConfirmSaveOpen(false);
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;

    if (selected.id) {
      try {
        await frontOfficeApi.deleteReservation(selected.id);
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

    setReservations((prev) => prev.filter((r) => r.id !== selected.id));
    setSelected(null);
    setConfirmDeleteOpen(false);
  };

  const groupMembers = groupFound
    ? reservations.filter(
        (r) =>
          r.code_p === groupFound.code_g ||
          r.groupe_name === groupFound.groupe_name,
      )
    : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white border border-hotel-border rounded p-4">
        <h1 className="text-2xl font-display font-bold text-hotel-text-primary">
          {titles[mode]}
        </h1>
      </div>
      {/* Group query */}
      <div className="bg-white border border-hotel-border rounded p-4">
        <h3 className="text-sm font-semibold text-hotel-text-primary mb-3 uppercase tracking-wide">
          {t("searchGroup")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
              {t("groupCode")}
            </label>
            <input
              value={queryCode}
              onChange={(e) => handleGroupInputChange(e.target.value, true)}
              placeholder={t("groupCode")}
              title={t("groupCode")}
              className="w-full border border-hotel-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
              {t("groupName")}
            </label>
            <input
              value={queryGroup}
              onChange={(e) => handleGroupInputChange(e.target.value, false)}
              placeholder={t("groupName")}
              title={t("groupName")}
              className="w-full border border-hotel-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              onKeyDown={(e) => e.key === "Enter" && handleSearchGroup()}
            />
            {showGroupSuggestions && groupSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-hotel-border rounded z-50 max-h-48 overflow-y-auto">
                {groupSuggestions.map((g) => (
                  <button
                    key={g.code_g}
                    onClick={() => handleSelectGroupFromSuggestions(g)}
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
          <div className="flex items-end">
            <button
              onClick={handleSearchGroup}
              className="w-full bg-hotel-gold text-white px-4 py-2 rounded flex items-center justify-center gap-2 text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
            >
              <Search size={16} />
              {t("search")}
            </button>
          </div>
        </div>
      </div>
      {/* Group info + members browser */}
      {groupFound && (
        <>
          <div className="bg-hotel-cream border border-hotel-border rounded p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-hotel-text-secondary">{t("groupCode")}:</span>{" "}
                <strong className="text-hotel-text-primary">{groupFound.code_g}</strong>
              </div>
              <div>
                <span className="text-hotel-text-secondary">{t("groupName")}:</span>{" "}
                <strong className="text-hotel-text-primary">{groupFound.groupe_name}</strong>
              </div>
              <div>
                <span className="text-hotel-text-secondary">{t("persons")}:</span>{" "}
                <strong className="text-hotel-text-primary">{groupFound.number_pers}</strong>
              </div>
              <div>
                <span className="text-hotel-text-secondary">{t("status")}:</span>{" "}
                <strong className="text-hotel-text-primary">
                  {groupFound.status === 0
                    ? t("statusOpen")
                    : t("statusClosed")}
                </strong>
              </div>
            </div>
          </div>
          {/* Members list */}
          <div className="bg-white border border-hotel-border rounded overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 border-b border-hotel-border">
              <h3 className="text-sm font-semibold text-hotel-text-primary">
                {t("groupMembers")} ({groupMembers.length})
              </h3>
              <button
                onClick={handleNewMember}
                className="bg-hotel-gold text-white px-3 py-1 rounded text-xs font-medium hover:bg-hotel-gold-dark transition-colors"
              >
                + {t("newMember")}
              </button>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-hotel-navy text-white">
                <tr>
                  {[
                    t("roomNumber"),
                    t("guestName"),
                    t("phone"),
                    t("arrivalDate"),
                    t("departDate"),
                    t("stayCost"),
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
                {groupMembers.map((r, i) => (
                  <tr
                    key={i}
                    className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer"
                    onClick={() => handleSelectMember(r)}
                  >
                    <td className="py-2 px-2 text-hotel-text-primary">{r.room_num}</td>
                    <td className="py-2 px-2 text-hotel-text-primary">{r.guest_name}</td>
                    <td className="py-2 px-2 text-hotel-text-primary">{r.phone}</td>
                    <td className="py-2 px-2 text-hotel-text-primary">{r.arrival_date}</td>
                    <td className="py-2 px-2 text-hotel-text-primary">{r.depart_date}</td>
                    <td className="py-2 px-2 text-hotel-text-primary">
                      {r.stay_cost.toLocaleString()} {r.current_mon}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {/* Gindiv_form */}
      {selected && (
        <div className="bg-white border border-hotel-border rounded p-4 space-y-3">
          <h3 className="text-base font-display font-semibold text-hotel-text-primary">
            {isNew ? t("newMember") : t("editMember")} — Gindiv_form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {(
              [
                ["groupe_name", t("groupName"), "text", false, {}],
                ["room_num", t("roomNumber"), "text", true, {}],
                [
                  "guest_name",
                  t("guestName"),
                  "text",
                  true,
                  {
                    pattern: "^[a-zA-Z\\s\\-']{2,}$",
                    placeholder: "Letters only",
                  },
                ],
                [
                  "id_card",
                  t("idCard"),
                  "text",
                  false,
                  {
                    pattern: "^[A-Za-z0-9]{5,}$",
                    placeholder: "Alphanumeric (5+ chars)",
                  },
                ],
                ["nationality", t("nationality"), "text", false, {}],
                [
                  "phone",
                  t("phone"),
                  "tel",
                  true,
                  { pattern: "^\\+[1-9]\\d{1,14}$", placeholder: "+250..." },
                ],
                ["email", t("email"), "email", false, {}],
                ["city", t("city"), "text", false, {}],
                ["country", t("country"), "text", false, {}],
                ["arrival_date", t("arrivalDate"), "date", false, {}],
                ["depart_date", t("departDate"), "date", false, {}],
                ["adulte", t("adults"), "number", false, { min: "0" }],
                ["children", t("children"), "number", false, { min: "0" }],
                ["age", t("age"), "number", false, { min: "0" }],
                ["puv", t("pricePerNight"), "number", false, { min: "0" }],
              ] as [keyof RCS, string, string, boolean, Record<string, any>][]
            ).map(([field, label, type, required, attrs]) => {
              const errorMsg = getErrorMessage(field as string);

              // Special handling for country and nationality selects
              if (field === "nationality" || field === "country") {
                return (
                  <div key={field}>
                    <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                      {label}{" "}
                      {required && <span className="text-hotel-danger">*</span>}
                    </label>
                    <select
                      value={selected[field] ?? ""}
                      onChange={(e) => handleChange(field, e.target.value)}
                      required={required}
                      title={label}
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                        errorMsg
                          ? "border-hotel-danger"
                          : "border-hotel-border"
                      }`}
                    >
                      <option value="">Select</option>
                      {field === "nationality" &&
                        COUNTRIES.map((c) => (
                          <option key={c.code} value={c.nationality}>
                            {c.flag} {c.name} ({c.phoneCode})
                          </option>
                        ))}
                      {field === "country" &&
                        COUNTRIES.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                    </select>
                    {errorMsg && (
                      <p className="text-xs text-hotel-danger mt-1">{errorMsg}</p>
                    )}
                  </div>
                );
              }

              const phoneCode =
                field === "phone"
                  ? getPhoneCodeByNationality(selected.nationality)
                  : undefined;

              return (
                <div key={field}>
                  <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                    {label}{" "}
                    {required && <span className="text-hotel-danger">*</span>}
                  </label>
                  {field === "phone" && phoneCode ? (
                    <div className="flex items-center gap-1">
                      <span className="bg-hotel-cream border border-hotel-border rounded px-3 py-2 text-xs font-semibold text-hotel-text-primary">
                        {phoneCode}
                      </span>
                      <input
                        type={type}
                        placeholder="788 123 456"
                        value={selected[field] ?? ""}
                        required={required}
                        onChange={(e) => handleChange(field, e.target.value)}
                        title={label}
                        className={`flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                          errorMsg
                            ? "border-hotel-danger"
                            : "border-hotel-border"
                        }`}
                      />
                    </div>
                  ) : (
                    <input
                      type={type}
                      value={type === "number" && selected[field] === 0 ? "" : (selected[field] ?? "")}
                      readOnly={field === "groupe_name"}
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
                      className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold ${field === "groupe_name" ? "bg-hotel-cream" : ""} ${
                        errorMsg
                          ? "border-hotel-danger"
                          : "border-hotel-border"
                      }`}
                    />
                  )}
                  {errorMsg && (
                    <p className="text-xs text-hotel-danger mt-1">{errorMsg}</p>
                  )}
                </div>
              );
            })}
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
                    const rate = currencyOptions.find(c => c.code === code)?.exchange_rate || 1;
                    if (localPuv > 0) {
                      const converted = Math.round(localPuv / rate);
                      handleChange("puv", converted);
                    }
                    handleChange("current_mon", code);
                  }
                }}
                className="w-full border border-hotel-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              >
                {currencyOptions.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.label} {c.code !== "RWF" ? `(1 = ${c.exchange_rate.toLocaleString()} RWF)` : "(local)"}
                  </option>
                ))}
              </select>
            </div>
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
            {(
              [
                ["airport_time", t("airportTime"), "text"],
                ["stay_cost", t("stayCost"), "number"],
                ["deposit", t("deposit"), "number"],
              ] as [keyof RCS, string, string][]
            ).map(([field, label, type]) => {
              const errorMsg = getErrorMessage(field as string);
              return (
                <div key={field}>
                  <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={type === "number" && selected[field] === 0 ? "" : (selected[field] ?? "")}
                    readOnly={field === "stay_cost"}
                    onChange={(e) =>
                      handleChange(
                        field,
                        type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                      )
                    }
                    title={label}
                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold ${field === "stay_cost" ? "bg-hotel-cream" : ""} ${
                      errorMsg
                        ? "border-hotel-danger"
                        : "border-hotel-border"
                    }`}
                  />
                  {errorMsg && (
                    <p className="text-xs text-hotel-danger mt-1">{errorMsg}</p>
                  )}
                </div>
              );
            })}
          </div>
          {/* Available rooms browser */}
          {(mode === "1113" || mode === "1117") && (
            <div className="border border-hotel-border rounded p-4 bg-hotel-cream">
              <h4 className="text-xs font-semibold text-hotel-text-primary mb-2 uppercase tracking-wide">
                {t("availableRooms")}
              </h4>
              <div className="max-h-32 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-hotel-navy text-white">
                    <tr>
                      {[
                        t("roomNumber"),
                        t("designation"),
                        t("price1"),
                        t("price2"),
                        t("status"),
                      ].map((h) => (
                        <th key={h} className="text-left py-1 px-2 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rooms
                      .filter((r) => r.status === "VC")
                      .map((r) => (
                        <tr
                          key={r.room_num}
                          className="border-b border-hotel-border hover:bg-white cursor-pointer"
                          onClick={() => {
                            if (!selected) return;
                            setLocalPuv(r.price_1);
                            const updated = calc({
                              ...selected,
                              room_num: r.room_num,
                              puv: r.price_1,
                              current_mon: "RWF",
                            });
                            setSelected(updated);
                          }}
                        >
                          <td className="py-1 px-2 font-medium text-hotel-text-primary">
                            {r.room_num}
                          </td>
                          <td className="py-1 px-2 text-hotel-text-primary">{r.designation}</td>
                          <td className="py-1 px-2 text-hotel-text-primary">
                            {r.price_1.toLocaleString()}
                          </td>
                          <td className="py-1 px-2 text-hotel-text-primary">
                            {r.price_2.toLocaleString()}
                          </td>
                          <td className="py-1 px-2 text-hotel-success">VC</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
                className="bg-hotel-danger text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-red-700 transition-colors"
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

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmSaveOpen}
        title={isNew ? "Create Group Member" : "Update Group Member"}
        message={`Are you sure you want to ${isNew ? "create a new" : "update this"} group member record for ${selected?.guest_name}?`}
        confirmText={isNew ? "Create" : "Update"}
        cancelText="Cancel"
        isDangerous={false}
        onConfirm={confirmSave}
        onCancel={() => setConfirmSaveOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmDeleteOpen}
        title="Delete Group Member"
        message={`Are you sure you want to delete the group member record for ${selected?.guest_name}? This action cannot be undone.`}
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
            <h3 className="text-base font-display font-semibold text-hotel-text-primary">Error</h3>
            <p className="text-xs text-hotel-text-secondary whitespace-pre-wrap">{errorMsg}</p>
            <button
              onClick={() => setErrorMsg("")}
              className="bg-hotel-danger text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
