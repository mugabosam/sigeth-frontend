import { useState, useMemo } from "react";
import { Search, Plus, Save, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  validateIndividualReservation,
  type ValidationResult,
} from "../../utils/roomsAttendantValidation";
import { createErrorNotification } from "../../utils/errorFormatter";
import { COUNTRIES, getPhoneCodeByNationality } from "../../utils/countries";
import type { RCS } from "../../types";
import { frontOfficeApi } from "../../services/sigethApi";

type Mode = "1112" | "1114" | "1116";

export default function IndividualReservation({
  mode = "1112",
}: {
  mode?: Mode;
}) {
  const { t } = useLang();
  const {
    reservations,
    setReservations,
    rooms,
    setRooms,
    currencies,
    paymentModes,
  } = useHotelData();
  const [errorMsg, setErrorMsg] = useState("");
  const [queryRoom, setQueryRoom] = useState("");
  const [queryGuest, setQueryGuest] = useState("");
  const [selected, setSelected] = useState<RCS | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [roomSuggestions, setRoomSuggestions] = useState<RCS[]>([]);
  const [guestSuggestions, setGuestSuggestions] = useState<RCS[]>([]);
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);
  const [showGuestSuggestions, setShowGuestSuggestions] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [localPuv, setLocalPuv] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
    payt_mode: "",
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

  const titles: Record<Mode, string> = {
    "1112": t("individualReservation"),
    "1114": t("checkInWithReservation"),
    "1116": t("checkInWithoutReservation"),
  };

  const handleRoomChange = (value: string) => {
    setQueryRoom(value);
    if (!value.trim()) {
      setRoomSuggestions([]);
      setShowRoomSuggestions(false);
      return;
    }
    const q = value.toLowerCase();
    const matches = reservations
      .filter((r) => r.room_num.toLowerCase().includes(q))
      .slice(0, 8);
    setRoomSuggestions(matches);
    setShowRoomSuggestions(true);
  };

  const handleGuestChange = (value: string) => {
    setQueryGuest(value);
    if (!value.trim()) {
      setGuestSuggestions([]);
      setShowGuestSuggestions(false);
      return;
    }
    const q = value.toLowerCase();
    const matches = reservations
      .filter((r) => r.guest_name.toLowerCase().includes(q))
      .slice(0, 8);
    setGuestSuggestions(matches);
    setShowGuestSuggestions(true);
  };

  const handleSelectSuggestion = (r: RCS) => {
    setSelected({ ...r });
    // For existing reservations, store the current puv as localPuv for comparison
    // If it's in RWF, it's the true base. If it's in another currency, we'll use it as reference
    setLocalPuv(r.puv);
    setIsNew(false);
    setQueryRoom(r.room_num);
    setQueryGuest(r.guest_name);
    setRoomSuggestions([]);
    setGuestSuggestions([]);
    setShowRoomSuggestions(false);
    setShowGuestSuggestions(false);
  };

  const handleSearch = () => {
    const found = reservations.find(
      (r) =>
        (queryRoom && r.room_num === queryRoom) ||
        (queryGuest &&
          r.guest_name.toLowerCase().includes(queryGuest.toLowerCase())),
    );
    if (found) {
      setSelected({ ...found });
      // Always store the puv value as localPuv for currency conversion reference
      setLocalPuv(found.puv);
      setIsNew(false);
    } else {
      setSelected({ ...blank, room_num: queryRoom, guest_name: queryGuest });
      setLocalPuv(0);
      setIsNew(true);
    }
    setRoomSuggestions([]);
    setGuestSuggestions([]);
    setShowRoomSuggestions(false);
    setShowGuestSuggestions(false);
  };

  const calc = (f: RCS): RCS => {
    const arr = f.arrival_date ? new Date(f.arrival_date) : null;
    const dep = f.depart_date ? new Date(f.depart_date) : null;
    const qty =
      arr && dep
        ? Math.max(Math.round((dep.getTime() - arr.getTime()) / 86400000), 0)
        : 0;
    const base = qty * f.puv;
    const stay_cost = f.discount > 0 ? base * (1 - f.discount / 100) : base;
    return { ...f, stay_cost };
  };

  const handleChange = (field: keyof RCS, value: string | number) => {
    if (!selected) return;
    const updated = calc({ ...selected, [field]: value });
    setSelected(updated);
    // Validate in real-time
    const validationResult = validateIndividualReservation(updated);
    setErrors(validationResult);
  };

  const handleSave = () => {
    setConfirmSaveOpen(true);
  };

  const confirmSave = async () => {
    if (!selected) return;

    // Validate before saving
    const validationResult = validateIndividualReservation(selected);
    setErrors(validationResult);

    if (!validationResult.isValid) {
      setErrorMsg(createErrorNotification(validationResult.errors, t));
      setConfirmSaveOpen(false);
      return;
    }

    try {
      if (mode === "1114") {
        const response = await frontOfficeApi.checkin({
          room_num: selected.room_num,
          guest_name: selected.guest_name,
        });
        setReservations((prev) =>
          prev.map((r) => (r.id === response.reservation.id ? response.reservation : r)),
        );
        setRooms((prev) =>
          prev.map((room) => (room.id === response.room.id ? response.room : room)),
        );
        setSuccessMessage("Check-in successful!");
      } else if (mode === "1116") {
        const response = await frontOfficeApi.walkin(selected);
        setReservations((prev) => [...prev, response.reservation]);
        setRooms((prev) =>
          prev.map((room) => (room.id === response.room.id ? response.room : room)),
        );
        setSuccessMessage("Walk-in registration successful!");
      } else {
        const saved = isNew
          ? await frontOfficeApi.createReservation(selected)
          : selected.id
            ? await frontOfficeApi.updateReservation(selected.id, selected)
            : await frontOfficeApi.createReservation(selected);

        if (isNew || !selected.id) {
          setReservations((prev) => [...prev, saved]);
          setSuccessMessage(`Reservation created successfully! Reservation ID: ${saved.code_p}`);
        } else {
          setReservations((prev) =>
            prev.map((r) => (r.id === saved.id ? saved : r)),
          );
          setSuccessMessage(`Reservation updated successfully! Reservation ID: ${saved.code_p}`);
        }
      }
      setShowSuccessModal(true);
      setSelected(null);
      setQueryRoom("");
      setQueryGuest("");
    } catch (error) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : t("loginError");
      setSuccessMessage(`Error: ${errorMessage}`);
      setShowSuccessModal(true);
    } finally {
      setConfirmSaveOpen(false);
    }
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

  return (
    <div className="space-y-4">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-hotel-text-primary">
          {titles[mode]}
        </h1>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Query window */}
      <div className="bg-white border border-hotel-border rounded p-4">
        <h3 className="text-sm font-semibold text-hotel-text-primary mb-3 uppercase tracking-wide">
          {t("queryWindow")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
              {t("roomNumber")}
            </label>
            <input
              value={queryRoom}
              onChange={(e) => handleRoomChange(e.target.value)}
              placeholder={t("roomNumber")}
              title={t("roomNumber")}
              className="w-full border border-hotel-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
            />
            {showRoomSuggestions && roomSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-hotel-border rounded shadow z-50 max-h-32 overflow-y-auto">
                {roomSuggestions.map((r, i) => (
                  <button
                    key={`room-${i}`}
                    onClick={() => handleSelectSuggestion(r)}
                    className="w-full text-left px-3 py-2 hover:bg-hotel-cream transition-colors border-b last:border-b-0 text-xs"
                  >
                    <div className="font-medium text-hotel-text-primary">
                      {r.room_num}
                    </div>
                    <div className="text-xs text-hotel-text-secondary">{r.guest_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
              {t("guestName")}
            </label>
            <input
              value={queryGuest}
              onChange={(e) => handleGuestChange(e.target.value)}
              placeholder={t("guestName")}
              title={t("guestName")}
              className="w-full border border-hotel-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {showGuestSuggestions && guestSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-hotel-border rounded shadow z-50 max-h-32 overflow-y-auto">
                {guestSuggestions.map((r, i) => (
                  <button
                    key={`guest-${i}`}
                    onClick={() => handleSelectSuggestion(r)}
                    className="w-full text-left px-3 py-2 hover:bg-hotel-cream transition-colors border-b last:border-b-0 text-xs"
                  >
                    <div className="font-medium text-hotel-text-primary">
                      {r.guest_name}
                    </div>
                    <div className="text-xs text-hotel-text-secondary">
                      Room {r.room_num}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="self-end bg-hotel-gold text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors flex items-center justify-center gap-2"
          >
            <Search size={14} />
            {t("search")}
          </button>
          <button
            onClick={() => {
              setSelected({ ...blank });
              setIsNew(true);
              setLocalPuv(0);
            }}
            className="self-end border border-hotel-gold text-hotel-gold px-4 py-2 rounded text-sm font-medium hover:bg-hotel-cream transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            {t("newRecord")}
          </button>
        </div>
      </div>

      {/* Form section */}
      {selected && (
        <div className="bg-white border border-hotel-border rounded p-4 space-y-4">
          <h3 className="text-sm font-semibold text-hotel-text-primary uppercase tracking-wide">
            {isNew ? t("newReservation") : t("editReservation")}
          </h3>

          {/* Form fields grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {(
              [
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
                ["arrival_date", t("arrivalDate"), "date", true, {}],
                ["depart_date", t("departDate"), "date", true, {}],
                ["adulte", t("adults"), "number", true, { min: "1" }],
                ["children", t("children"), "number", false, { min: "0" }],
                ["age", t("age"), "number", false, { min: "0" }],
                ["puv", t("pricePerNight"), "number", false, { min: "0" }],
                ["discount", t("discount"), "number", false, { min: "0", max: "100" }],
                ["airport_time", t("airportTime"), "text", false, {}],
                ["stay_cost", t("stayCost"), "number", false, {}],
                ["deposit", t("deposit"), "number", true, { min: "0" }],
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
                      className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                        errorMsg
                          ? "border-hotel-danger"
                          : "border-hotel-border"
                      }`}
                    >
                      <option value="">{t("select")}</option>
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
                    {label} {required && <span className="text-hotel-danger">*</span>}
                  </label>
                  {field === "phone" && phoneCode ? (
                    <div className="flex items-center gap-1">
                      <span className="bg-hotel-cream border border-hotel-border rounded-l px-2 py-2 text-xs font-semibold text-hotel-text-secondary">
                        {phoneCode}
                      </span>
                      <input
                        type={type}
                        placeholder="788 123 456"
                        value={selected[field] ?? ""}
                        required={required}
                        onChange={(e) => handleChange(field, e.target.value)}
                        title={label}
                        className={`flex-1 border rounded-r px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
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
                      readOnly={field === "stay_cost"}
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
                      className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold ${field === "stay_cost" ? "bg-hotel-cream" : ""} ${
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
                  let newPuv = selected.puv;

                  if (code === "RWF") {
                    // Converting to RWF - use the localPuv as base
                    newPuv = localPuv > 0 ? localPuv : selected.puv;
                  } else {
                    // Converting to another currency
                    const rate = currencyOptions.find(c => c.code === code)?.exchange_rate || 1;
                    if (localPuv > 0) {
                      // If we have a known base (RWF), convert from RWF
                      newPuv = Math.round(localPuv / rate);
                    } else {
                      // Otherwise convert from current puv
                      const currentRate = currencyOptions.find(c => c.code === selected.current_mon)?.exchange_rate || 1;
                      const rwfEquivalent = Math.round(selected.puv * currentRate);
                      newPuv = Math.round(rwfEquivalent / rate);
                    }
                  }

                  // Update both puv and current_mon together and recalculate
                  const updatedWithCurrency = { ...selected, puv: newPuv, current_mon: code };
                  const updatedWithCalc = calc(updatedWithCurrency);
                  setSelected(updatedWithCalc);
                  setErrors(validateIndividualReservation(updatedWithCalc));
                }}
                className="w-full border border-hotel-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              >
                {currencyOptions.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.label} {c.code !== "RWF" ? `(1 = ${c.exchange_rate.toLocaleString()} RWF)` : "(local)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment mode */}
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("paymentMode")}
              </label>
              <select
                value={selected.payt_mode}
                onChange={(e) => handleChange("payt_mode", e.target.value)}
                title={t("paymentMode")}
                className="w-full border border-hotel-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              >
                <option value="">-- {t("select")} --</option>
                {paymentModes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Available rooms table */}
          {(mode === "1112" || mode === "1114" || mode === "1116") && (
            <div className="border border-hotel-border rounded p-3 bg-hotel-paper">
              <h4 className="text-xs font-semibold text-hotel-text-primary mb-2 uppercase tracking-wide">
                {t("availableRooms")}
              </h4>
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-hotel-navy text-white sticky top-0">
                    <tr>
                      {[
                        t("roomNumber"),
                        t("designation"),
                        t("price1"),
                        t("price2"),
                        t("status"),
                      ].map((h) => (
                        <th key={h} className="text-left py-2 px-2 font-medium">
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
                          className="border-b border-hotel-border hover:bg-hotel-cream cursor-pointer transition-colors"
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
                          <td className="py-2 px-2 font-medium text-hotel-text-primary">
                            {r.room_num}
                          </td>
                          <td className="py-2 px-2 text-hotel-text-secondary">{r.designation}</td>
                          <td className="py-2 px-2 text-right font-mono">
                            {r.price_1.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-right font-mono">
                            {r.price_2.toLocaleString()}
                          </td>
                          <td className="py-2 px-2">
                            <span className="text-hotel-success font-medium">VC</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-hotel-border">
            <button
              onClick={handleSave}
              className="bg-hotel-gold text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors flex items-center gap-2"
            >
              <Save size={14} />
              {t("save")}
            </button>
            {!isNew && (
              <button
                onClick={handleDelete}
                className="bg-hotel-danger text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
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

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmSaveOpen}
        title={t("confirm")}
        message={t("confirmSave")}
        onConfirm={confirmSave}
        onCancel={() => setConfirmSaveOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmDeleteOpen}
        title={t("confirm")}
        message={t("confirmDelete")}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

      {/* Success/Failure Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white border border-hotel-border rounded p-4 max-w-sm mx-auto">
            <div className="flex items-center gap-3 mb-4">
              {successMessage.includes("success") || successMessage.includes("Success") ? (
                <div className="w-10 h-10 rounded-full bg-hotel-success/20 flex items-center justify-center">
                  <CheckCircle2 className="text-hotel-success" size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-hotel-danger/20 flex items-center justify-center">
                  <AlertTriangle className="text-hotel-danger" size={20} />
                </div>
              )}
              <h3 className="text-base font-semibold text-hotel-text-primary">
                {successMessage.includes("success") || successMessage.includes("Success") ? "Success" : "Error"}
              </h3>
            </div>
            <p className="text-sm text-hotel-text-secondary mb-6">
              {successMessage}
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-hotel-gold text-white px-4 py-2 rounded text-sm font-medium hover:bg-hotel-gold-dark transition-colors"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
