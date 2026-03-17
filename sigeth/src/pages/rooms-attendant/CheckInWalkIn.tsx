import { useState, useMemo, useRef } from "react";
import { UserPlus, CreditCard, Printer, X, Wifi, Check } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { useNotification } from "../../hooks/useNotification";
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
  const { setReservations, rooms, setRooms, paymentModes, catrooms } =
    useHotelData();
  const { addNotification } = useNotification();
  const printRef = useRef<HTMLDivElement>(null);

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
    payt_mode: paymentModes[0]?.code ?? "",
    airport_time: "",
    discount: 0,
    stay_cost: 0,
    deposit: 0,
    status: 0,
  };

  const [form, setForm] = useState<RCS>({ ...blank });
  const [keyCardGuest, setKeyCardGuest] = useState<RCS | null>(null);
  const [selectedRoomNum, setSelectedRoomNum] = useState<string | null>(null);
  const [roomSearch, setRoomSearch] = useState("");
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationResult>({
    isValid: true,
    errors: [],
  });

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
    setForm((prev) =>
      calc({
        ...prev,
        room_num: roomNum,
        puv: room.price_1,
        current_mon: room.current_mon,
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
      addNotification(
        createErrorNotification(validationResult.errors, t),
        "Validation Error",
        "error",
      );
      return;
    }

    let newRes: RCS;
    try {
      const response = await frontOfficeApi.walkin(form);
      newRes = response.reservation;
      setReservations((prev) => [...prev, response.reservation]);
      setRooms((prev) =>
        prev.map((room) => (room.id === response.room.id ? response.room : room)),
      );
    } catch (error) {
      addNotification(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : t("loginError"),
        "Rooms Attendant",
        "error",
      );
      return;
    }

    // Trigger notification
    addNotification(
      `Guest ${form.guest_name} checked in to room ${form.room_num}`,
      "Rooms Attendant",
      "success",
    );

    setKeyCardGuest(newRes);
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

  /* ── Print ── */
  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    w.document.write(`
      <html><head><title>${t("keyCardSlip")}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:20px;max-width:350px;margin:0 auto}
        .header{text-align:center;border-bottom:2px solid #333;padding-bottom:12px;margin-bottom:16px}
        .header h1{font-size:18px;margin:0} .header p{color:#666;margin:4px 0;font-size:12px}
        .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dotted #ccc;font-size:13px}
        .label{color:#666} .value{font-weight:bold}
        .footer{text-align:center;margin-top:20px;padding-top:12px;border-top:2px solid #333;font-size:11px;color:#666}
        .wifi{background:#f5f5f5;padding:10px;border-radius:6px;text-align:center;margin-top:12px}
        .wifi .code{font-size:20px;font-weight:bold;letter-spacing:2px;color:#333}
      </style></head><body>${printRef.current.innerHTML}</body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t("checkInWithoutReservation")}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Quick Registration Form ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
            <UserPlus size={20} className="text-blue-600" />
            {t("quickRegistration")}
          </h2>

          {/* Guest info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {label}{" "}
                      {required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={String(form[field] ?? "")}
                      onChange={(e) => handleChange(field, e.target.value)}
                      required={required}
                      title={label}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none ${
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
                  ? getPhoneCodeByNationality(form.nationality)
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
                        title={label}
                        placeholder="788 123 456"
                        value={String(form[field] ?? "")}
                        required={required}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className={`flex-1 border rounded-r-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none ${
                          errorMsg
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300"
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
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none ${
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
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("adults")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                title="Number of adults"
                value={form.adulte}
                required
                onChange={(e) => handleChange("adulte", Number(e.target.value))}
                min={1}
                className={`w-full border rounded-lg px-3 py-2 text-sm ${
                  getErrorMessage("adulte")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {getErrorMessage("adulte") && (
                <p className="text-xs text-red-600 mt-1">
                  {getErrorMessage("adulte")}
                </p>
              )}
            </div>
          </div>

          {/* Dates & payment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("arrivalDate")} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                title="Arrival date"
                value={form.arrival_date}
                required
                onChange={(e) => handleChange("arrival_date", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm ${
                  getErrorMessage("arrival_date")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {getErrorMessage("arrival_date") && (
                <p className="text-xs text-red-600 mt-1">
                  {getErrorMessage("arrival_date")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("departDate")} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                title="Departure date"
                value={form.depart_date}
                required
                onChange={(e) => handleChange("depart_date", e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm ${
                  getErrorMessage("depart_date")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {getErrorMessage("depart_date") && (
                <p className="text-xs text-red-600 mt-1">
                  {getErrorMessage("depart_date")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("paymentMode")}
              </label>
              <select
                title="Payment mode"
                value={form.payt_mode}
                onChange={(e) => handleChange("payt_mode", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {paymentModes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
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
                className={`w-full border rounded-lg px-3 py-2 text-sm ${
                  getErrorMessage("discount")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {getErrorMessage("discount") && (
                <p className="text-xs text-red-600 mt-1">
                  {getErrorMessage("discount")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
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
                className={`w-full border rounded-lg px-3 py-2 text-sm ${
                  getErrorMessage("deposit")
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {getErrorMessage("deposit") && (
                <p className="text-xs text-red-600 mt-1">
                  {getErrorMessage("deposit")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                {t("stayCost")}
              </label>
              <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 font-semibold">
                {form.stay_cost.toLocaleString()} {form.current_mon}
              </div>
            </div>
          </div>

          {/* Selected room summary */}
          {selectedRoomNum && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-600">
                  {t("assignedRoom")}
                </span>
                <p className="font-bold text-emerald-800">
                  {form.room_num} —{" "}
                  {rooms.find((r) => r.room_num === form.room_num)?.designation}
                </p>
                <span className="text-xs text-gray-500">
                  {form.puv.toLocaleString()} {form.current_mon} / {t("nights")}
                </span>
              </div>
              <Check size={24} className="text-emerald-500" />
            </div>
          )}

          {/* Submit */}
          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
              canSubmit
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <UserPlus size={18} />
            {t("registerAndCheckIn")}
          </button>
        </div>

        {/* ── Right: Available Rooms Grid ── */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
            {t("availableRooms")} ({filteredRooms.length}/{vacantRooms.length})
          </h3>
          <input
            type="text"
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
            placeholder={`${t("search")} ${t("room")}...`}
            title={`${t("search")} ${t("room")}...`}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No rooms match "{roomSearch}"
              </div>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.room_num}
                  onClick={() => handleSelectRoom(room.room_num)}
                  className={`border rounded-lg px-4 py-3 cursor-pointer transition-all ${
                    selectedRoomNum === room.room_num
                      ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200"
                      : "hover:border-amber-300 hover:bg-amber-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{room.room_num}</p>
                      <p className="text-xs text-gray-500">
                        {getCatName(room.categorie)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">
                        {room.price_1.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {room.current_mon}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {room.designation}
                  </p>
                </div>
              ))
            )}
            {vacantRooms.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                {t("noResults")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          KEY CARD SLIP MODAL
         ════════════════════════════════════════════ */}
      {keyCardGuest && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CreditCard size={20} className="text-amber-600" />
                {t("keyCardSlip")}
              </h2>
              <button
                onClick={() => setKeyCardGuest(null)}
                title="Close key card slip"
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div ref={printRef} className="p-6">
              <div className="text-center border-b-2 border-gray-800 pb-3 mb-4">
                <h1 className="text-xl font-bold">{t("hotelFullName")}</h1>
                <p className="text-xs text-gray-500">{t("keyCardSlip")}</p>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  [t("guestName"), keyCardGuest.guest_name],
                  [t("roomNumber"), keyCardGuest.room_num],
                  [t("checkInDate"), keyCardGuest.arrival_date],
                  [t("checkOutDate"), keyCardGuest.depart_date],
                  [
                    t("nights"),
                    String(
                      calcNights(
                        keyCardGuest.arrival_date,
                        keyCardGuest.depart_date,
                      ),
                    ),
                  ],
                  [t("paymentMode"), keyCardGuest.payt_mode],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    className="flex justify-between py-1.5 border-b border-dotted border-gray-300"
                  >
                    <span className="text-gray-500">{label}</span>
                    <strong>{val}</strong>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-gray-50 rounded-lg p-3 text-center">
                <Wifi size={18} className="mx-auto text-gray-600 mb-1" />
                <p className="text-xs text-gray-500">{t("wifiCode")}</p>
                <p className="text-xl font-bold tracking-widest text-gray-800">
                  SIGETH2026
                </p>
              </div>
              <div className="text-center mt-4 pt-3 border-t-2 border-gray-800">
                <p className="text-xs text-gray-500">
                  {t("keyCardInstructions")}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t("welcomeMessage")}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-600"
              >
                <Printer size={16} />
                {t("printKeyCard")}
              </button>
              <button
                onClick={() => setKeyCardGuest(null)}
                className="px-6 py-2.5 border rounded-lg text-sm"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
