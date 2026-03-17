import { useState } from "react";
import { Search, Plus, Save, Trash2, AlertTriangle } from "lucide-react";
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
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [roomSuggestions, setRoomSuggestions] = useState<RCS[]>([]);
  const [guestSuggestions, setGuestSuggestions] = useState<RCS[]>([]);
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);
  const [showGuestSuggestions, setShowGuestSuggestions] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
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
      setIsNew(false);
    } else {
      setSelected({ ...blank, room_num: queryRoom, guest_name: queryGuest });
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
    return { ...f, stay_cost, qty } as RCS;
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
      } else if (mode === "1116") {
        const response = await frontOfficeApi.walkin(selected);
        setReservations((prev) => [...prev, response.reservation]);
        setRooms((prev) =>
          prev.map((room) => (room.id === response.room.id ? response.room : room)),
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
    setQueryRoom("");
    setQueryGuest("");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {titles[mode]}
        </h1>
      </div>
      {/* Query window */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          {t("queryWindow")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("roomNumber")}
            </label>
            <input
              value={queryRoom}
              onChange={(e) => handleRoomChange(e.target.value)}
              placeholder={t("roomNumber")}
              title={t("roomNumber")}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {showRoomSuggestions && roomSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-32 overflow-y-auto">
                {roomSuggestions.map((r, i) => (
                  <button
                    key={`room-${i}`}
                    onClick={() => handleSelectSuggestion(r)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b last:border-b-0 text-sm"
                  >
                    <div className="font-medium text-gray-800">
                      {r.room_num}
                    </div>
                    <div className="text-xs text-gray-500">{r.guest_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("guestName")}
            </label>
            <input
              value={queryGuest}
              onChange={(e) => handleGuestChange(e.target.value)}
              placeholder={t("guestName")}
              title={t("guestName")}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {showGuestSuggestions && guestSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-32 overflow-y-auto">
                {guestSuggestions.map((r, i) => (
                  <button
                    key={`guest-${i}`}
                    onClick={() => handleSelectSuggestion(r)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b last:border-b-0 text-sm"
                  >
                    <div className="font-medium text-gray-800">
                      {r.guest_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Room {r.room_num}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:shadow-lg transition-all transform hover:scale-105"
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
      </div>
      {/* Indiv_form */}
      {selected && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isNew ? t("newReservation") : t("editReservation")} — Indiv_form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {label}{" "}
                      {required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={selected[field] ?? ""}
                      onChange={(e) => handleChange(field, e.target.value)}
                      required={required}
                      title={label}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${
                        errorMsg
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300"
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
                      <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
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
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {label}{" "}
                    {required && <span className="text-red-500">*</span>}
                  </label>
                  {field === "phone" && phoneCode ? (
                    <div className="flex items-center gap-1">
                      <span className="bg-gray-100 border border-gray-300 rounded-l-lg px-3 py-2 text-xs font-semibold text-gray-600">
                        {phoneCode}
                      </span>
                      <input
                        type={type}
                        placeholder="788 123 456"
                        value={selected[field] ?? ""}
                        required={required}
                        onChange={(e) => handleChange(field, e.target.value)}
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
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${field === "stay_cost" ? "bg-gray-50" : ""} ${
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
                <option value="">-- {t("select")} --</option>
                {paymentModes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Available rooms browser */}
          {(mode === "1112" || mode === "1114" || mode === "1116") && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">
                {t("availableRooms")}
              </h4>
              <div className="max-h-40 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      {[
                        t("roomNumber"),
                        t("designation"),
                        t("price1"),
                        t("price2"),
                        t("status"),
                      ].map((h) => (
                        <th key={h} className="text-left py-1 px-2">
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
                          className="border-b hover:bg-amber-50 cursor-pointer"
                          onClick={() => {
                            if (!selected) return;
                            const updated = calc({
                              ...selected,
                              room_num: r.room_num,
                              puv: r.price_1,
                              current_mon: r.current_mon || "RWF",
                            });
                            setSelected(updated);
                          }}
                        >
                          <td className="py-1 px-2 font-medium">
                            {r.room_num}
                          </td>
                          <td className="py-1 px-2">{r.designation}</td>
                          <td className="py-1 px-2">
                            {r.price_1.toLocaleString()}
                          </td>
                          <td className="py-1 px-2">
                            {r.price_2.toLocaleString()}
                          </td>
                          <td className="py-1 px-2">
                            <span className="text-green-600">VC</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
      {/* Current reservations */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("roomNumber"),
                t("guestName"),
                t("phone"),
                t("arrivalDate"),
                t("departDate"),
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
            {reservations.map((r, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelected({ ...r });
                  setIsNew(false);
                }}
              >
                <td className="px-4 py-3">{r.room_num}</td>
                <td className="px-4 py-3 font-medium">{r.guest_name}</td>
                <td className="px-4 py-3">{r.phone}</td>
                <td className="px-4 py-3">{r.arrival_date}</td>
                <td className="px-4 py-3">{r.depart_date}</td>
                <td className="px-4 py-3">{r.stay_cost.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${r.status === 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {r.status === 0 ? t("statusOpen") : t("statusClosed")}
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
        title={isNew ? "Create Reservation" : "Update Reservation"}
        message={`Are you sure you want to ${isNew ? "create a new" : "update this"} reservation for ${selected?.guest_name}?`}
        confirmText={isNew ? "Create" : "Update"}
        cancelText="Cancel"
        isDangerous={false}
        onConfirm={confirmSave}
        onCancel={() => setConfirmSaveOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirmDeleteOpen}
        title="Delete Reservation"
        message={`Are you sure you want to delete the reservation for ${selected?.guest_name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

      {/* Error Dialog */}
      {errorMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center space-y-4">
            <AlertTriangle size={40} className="text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-800">Error</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{errorMsg}</p>
            <button
              onClick={() => setErrorMsg("")}
              className="bg-red-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-red-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
