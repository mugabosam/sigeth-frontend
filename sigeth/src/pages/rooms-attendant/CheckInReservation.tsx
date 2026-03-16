import { useState, useMemo, useRef } from "react";
import {
  Search,
  UserCheck,
  CreditCard,
  Printer,
  X,
  ShieldCheck,
  ArrowRightLeft,
  CalendarDays,
  Wifi,
} from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { useNotification } from "../../hooks/useNotification";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { validateCheckIn } from "../../utils/roomsAttendantValidation";
import { createErrorNotification } from "../../utils/errorFormatter";
import type { RCS } from "../../types";

/* ── helper: format today as YYYY-MM-DD ── */
const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

export default function CheckInReservation() {
  const { t } = useLang();
  const { reservations, setReservations, rooms, setRooms, catrooms } =
    useHotelData();
  const { addNotification } = useNotification();

  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState<RCS | null>(null);
  const [idVerified, setIdVerified] = useState(false);
  const [swapRoom, setSwapRoom] = useState<string | null>(null);
  const [keyCardGuest, setKeyCardGuest] = useState<RCS | null>(null);
  const [confirmCheckInOpen, setConfirmCheckInOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  /* Today's arrivals = open reservations arriving today or earlier (not yet checked in) */
  const arrivals = useMemo(() => {
    const td = today();
    return reservations.filter(
      (r) =>
        r.status === 0 &&
        !r.code_p && // skip group members — handled in group check-in
        r.arrival_date <= td,
    );
  }, [reservations]);

  /* Upcoming (arriving after today, still open and not group) */
  const upcoming = useMemo(() => {
    const td = today();
    return reservations.filter(
      (r) => r.status === 0 && !r.code_p && r.arrival_date > td,
    );
  }, [reservations]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const filter = (list: RCS[]) =>
      list.filter(
        (r) =>
          r.guest_name.toLowerCase().includes(q) ||
          r.room_num.includes(q) ||
          r.id_card.toLowerCase().includes(q),
      );
    return { arrivals: filter(arrivals), upcoming: filter(upcoming) };
  }, [arrivals, upcoming, search]);

  /* Available rooms for swap */
  const vacantRooms = useMemo(
    () => rooms.filter((r) => r.status === "VC"),
    [rooms],
  );

  const getCatName = (cat: number) =>
    catrooms.find((c) => c.code === cat)?.name ?? "";

  /* ── Check-in handler ── */
  const handleCheckIn = (res: RCS) => {
    setProcessing(res);
    setConfirmCheckInOpen(true);
  };

  const confirmCheckIn = () => {
    if (!processing) return;

    // Validate reservation data before check-in
    const validationResult = validateCheckIn(processing);
    if (!validationResult.isValid) {
      addNotification(
        createErrorNotification(validationResult.errors, t),
        "Validation Error",
        "error",
      );
      setConfirmCheckInOpen(false);
      return;
    }

    const res = processing;
    const targetRoom = swapRoom ?? res.room_num;

    // Update RCS: close reservation, set room_num if swapped
    setReservations((prev) =>
      prev.map((r) =>
        r.room_num === res.room_num && r.guest_name === res.guest_name
          ? { ...r, room_num: targetRoom, status: 1 }
          : r,
      ),
    );

    // Update RDF: set target room to OCC
    setRooms((prev) =>
      prev.map((room) => {
        if (room.room_num === targetRoom) {
          return {
            ...room,
            guest_name: res.guest_name,
            arrival_date: res.arrival_date,
            depart_date: res.depart_date,
            puv: res.puv,
            status: "OCC" as const,
          };
        }
        // If swapping, clear old room back to VC
        if (swapRoom && room.room_num === res.room_num) {
          return {
            ...room,
            guest_name: "",
            arrival_date: "",
            depart_date: "",
            puv: room.price_1,
            status: "VC" as const,
          };
        }
        return room;
      }),
    );

    const checkedInRes = { ...res, room_num: targetRoom, status: 1 as const };
    setKeyCardGuest(checkedInRes);
    setProcessing(null);
    setIdVerified(false);
    setSwapRoom(null);
    setConfirmCheckInOpen(false);

    // Trigger notification
    addNotification(
      `Reservation for ${res.guest_name} (Room ${targetRoom}) checked in`,
      "Rooms Attendant",
      "success",
    );
  };

  /* ── Stay nights calc ── */
  const calcNights = (arr: string, dep: string) => {
    if (!arr || !dep) return 0;
    return Math.max(
      Math.round(
        (new Date(dep).getTime() - new Date(arr).getTime()) / 86400000,
      ),
      0,
    );
  };

  /* ── Print key card slip ── */
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

  /* ── Arrival card row ── */
  const ArrivalRow = ({
    res,
    isUpcoming,
  }: {
    res: RCS;
    isUpcoming?: boolean;
  }) => {
    const room = rooms.find((r) => r.room_num === res.room_num);
    const nights = calcNights(res.arrival_date, res.depart_date);

    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {res.guest_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">
                  {res.guest_name}
                </h3>
                <p className="text-xs text-gray-500">
                  {res.nationality} — {res.id_card}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-gray-500 text-xs">{t("roomNumber")}</span>
                <p className="font-semibold text-gray-900">{res.room_num}</p>
                {room && (
                  <span className="text-gray-500 text-xs">
                    {getCatName(room.categorie)}
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-500 text-xs">
                  {t("arrivalDate")}
                </span>
                <p className="font-semibold text-gray-900">
                  {res.arrival_date}
                </p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">{t("departDate")}</span>
                <p className="font-semibold text-gray-900">{res.depart_date}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">{t("nights")}</span>
                <p className="font-semibold text-gray-900">{nights}</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-800">
                {res.stay_cost.toLocaleString()}{" "}
                <span className="text-gray-600 font-normal">
                  {res.current_mon}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setProcessing(res);
              setIdVerified(false);
              setSwapRoom(null);
            }}
            className={`ml-4 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all transform hover:scale-105 shrink-0 ${
              isUpcoming
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
            }`}
          >
            <UserCheck size={16} />
            {t("checkIn")}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t("checkInWithReservation")}
        </h1>
      </div>

      {/* ── Search bar ── */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          {t("search")}
        </h3>
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t("search")} ${t("guestName")}, ${t("roomNumber")}, ${t("idCard")}...`}
            title={`${t("search")} ${t("guestName")}, ${t("roomNumber")}, ${t("idCard")}...`}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* ── Today's arrivals ── */}
      <div>
        <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <CalendarDays size={20} className="text-green-600" />
          <div className="flex-1">
            <h2 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {t("todaysArrivals")}
            </h2>
          </div>
          <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">
            {filtered.arrivals.length}
          </span>
        </div>
        {filtered.arrivals.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">
            {t("noArrivalsToday")}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.arrivals.map((r, i) => (
              <ArrivalRow key={`arr-${i}`} res={r} />
            ))}
          </div>
        )}
      </div>

      {/* ── Upcoming arrivals ── */}
      {filtered.upcoming.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
            <CalendarDays size={20} className="text-amber-600" />
            <div className="flex-1">
              <h2 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {t("expectedArrivals")}
              </h2>
            </div>
            <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">
              {filtered.upcoming.length}
            </span>
          </div>
          <div className="space-y-3">
            {filtered.upcoming.map((r, i) => (
              <ArrivalRow key={`up-${i}`} res={r} isUpcoming />
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          CHECK-IN PROCESSING MODAL
         ════════════════════════════════════════════ */}
      {processing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-amber-50 to-white">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <UserCheck size={20} className="text-amber-600" />
                {t("processCheckIn")}
              </h2>
              <button
                onClick={() => {
                  setProcessing(null);
                  setIdVerified(false);
                  setSwapRoom(null);
                }}
                title="Close check-in modal"
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Guest details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <ShieldCheck size={14} />
                  {t("guestDetails")}
                </h3>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4">
                  {[
                    [t("guestName"), processing.guest_name],
                    [t("idDocument"), processing.id_card],
                    [t("nationality"), processing.nationality],
                    [t("phone"), processing.phone],
                    [t("email"), processing.email],
                    [t("city"), `${processing.city}, ${processing.country}`],
                    [t("adults"), `${processing.adulte}`],
                    [
                      t("children"),
                      `${processing.children}${processing.children > 0 ? ` (${t("age")}: ${processing.age})` : ""}`,
                    ],
                  ].map(([label, val]) => (
                    <div key={label} className="text-sm">
                      <span className="text-gray-400 text-xs">{label}</span>
                      <p className="font-medium text-gray-700">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ID Verification */}
              <label className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={idVerified}
                  onChange={(e) => setIdVerified(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-600"
                />
                <div>
                  <span className="font-semibold text-blue-800 text-sm">
                    {t("verifyIdentity")}
                  </span>
                  <p className="text-xs text-blue-600">
                    {t("idDocument")}: {processing.id_card}
                  </p>
                </div>
                {idVerified && (
                  <ShieldCheck size={20} className="ml-auto text-green-600" />
                )}
              </label>

              {/* Room assignment */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <ArrowRightLeft size={14} />
                  {t("roomAssignment")}
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <span className="text-xs text-amber-600">
                      {t("assignedRoom")}
                    </span>
                    <p className="font-bold text-lg text-amber-800">
                      {processing.room_num}
                    </p>
                    <span className="text-xs text-gray-500">
                      {getCatName(
                        rooms.find((r) => r.room_num === processing.room_num)
                          ?.categorie ?? 0,
                      )}
                    </span>
                  </div>
                  {swapRoom && (
                    <>
                      <ArrowRightLeft
                        size={20}
                        className="text-amber-500 shrink-0"
                      />
                      <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                        <span className="text-xs text-green-600">
                          {t("swapRoomTo")}
                        </span>
                        <p className="font-bold text-lg text-green-800">
                          {swapRoom}
                        </p>
                        <span className="text-xs text-gray-500">
                          {getCatName(
                            rooms.find((r) => r.room_num === swapRoom)
                              ?.categorie ?? 0,
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {/* Swap room picker */}
                {vacantRooms.length > 0 && (
                  <div className="mt-3">
                    <select
                      title="Select a room to swap"
                      value={swapRoom ?? ""}
                      onChange={(e) => setSwapRoom(e.target.value || null)}
                      className="border rounded-lg px-3 py-2 text-sm w-full"
                    >
                      <option value="">
                        — {t("swapRoom")} ({t("availableRooms")}) —
                      </option>
                      {vacantRooms.map((r) => (
                        <option key={r.room_num} value={r.room_num}>
                          {r.room_num} — {r.designation} (
                          {r.price_1.toLocaleString()} {r.current_mon})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Stay summary */}
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-3 gap-3 text-sm text-center">
                <div>
                  <span className="text-gray-400 text-xs block">
                    {t("nights")}
                  </span>
                  <strong className="text-lg text-gray-800">
                    {calcNights(
                      processing.arrival_date,
                      processing.depart_date,
                    )}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">
                    {t("stayCost")}
                  </span>
                  <strong className="text-lg text-gray-800">
                    {processing.stay_cost.toLocaleString()}{" "}
                    {processing.current_mon}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">
                    {t("deposit")}
                  </span>
                  <strong className="text-lg text-gray-800">
                    {processing.deposit.toLocaleString()}{" "}
                    {processing.current_mon}
                  </strong>
                </div>
              </div>

              {/* Action */}
              <button
                disabled={!idVerified}
                onClick={() => handleCheckIn(processing)}
                className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                  idVerified
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <UserCheck size={18} />
                {t("confirmAndCheckIn")}
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Printable slip content */}
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
        isOpen={confirmCheckInOpen}
        title="Check-In Reservation"
        message={`Are you sure you want to check in ${processing?.guest_name} to room ${swapRoom ?? processing?.room_num}?`}
        confirmText="Check In"
        cancelText="Cancel"
        isDangerous={false}
        onConfirm={confirmCheckIn}
        onCancel={() => setConfirmCheckInOpen(false)}
      />
    </div>
  );
}
