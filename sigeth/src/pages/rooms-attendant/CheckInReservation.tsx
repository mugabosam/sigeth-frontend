import { useState, useMemo } from "react";
import {
  Search,
  UserCheck,
  X,
  ShieldCheck,
  ArrowRightLeft,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { validateCheckIn } from "../../utils/roomsAttendantValidation";
import { createErrorNotification } from "../../utils/errorFormatter";
import type { RCS } from "../../types";
import { frontOfficeApi } from "../../services/sigethApi";

/* ── helper: format today as YYYY-MM-DD ── */
const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

export default function CheckInReservation() {
  const { t } = useLang();
  const {
    reservations,
    setReservations,
    rooms,
    setRooms,
    catrooms,
    currencies,
  } = useHotelData();

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState<RCS | null>(null);
  const [idVerified, setIdVerified] = useState(false);
  const [swapRoom, setSwapRoom] = useState<string | null>(null);
  const [confirmCheckInOpen, setConfirmCheckInOpen] = useState(false);
  const [checkedInMap, setCheckedInMap] = useState<Map<string, RCS>>(new Map());
  const [localPuv, setLocalPuv] = useState(0);

  const currencyOptions = useMemo(
    () => [
      { code: "RWF", label: "Rwandan Franc", exchange_rate: 1 },
      ...currencies,
    ],
    [currencies],
  );

  /* Today's arrivals = open reservations arriving today or earlier (not yet checked in)
     + recently checked-in guests kept visible via checkedInMap */
  const arrivals = useMemo(() => {
    const td = today();
    const active = reservations.filter(
      (r) => r.status === 0 && !r.code_p && r.arrival_date <= td,
    );
    const activeIds = new Set(active.map((r) => r.id));
    const recentCheckedIn = [...checkedInMap.values()].filter(
      (r) => !activeIds.has(r.id) && !r.code_p && r.arrival_date <= td,
    );
    return [...active, ...recentCheckedIn];
  }, [reservations, checkedInMap]);

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

  const confirmCheckIn = async () => {
    if (!processing) return;

    // Validate reservation data before check-in
    const validationResult = validateCheckIn(processing);
    if (!validationResult.isValid) {
      setErrorMsg(createErrorNotification(validationResult.errors, t));
      setConfirmCheckInOpen(false);
      return;
    }

    const res = processing;
    const targetRoom = swapRoom ?? res.room_num;

    try {
      if (swapRoom && swapRoom !== res.room_num) {
        const moved = await frontOfficeApi.moveGuest({
          old_room_num: res.room_num,
          new_room_num: swapRoom,
        });
        setRooms((prev) =>
          prev.map((room) => {
            if (room.id === moved.old_room.id) return moved.old_room;
            if (room.id === moved.new_room.id) return moved.new_room;
            return room;
          }),
        );
      }

      const response = await frontOfficeApi.checkin({
        room_num: targetRoom,
        guest_name: res.guest_name,
        current_mon: processing.current_mon,
        puv: processing.puv,
      });

      setReservations((prev) =>
        prev.map((r) =>
          r.id === response.reservation.id ? response.reservation : r,
        ),
      );
      setRooms((prev) =>
        prev.map((room) =>
          room.id === response.room.id ? response.room : room,
        ),
      );

      setCheckedInMap((prev) => {
        const next = new Map(prev);
        next.set(response.reservation.id!, response.reservation);
        return next;
      });

      setSuccessMsg(
        `${res.guest_name} has been checked in to room ${targetRoom} successfully.`,
      );
    } catch (error) {
      setErrorMsg(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : t("loginError"),
      );
      setConfirmCheckInOpen(false);
      return;
    }

    setProcessing(null);
    setIdVerified(false);
    setSwapRoom(null);
    setConfirmCheckInOpen(false);
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
    const isCheckedIn = checkedInMap.has(res.id!) || room?.status === "OCC";

    return (
      <div className="bg-white rounded p-4 border-b border-gray-200 hover:bg-gray-100 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-hotel-navy flex items-center justify-center text-hotel-cream font-bold text-xs">
                {res.guest_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <h3 className="font-semibold text-hotel-text-primary text-sm">
                  {res.guest_name}
                </h3>
                <p className="text-xs text-hotel-text-secondary">
                  {res.nationality} — {res.id_card}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs mt-3">
              <div>
                <span className="text-hotel-text-secondary">
                  {t("roomNumber")}
                </span>
                <p className="font-semibold text-hotel-text-primary">
                  {res.room_num}
                </p>
                {room && (
                  <span className="text-hotel-text-secondary text-xs">
                    {getCatName(room.categorie)}
                  </span>
                )}
              </div>
              <div>
                <span className="text-hotel-text-secondary">
                  {t("arrivalDate")}
                </span>
                <p className="font-semibold text-hotel-text-primary">
                  {res.arrival_date}
                </p>
              </div>
              <div>
                <span className="text-hotel-text-secondary">
                  {t("departDate")}
                </span>
                <p className="font-semibold text-hotel-text-primary">
                  {res.depart_date}
                </p>
              </div>
              <div>
                <span className="text-hotel-text-secondary">{t("nights")}</span>
                <p className="font-semibold text-hotel-text-primary">
                  {nights}
                </p>
              </div>
              <div>
                <span className="text-hotel-text-secondary">{t("stayCost")}</span>
                <p className="font-semibold text-hotel-text-primary">
                  {res.stay_cost.toLocaleString()} {res.current_mon}
                </p>
              </div>
            </div>
          </div>
          {isCheckedIn ? (
            <div className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold bg-green-50 text-green-600 shrink-0 whitespace-nowrap">
              <CheckCircle2 size={16} />
              Checked In
            </div>
          ) : (
            <button
              onClick={() => {
                setProcessing(res);
                setLocalPuv(res.current_mon === "RWF" ? res.puv : 0);
                setIdVerified(false);
                setSwapRoom(null);
              }}
              className={`px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shrink-0 whitespace-nowrap ${
                isUpcoming
                  ? "bg-gray-100 text-hotel-text-secondary hover:bg-gray-200"
                  : "bg-hotel-gold text-white hover:bg-hotel-gold-dark"
              }`}
            >
              <UserCheck size={16} />
              {t("checkIn")}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* ── Search bar ── */}
      <div className="bg-white rounded p-4">
        <h3 className="text-sm font-semibold text-hotel-text-primary mb-3 uppercase tracking-wide">
          {t("search")}
        </h3>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-hotel-text-secondary"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t("search")} ${t("guestName")}, ${t("roomNumber")}, ${t("idCard")}...`}
            title={`${t("search")} ${t("guestName")}, ${t("roomNumber")}, ${t("idCard")}...`}
            className="w-full border border-gray-300 pl-10 pr-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
          />
        </div>
      </div>

      {/* ── Today's arrivals ── */}
      <div>
        <div className="flex items-center gap-3 mb-3 p-3">
          <CalendarDays size={18} className="text-hotel-text-secondary" />
          <h2 className="flex-1 text-base font-display font-semibold text-hotel-text-primary">
            {t("todaysArrivals")}
          </h2>
          <span className="bg-hotel-navy text-white text-xs font-semibold px-2 py-1 rounded">
            {filtered.arrivals.length}
          </span>
        </div>
        {filtered.arrivals.length === 0 ? (
          <div className="bg-hotel-cream rounded border border-dashed border-hotel-border p-6 text-center text-hotel-text-secondary text-xs">
            {t("noArrivalsToday")}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.arrivals.map((r, i) => (
              <ArrivalRow key={`arr-${i}`} res={r} />
            ))}
          </div>
        )}
      </div>

      {/* ── Upcoming arrivals ── */}
      {filtered.upcoming.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3 p-3">
            <CalendarDays size={18} className="text-hotel-text-secondary" />
            <h2 className="flex-1 text-base font-display font-semibold text-hotel-text-primary">
              {t("expectedArrivals")}
            </h2>
            <span className="bg-hotel-navy text-white text-xs font-semibold px-2 py-1 rounded">
              {filtered.upcoming.length}
            </span>
          </div>
          <div className="space-y-2">
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
          <div className="bg-white rounded w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-hotel-border">
              <h2 className="text-base font-display font-bold text-hotel-text-primary flex items-center gap-2">
                <UserCheck size={18} className="text-hotel-gold" />
                {t("processCheckIn")}
              </h2>
              <button
                onClick={() => {
                  setProcessing(null);
                  setIdVerified(false);
                  setSwapRoom(null);
                }}
                title="Close check-in modal"
                className="text-hotel-text-secondary hover:text-hotel-text-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Guest details */}
              <div>
                <h3 className="text-xs font-semibold text-hotel-text-secondary mb-2 flex items-center gap-2 uppercase tracking-wide">
                  <ShieldCheck size={14} />
                  {t("guestDetails")}
                </h3>
                <div className="grid grid-cols-2 gap-2 bg-hotel-cream rounded p-3">
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
                    <div key={label} className="text-xs">
                      <span className="text-hotel-text-secondary">{label}</span>
                      <p className="font-medium text-hotel-text-primary">
                        {val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ID Verification */}
              <label className="flex items-center gap-2 bg-hotel-cream rounded px-3 py-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={idVerified}
                  onChange={(e) => setIdVerified(e.target.checked)}
                  className="w-4 h-4 rounded accent-hotel-gold"
                />
                <div className="flex-1">
                  <span className="font-semibold text-hotel-text-primary text-xs">
                    {t("verifyIdentity")}
                  </span>
                  <p className="text-xs text-hotel-text-secondary">
                    {t("idDocument")}: {processing.id_card}
                  </p>
                </div>
                {idVerified && (
                  <ShieldCheck size={16} className="text-hotel-success" />
                )}
              </label>

              {/* Room assignment */}
              <div>
                <h3 className="text-xs font-semibold text-hotel-text-secondary mb-2 flex items-center gap-2 uppercase tracking-wide">
                  <ArrowRightLeft size={14} />
                  {t("roomAssignment")}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-hotel-cream rounded px-3 py-2">
                    <span className="text-xs text-hotel-text-secondary">
                      {t("assignedRoom")}
                    </span>
                    <p className="font-bold text-sm text-hotel-text-primary">
                      {processing.room_num}
                    </p>
                    <span className="text-xs text-hotel-text-secondary">
                      {getCatName(
                        rooms.find((r) => r.room_num === processing.room_num)
                          ?.categorie ?? 0,
                      )}
                    </span>
                  </div>
                  {swapRoom && (
                    <>
                      <ArrowRightLeft
                        size={16}
                        className="text-hotel-gold shrink-0"
                      />
                      <div className="flex-1 bg-hotel-cream rounded px-3 py-2">
                        <span className="text-xs text-hotel-success">
                          {t("swapRoomTo")}
                        </span>
                        <p className="font-bold text-sm text-hotel-text-primary">
                          {swapRoom}
                        </p>
                        <span className="text-xs text-hotel-text-secondary">
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
                  <div className="mt-2">
                    <select
                      title="Select a room to swap"
                      value={swapRoom ?? ""}
                      onChange={(e) => setSwapRoom(e.target.value || null)}
                      className="border border-hotel-border rounded px-3 py-2 text-xs w-full focus:outline-none focus:ring-1 focus:ring-hotel-gold"
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
              <div className="bg-hotel-cream rounded p-3 grid grid-cols-3 gap-2 text-xs text-center">
                <div>
                  <span className="text-hotel-text-secondary text-xs block">
                    {t("nights")}
                  </span>
                  <strong className="text-base text-hotel-text-primary">
                    {calcNights(
                      processing.arrival_date,
                      processing.depart_date,
                    )}
                  </strong>
                </div>
                <div>
                  <span className="text-hotel-text-secondary text-xs block">
                    {t("stayCost")}
                  </span>
                  <strong className="text-base text-hotel-text-primary">
                    {processing.stay_cost.toLocaleString()}{" "}
                    {processing.current_mon}
                  </strong>
                </div>
                <div>
                  <span className="text-hotel-text-secondary text-xs block">
                    {t("deposit")}
                  </span>
                  <strong className="text-base text-hotel-text-primary">
                    {processing.deposit.toLocaleString()}{" "}
                    {processing.current_mon}
                  </strong>
                </div>
              </div>

              {/* Currency dropdown */}
              <div>
                <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                  {t("currency")}
                </label>
                <select
                  value={processing.current_mon || "RWF"}
                  onChange={(e) => {
                    const code = e.target.value;
                    let puv = processing.puv;
                    let mon = processing.current_mon;
                    if (code === "RWF") {
                      if (localPuv > 0) puv = localPuv;
                      mon = "RWF";
                    } else if (
                      currencyOptions.find((c) => c.code === code)
                        ?.exchange_rate
                    ) {
                      const rate = currencyOptions.find(
                        (c) => c.code === code,
                      )!.exchange_rate;
                      if (localPuv > 0) {
                        puv = Math.round(localPuv / rate);
                      }
                      mon = code;
                    } else {
                      mon = code;
                    }
                    const updated = { ...processing, puv, current_mon: mon };
                    const arr = updated.arrival_date
                      ? new Date(updated.arrival_date)
                      : null;
                    const dep = updated.depart_date
                      ? new Date(updated.depart_date)
                      : null;
                    const qty =
                      arr && dep
                        ? Math.max(
                            Math.round(
                              (dep.getTime() - arr.getTime()) / 86400000,
                            ),
                            0,
                          )
                        : 0;
                    const base = qty * updated.puv;
                    updated.stay_cost =
                      updated.discount > 0
                        ? base * (1 - updated.discount / 100)
                        : base;
                    setProcessing(updated);
                  }}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
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

              {/* Action */}
              <button
                disabled={!idVerified}
                onClick={() => handleCheckIn(processing)}
                className={`w-full py-2 rounded font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  idVerified
                    ? "bg-hotel-gold text-white hover:bg-hotel-gold-dark"
                    : "bg-hotel-paper text-hotel-text-secondary cursor-not-allowed"
                }`}
              >
                <UserCheck size={16} />
                {t("confirmAndCheckIn")}
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

      {/* Success Confirmation Dialog */}
      {successMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 w-full max-w-md text-center space-y-3">
            <CheckCircle2 size={40} className="text-hotel-success mx-auto" />
            <h3 className="text-base font-display font-semibold text-hotel-text-primary">
              Check-In Complete
            </h3>
            <p className="text-xs text-hotel-text-secondary">{successMsg}</p>
            <button
              onClick={() => setSuccessMsg("")}
              className="bg-hotel-success text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      {errorMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 w-full max-w-md text-center space-y-3">
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


