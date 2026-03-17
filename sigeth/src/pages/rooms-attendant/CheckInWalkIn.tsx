import { useState, useMemo } from "react";
import { UserPlus, Check, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  validateCheckInWalkIn,
  type ValidationResult,
} from "../../utils/roomsAttendantValidation";
import { createErrorNotification } from "../../utils/errorFormatter";
import { COUNTRIES, getPhoneCodeByNationality } from "../../utils/countries";
import type { RCS } from "../../types";
import { frontOfficeApi } from "../../services/sigethApi";

/* ── helper ── */
const today = () => new Date().toISOString().slice(0, 10);

export default function CheckInWalkIn() {
  const { t } = useLang();
  const { setReservations, rooms, setRooms, paymentModes, catrooms, currencies } =
    useHotelData();

  const blank: RCS = {
    code_p: "",
    groupe_name: "",
    room_num: "",
    guest_name: "",
    id_card: "",
    nationality: "",
    phone: "",
    email: "",
    arrival_date: today(),
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

  const [form, setForm] = useState<RCS>({ ...blank });
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedRoomNum, setSelectedRoomNum] = useState<string | null>(null);
  const [roomSearch, setRoomSearch] = useState("");
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [localPuv, setLocalPuv] = useState(0);
  const [errors, setErrors] = useState<ValidationResult>({
    isValid: true,
    errors: [],
  });

  const currencyOptions = useMemo(() => [
    { code: "RWF", label: "Rwandan Franc", exchange_rate: 1 },
    ...currencies,
  ], [currencies]);

  /* Vacant rooms with search */
  const vacantRooms = useMemo(
    () => rooms.filter((r) => r.status === "VC"),
    [rooms],
  );

  const filteredRooms = useMemo(() => {
    if (!roomSearch.trim()) return vacantRooms;
    const q = roomSearch.toLowerCase();
    return vacantRooms.filter(
      (r) =>
        r.room_num.toLowerCase().includes(q) ||
        r.designation.toLowerCase().includes(q),
    );
  }, [vacantRooms, roomSearch]);

  const getCatName = (cat: number) =>
    catrooms.find((c) => c.code === cat)?.name ?? "";

  const getErrorMessage = (field: string): string => {
    const fieldError = errors.errors.find((e) => e.field === field);
    return fieldError ? t(fieldError.message as any) : "";
  };

  /* ── Auto-calc ── */
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
    setForm((prev) => {
      const updated = calc({ ...prev, [field]: value });
      // Validate in real-time
      const validationResult = validateCheckInWalkIn(updated);
      setErrors(validationResult);
      return updated;
    });
  };

  /* ── Select room from grid ── */
  const handleSelectRoom = (roomNum: string) => {
    const room = rooms.find((r) => r.room_num === roomNum);
    if (!room) return;
    setSelectedRoomNum(roomNum);
    setLocalPuv(room.price_1);
    setForm((prev) =>
      calc({
        ...prev,
        room_num: roomNum,
        puv: room.price_1,
        current_mon: "RWF",
      }),
    );
  };

  /* ── Register & Check-in ── */
  const canSubmit =
    form.guest_name.trim() &&
    form.id_card.trim() &&
    form.room_num &&
    form.arrival_date &&
    form.depart_date;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setConfirmSubmitOpen(true);
  };

  const confirmSubmit = async () => {
    if (!canSubmit) return;

    // Validate form data before submitting
    const validationResult = validateCheckInWalkIn(form);
    setErrors(validationResult);

    if (!validationResult.isValid) {
      setErrorMsg(createErrorNotification(validationResult.errors, t));
      setConfirmSubmitOpen(false);
      return;
    }

    try {
      const response = await frontOfficeApi.walkin(form);
      setReservations((prev) => [...prev, response.reservation]);
      setRooms((prev) =>
        prev.map((room) => (room.id === response.room.id ? response.room : room)),
      );
      setSuccessMsg(
        `${form.guest_name} has been checked in to room ${form.room_num} successfully.`,
      );
    } catch (error) {
      setErrorMsg(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : t("loginError"),
      );
      setConfirmSubmitOpen(false);
      return;
    }

    setForm({ ...blank });
    setSelectedRoomNum(null);
    setConfirmSubmitOpen(false);
  };

  /* ── Calc nights ── */
  const calcNights = (arr: string, dep: string) => {
    if (!arr || !dep) return 0;
    return Math.max(
      Math.round(
        (new Date(dep).getTime() - new Date(arr).getTime()) / 86400000,
      ),
      0,
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white border border-hotel-border rounded p-4">
        <h1 className="text-2xl font-bold text-hotel-text-primary">
          {t("checkInWithoutReservation")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* ── Left: Quick Registration Form ── */}
        <div className="lg:col-span-2 bg-white border border-hotel-border rounded p-4 space-y-3">
          <h2 className="text-base font-semibold text-hotel-text-primary mb-3 flex items-center gap-2">
            <UserPlus size={20} className="text-hotel-gold" />
            {t("quickRegistration")}
          </h2>

          {/* Guest info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(
              [
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
                  true,
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
                      value={String(form[field] ?? "")}
                      onChange={(e) => handleChange(field, e.target.value)}
                      required={required}
                      title={label}
                      className={`w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-hotel-gold outline-none ${
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
                  ? getPhoneCodeByNationality(form.nationality)
                  : undefined;

              return (
                <div key={field}>
                  <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                    {label}{" "}
                    {required && <span className="text-hotel-danger">*</span>}
                  </label>
                  {field === "phone" && phoneCode ? (
                    <div className="flex items-center gap-1">
                      <span className="bg-white border border-hotel-border rounded-l px-3 py-2 text-xs font-semibold text-hotel-text-secondary">
                        {phoneCode}
                      </span>
                      <input
                        type={type}
                        title={label}
                        placeholder="788 123 456"
                        value={String(form[field] ?? "")}
                        required={required}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className={`flex-1 border rounded-r px-3 py-2 text-sm focus:ring-1 focus:ring-hotel-gold outline-none ${
                          errorMsg
                            ? "border-hotel-danger"
                            : "border-hotel-border"
                        }`}
                      />
                    </div>
                  ) : (
                    <input
                      type={type}
                      title={label}
                      value={type === "number" && form[field] === 0 ? "" : String(form[field] ?? "")}
                      required={required}
                      onChange={(e) => handleChange(field, e.target.value)}
                      {...attrs}
                      className={`w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-hotel-gold outline-none ${
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
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("adults")} <span className="text-hotel-danger">*</span>
              </label>
              <input
                type="number"
                title="Number of adults"
                value={form.adulte}
                required
                onChange={(e) => handleChange("adulte", Number(e.target.value))}
                min={1}
                className={`w-full border rounded px-3 py-2 text-sm ${
                  getErrorMessage("adulte")
                    ? "border-hotel-danger"
                    : "border-hotel-border"
                }`}
              />
              {getErrorMessage("adulte") && (
                <p className="text-xs text-hotel-danger mt-1">
                  {getErrorMessage("adulte")}
                </p>
              )}
            </div>
          </div>

          {/* Dates & payment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("arrivalDate")} <span className="text-hotel-danger">*</span>
              </label>
              <input
                type="date"
                title="Arrival date"
                value={form.arrival_date}
                required
                onChange={(e) => handleChange("arrival_date", e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm ${
                  getErrorMessage("arrival_date")
                    ? "border-hotel-danger"
                    : "border-hotel-border"
                }`}
              />
              {getErrorMessage("arrival_date") && (
                <p className="text-xs text-hotel-danger mt-1">
                  {getErrorMessage("arrival_date")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("departDate")} <span className="text-hotel-danger">*</span>
              </label>
              <input
                type="date"
                title="Departure date"
                value={form.depart_date}
                required
                onChange={(e) => handleChange("depart_date", e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm ${
                  getErrorMessage("depart_date")
                    ? "border-hotel-danger"
                    : "border-hotel-border"
                }`}
              />
              {getErrorMessage("depart_date") && (
                <p className="text-xs text-hotel-danger mt-1">
                  {getErrorMessage("depart_date")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("paymentMode")}
              </label>
              <select
                title="Payment mode"
                value={form.payt_mode}
                onChange={(e) => handleChange("payt_mode", e.target.value)}
                className="w-full border border-hotel-border rounded px-3 py-2 text-sm"
              >
                {paymentModes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("discount")} (%)
              </label>
              <input
                type="number"
                title="Discount percentage"
                value={form.discount}
                min={0}
                max={100}
                onChange={(e) =>
                  handleChange("discount", Number(e.target.value))
                }
                className={`w-full border rounded px-3 py-2 text-sm ${
                  getErrorMessage("discount")
                    ? "border-hotel-danger"
                    : "border-hotel-border"
                }`}
              />
              {getErrorMessage("discount") && (
                <p className="text-xs text-hotel-danger mt-1">
                  {getErrorMessage("discount")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("deposit")}
              </label>
              <input
                type="number"
                title="Deposit amount"
                value={form.deposit}
                min={0}
                onChange={(e) =>
                  handleChange("deposit", Number(e.target.value))
                }
                className={`w-full border rounded px-3 py-2 text-sm ${
                  getErrorMessage("deposit")
                    ? "border-hotel-danger"
                    : "border-hotel-border"
                }`}
              />
              {getErrorMessage("deposit") && (
                <p className="text-xs text-hotel-danger mt-1">
                  {getErrorMessage("deposit")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                {t("stayCost")}
              </label>
              <div className="w-full border border-hotel-border rounded px-3 py-2 text-sm bg-white font-semibold">
                {form.stay_cost.toLocaleString()} {form.current_mon}
              </div>
            </div>
          </div>

          {/* Currency dropdown */}
          <div>
            <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
              {t("currency")}
            </label>
            <select
              value={form.current_mon || "RWF"}
              onChange={(e) => {
                const code = e.target.value;
                if (code === "RWF") {
                  if (localPuv > 0) {
                    handleChange("puv", localPuv);
                  }
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
              className="w-full border rounded px-3 py-2 text-sm border-hotel-border"
            >
              {currencyOptions.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.label} {c.code !== "RWF" ? `(1 = ${c.exchange_rate.toLocaleString()} RWF)` : "(local)"}
                </option>
              ))}
            </select>
          </div>

          {/* Selected room summary */}
          {selectedRoomNum && (
            <div className="bg-white border border-hotel-border rounded p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-hotel-gold">
                  {t("assignedRoom")}
                </span>
                <p className="font-bold text-hotel-text-primary">
                  {form.room_num} —{" "}
                  {rooms.find((r) => r.room_num === form.room_num)?.designation}
                </p>
                <span className="text-xs text-hotel-text-secondary">
                  {form.puv.toLocaleString()} {form.current_mon} / {t("nights")}
                </span>
              </div>
              <Check size={24} className="text-hotel-gold" />
            </div>
          )}

          {/* Submit */}
          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`w-full py-2 rounded font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
              canSubmit
                ? "bg-hotel-gold text-white hover:bg-hotel-gold-dark"
                : "bg-white border border-hotel-border text-hotel-text-secondary cursor-not-allowed"
            }`}
          >
            <UserPlus size={18} />
            {t("registerAndCheckIn")}
          </button>
        </div>

        {/* ── Right: Available Rooms Grid ── */}
        <div className="bg-white border border-hotel-border rounded p-4">
          <h3 className="font-semibold text-hotel-text-primary mb-3 flex items-center gap-2">
            {t("availableRooms")} ({filteredRooms.length}/{vacantRooms.length})
          </h3>
          <input
            type="text"
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
            placeholder={`${t("search")} ${t("room")}...`}
            title={`${t("search")} ${t("room")}...`}
            className="w-full border border-hotel-border rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-hotel-gold"
          />
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-hotel-text-secondary text-sm">
                No rooms match "{roomSearch}"
              </div>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.room_num}
                  onClick={() => handleSelectRoom(room.room_num)}
                  className={`border rounded px-3 py-2 cursor-pointer transition-colors ${
                    selectedRoomNum === room.room_num
                      ? "border-hotel-gold bg-white"
                      : "hover:bg-hotel-cream border-hotel-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-hotel-text-primary">{room.room_num}</p>
                      <p className="text-xs text-hotel-text-secondary">
                        {getCatName(room.categorie)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-hotel-text-primary">
                        {room.price_1.toLocaleString()}
                      </p>
                      <p className="text-xs text-hotel-text-secondary">
                        {room.current_mon}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-hotel-text-secondary mt-1">
                    {room.designation}
                  </p>
                </div>
              ))
            )}
            {vacantRooms.length === 0 && (
              <p className="text-sm text-hotel-text-secondary text-center py-8">
                {t("noResults")}
              </p>
            )}
          </div>
        </div>
      </div>


      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmSubmitOpen}
        title="Check-In Walk-In Guest"
        message={`Are you sure you want to check in ${form.guest_name} to room ${form.room_num}?`}
        confirmText="Check In"
        cancelText="Cancel"
        isDangerous={false}
        onConfirm={confirmSubmit}
        onCancel={() => setConfirmSubmitOpen(false)}
      />

      {/* Success Confirmation Dialog */}
      {successMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 w-full max-w-md text-center space-y-4 border border-hotel-border">
            <CheckCircle2 size={40} className="text-hotel-gold mx-auto" />
            <h3 className="text-base font-semibold text-hotel-text-primary">Check-In Complete</h3>
            <p className="text-sm text-hotel-text-secondary">{successMsg}</p>
            <button
              onClick={() => setSuccessMsg("")}
              className="bg-hotel-gold text-white px-6 py-2 rounded text-sm hover:bg-hotel-gold-dark"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      {errorMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 w-full max-w-md text-center space-y-4 border border-hotel-border">
            <AlertTriangle size={40} className="text-hotel-danger mx-auto" />
            <h3 className="text-base font-semibold text-hotel-text-primary">Error</h3>
            <p className="text-sm text-hotel-text-secondary whitespace-pre-wrap">{errorMsg}</p>
            <button
              onClick={() => setErrorMsg("")}
              className="bg-hotel-danger text-white px-6 py-2 rounded text-sm hover:opacity-90"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
