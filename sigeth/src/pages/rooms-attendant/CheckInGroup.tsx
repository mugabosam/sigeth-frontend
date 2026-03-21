/* eslint-disable -- Inline styles necessary for dynamic width and progress calculations */
import { useState, useMemo } from "react";
import {
  Search,
  Users,
  UserCheck,
  X,
  CheckCircle2,
  ArrowRightLeft,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import type { RCS, GRC } from "../../types";
import { frontOfficeApi } from "../../services/sigethApi";

export default function CheckInGroup() {
  const { t } = useLang();
  const {
    groupReservations,
    reservations,
    setReservations,
    rooms,
    setRooms,
    catrooms,
    currencies,
  } = useHotelData();

  const [queryCode, setQueryCode] = useState("");
  const [queryGroup, setQueryGroup] = useState("");
  const [groupFound, setGroupFound] = useState<GRC | null>(null);
  const [processingMember, setProcessingMember] = useState<RCS | null>(null);
  const [swapRoom, setSwapRoom] = useState<string | null>(null);
  const [groupSuggestions, setGroupSuggestions] = useState<GRC[]>([]);
  const [showGroupSuggestions, setShowGroupSuggestions] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [localPuv, setLocalPuv] = useState(0);
  const [loadingMember, setLoadingMember] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const currencyOptions = useMemo(() => [
    { code: "RWF", label: "Rwandan Franc", exchange_rate: 1 },
    ...currencies,
  ], [currencies]);

  const getCatName = (cat: number) =>
    catrooms.find((c) => c.code === cat)?.name ?? "";

  /* ── Live group search ── */
  const handleGroupInputChange = (value: string, isCode: boolean) => {
    if (isCode) {
      setQueryCode(value);
    } else {
      setQueryGroup(value);
    }

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

  const handleSelectGroupFromSuggestions = (g: GRC) => {
    setGroupFound(g);
    setGroupSuggestions([]);
    setShowGroupSuggestions(false);
    setQueryCode(g.code_g);
    setQueryGroup(g.groupe_name);
  };

  /* ── Group search ── */
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

  /* ── Group members ── */
  const groupMembers = useMemo(() => {
    if (!groupFound) {
      return [];
    }

    return reservations.filter(
      (r) =>
        r.code_p === groupFound.code_g ||
        r.groupe_name === groupFound.groupe_name,
    );
  }, [groupFound, reservations]);

  // Check-in status is determined by room status, not reservation status
  const checkedInCount = groupMembers.filter((m) => {
    const room = rooms.find((r) => r.room_num === m.room_num);
    return room?.status === "OCC";
  }).length;

  const pendingCount = groupMembers.filter((m) => {
    const room = rooms.find((r) => r.room_num === m.room_num);
    return room?.status !== "OCC";
  }).length;

  /* Vacant rooms */
  const vacantRooms = useMemo(
    () => rooms.filter((r) => r.status === "VC"),
    [rooms],
  );

  /* ── Check-in one member ── */
  const checkInMember = async (member: RCS, targetRoom?: string) => {
    const room_num = targetRoom ?? member.room_num;

    const response = await frontOfficeApi.groupCheckin({
      code_p: member.code_p,
      groupe_name: member.groupe_name,
      guest_name: member.guest_name,
      room_num,
      arrival_date: member.arrival_date,
      depart_date: member.depart_date,
      puv: member.puv,
      current_mon: member.current_mon,
    });

    // Update reservation — always preserve group linkage fields
    setReservations((prev) =>
      prev.map((r) => {
        const isMatch =
          (r.id && response.reservation.id && r.id === response.reservation.id) ||
          (r.code_p === member.code_p && r.guest_name === member.guest_name);

        if (!isMatch) return r;

        return {
          ...r,
          ...response.reservation,
          code_p: r.code_p,
          groupe_name: r.groupe_name,
        };
      }),
    );

    // Update room
    setRooms((prev) =>
      prev.map((r) => {
        const isMatch =
          (r.id && response.room.id && r.id === response.room.id) ||
          r.room_num === room_num;

        if (!isMatch) return r;
        return { ...r, ...response.room };
      }),
    );

    return response.reservation;
  };

  /* ── Batch check-in all pending ── */
  const handleBatchCheckIn = async () => {
    const pending = groupMembers.filter((m) => m.status === 0);
    setLoadingBatch(true);
    let successCount = 0;
    let failedCount = 0;

    for (const member of pending) {
      try {
        await checkInMember(member);
        successCount++;
        // Small delay to allow state updates to process
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.error(`Failed to check in ${member.guest_name}:`, err);
        failedCount++;
      }
    }

    setLoadingBatch(false);
    setShowBatchConfirm(false);

    if (successCount > 0) {
      const msg = failedCount > 0
        ? `${successCount} member(s) checked in. ${failedCount} failed.`
        : `${successCount} group member(s) checked in successfully.`;
      setSuccessMsg(msg);
    }
  };

  /* ── Single member check-in from modal ── */
  const handleConfirmMemberCheckIn = async () => {
    if (!processingMember) return;
    setLoadingMember(true);
    try {
      const checkedInReservation = await checkInMember(processingMember, swapRoom ?? undefined);
      setSuccessMsg(
        `${checkedInReservation.guest_name} has been checked in to room ${swapRoom ?? processingMember.room_num} successfully.`,
      );
      // Clear modal after successful check-in
      setProcessingMember(null);
      setSwapRoom(null);
    } catch (err) {
      console.error("Check-in error:", err);
      setSuccessMsg(`Error checking in ${processingMember.guest_name}. Please try again.`);
    } finally {
      setLoadingMember(false);
    }
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
      {/* ── Group Search ── */}
      <div className="bg-white rounded p-4">
        <h3 className="text-base font-bold text-hotel-text-primary mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
          {t("searchGroup")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <label className="block text-sm font-medium text-hotel-text-primary mb-2">
              {t("groupCode")}
            </label>
            <input
              value={queryCode}
              onChange={(e) => handleGroupInputChange(e.target.value, true)}
              placeholder={t("groupCode")}
              title={t("groupCode")}
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-hotel-text-primary mb-2">
              {t("groupName")}
            </label>
            <input
              value={queryGroup}
              onChange={(e) => handleGroupInputChange(e.target.value, false)}
              placeholder={t("groupName")}
              title={t("groupName")}
              className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              onKeyDown={(e) => e.key === "Enter" && handleSearchGroup()}
            />
            {showGroupSuggestions && groupSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded z-50 max-h-48 overflow-y-auto">
                {groupSuggestions.map((g) => (
                  <button
                    key={g.code_g}
                    onClick={() => handleSelectGroupFromSuggestions(g)}
                    className="w-full text-left px-4 py-2 hover:bg-hotel-cream transition-colors border-b last:border-b-0 text-sm"
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
              className="w-full bg-hotel-gold text-white p-2.5 rounded flex items-center justify-center hover:bg-hotel-gold-dark transition-colors"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Group info card ── */}
      {groupFound && (
        <>
          <div className="bg-gradient-to-r from-hotel-paper to-hotel-cream border border-amber-200 rounded p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center">
                    <Users size={24} className="text-hotel-gold" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-hotel-text-primary">
                      {groupFound.groupe_name}
                    </h2>
                    <p className="text-sm text-hotel-text-secondary">
                      {t("groupCode")}: {groupFound.code_g}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                  <div>
                    <span className="text-hotel-text-secondary">{t("persons")}:</span>{" "}
                    <strong>{groupFound.number_pers}</strong>
                  </div>
                  <div>
                    <span className="text-hotel-text-secondary">{t("arrivalDate")}:</span>{" "}
                    <strong>{groupFound.arrival_date}</strong>
                  </div>
                  <div>
                    <span className="text-hotel-text-secondary">{t("departDate")}:</span>{" "}
                    <strong>{groupFound.depart_date}</strong>
                  </div>
                  <div>
                    <span className="text-hotel-text-secondary">{t("stayCost")}:</span>{" "}
                    <strong>
                      {groupFound.stay_cost.toLocaleString()}{" "}
                      {groupFound.current_mon}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Batch check-in button */}
              <button
                onClick={() => setShowBatchConfirm(true)}
                disabled={loadingBatch || pendingCount === 0}
                title={pendingCount === 0 ? "All members have been checked in" : "Check in all pending members"}
                className="bg-emerald-500 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:bg-emerald-600 disabled:bg-hotel-border disabled:cursor-not-allowed shrink-0 transition-colors"
              >
                {loadingBatch ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />}
                {loadingBatch ? "Checking in..." : `${t("checkInAll")} (${pendingCount})`}
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-hotel-text-secondary mb-1">
                <span>
                  {t("checkedIn")}: {checkedInCount} / {groupMembers.length}
                </span>
                <span>
                  {pendingCount === 0
                    ? t("allMembersCheckedIn")
                    : `${pendingCount} ${t("pendingArrival")}`}
                </span>
              </div>
              <div className="w-full bg-hotel-paper rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-colors"
                  style={{
                    width: `${groupMembers.length > 0 ? (checkedInCount / groupMembers.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Members table ── */}
          <div className="bg-white rounded overflow-hidden">
            <div className="px-6 py-4 border-b bg-white rounded p-4">
              <h3 className="font-bold text-hotel-text-primary text-base">
                {t("groupMembers")} ({groupMembers.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-700">
                  <tr>
                    {[
                      t("roomNumber"),
                      t("guestName"),
                      t("nationality"),
                      t("idCard"),
                      t("arrivalDate"),
                      t("departDate"),
                      t("stayCost"),
                      t("status"),
                      t("actions"),
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-semibold text-white text-xs"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupMembers.map((m, i) => {
                    const room = rooms.find((r) => r.room_num === m.room_num);
                    const isCheckedIn = room?.status === "OCC";
                    return (
                    <tr
                      key={i}
                      className={`border-b border-hotel-border ${isCheckedIn ? "bg-green-50" : "hover:bg-hotel-cream"} transition-colors duration-150`}
                    >
                      <td className="px-4 py-3 font-bold text-hotel-text-primary">
                        {m.room_num}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                            {m.guest_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          {m.guest_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-hotel-text-secondary">
                        {m.nationality}
                      </td>
                      <td className="px-4 py-3 text-hotel-text-secondary">{m.id_card}</td>
                      <td className="px-4 py-3 text-hotel-text-primary">
                        {m.arrival_date}
                      </td>
                      <td className="px-4 py-3 text-hotel-text-primary">
                        {m.depart_date}
                      </td>
                      <td className="px-4 py-3 font-medium text-hotel-text-primary">
                        {m.stay_cost.toLocaleString()} {m.current_mon}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const room = rooms.find((r) => r.room_num === m.room_num);
                          const isCheckedIn = room?.status === "OCC";
                          return isCheckedIn ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                              <CheckCircle2 size={12} />
                              {t("checkedIn")}
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                              {t("pendingArrival")}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const room = rooms.find((r) => r.room_num === m.room_num);
                          const isCheckedIn = room?.status === "OCC";
                          const isRoomOccupied = room?.status === "OCC" || room?.status === "DND";

                          return isCheckedIn ? null : (
                            <button
                              onClick={() => {
                                setProcessingMember(m);
                                setLocalPuv(m.current_mon === "RWF" ? m.puv : 0);
                                setSwapRoom(null);
                              }}
                              disabled={isRoomOccupied || m.status !== 0}
                              title={isRoomOccupied ? "Room is occupied - cannot check in" : m.status !== 0 ? "Guest has checked out" : "Check in this member"}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:shadow-lg transition-colors flex items-center gap-1 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                              <UserCheck size={14} />
                              {t("checkIn")}
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════
          MEMBER CHECK-IN MODAL
         ════════════════════════════════════════════ */}
      {processingMember && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-amber-50 to-white">
              <h2 className="text-base font-bold text-hotel-text-primary flex items-center gap-2">
                <UserCheck size={20} className="text-amber-600" />
                {t("processCheckIn")}
              </h2>
              <button
                onClick={() => {
                  setProcessingMember(null);
                  setSwapRoom(null);
                }}
                title="Close check-in modal"
                className="text-hotel-text-secondary hover:text-hotel-text-secondary"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Guest info */}
              <div className="grid grid-cols-2 gap-3 bg-white rounded p-4 text-sm">
                {[
                  [t("guestName"), processingMember.guest_name],
                  [t("idCard"), processingMember.id_card],
                  [t("nationality"), processingMember.nationality],
                  [t("phone"), processingMember.phone],
                  [t("email"), processingMember.email],
                  [
                    t("nights"),
                    String(
                      calcNights(
                        processingMember.arrival_date,
                        processingMember.depart_date,
                      ),
                    ),
                  ],
                ].map(([label, val]) => (
                  <div key={label}>
                    <span className="text-hotel-text-secondary text-xs">{label}</span>
                    <p className="font-medium text-hotel-text-primary">{val}</p>
                  </div>
                ))}
              </div>

              {/* Room assignment with swap option */}
              <div>
                <h4 className="text-sm font-semibold text-hotel-text-secondary mb-2 flex items-center gap-1">
                  <ArrowRightLeft size={14} />
                  {t("roomAssignment")}
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-amber-50 border border-amber-200 rounded px-4 py-2 text-center">
                    <span className="text-xs text-amber-600">
                      {t("assignedRoom")}
                    </span>
                    <p className="font-bold text-base text-amber-800">
                      {processingMember.room_num}
                    </p>
                  </div>
                  {swapRoom && (
                    <>
                      <ArrowRightLeft
                        size={16}
                        className="text-amber-500 shrink-0"
                      />
                      <div className="flex-1 bg-green-50 border border-green-200 rounded px-4 py-2 text-center">
                        <span className="text-xs text-green-600">
                          {t("swapRoomTo")}
                        </span>
                        <p className="font-bold text-base text-green-800">
                          {swapRoom}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <select
                  title="Select a room to swap"
                  value={swapRoom ?? ""}
                  onChange={(e) => setSwapRoom(e.target.value || null)}
                  className="mt-2 border rounded px-3 py-2 text-sm w-full"
                >
                  <option value="">
                    — {t("swapRoom")} ({t("availableRooms")}) —
                  </option>
                  {vacantRooms.map((r) => (
                    <option key={r.room_num} value={r.room_num}>
                      {r.room_num} — {r.designation} ({getCatName(r.categorie)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cost summary */}
              <div className="bg-white rounded p-3 flex justify-between items-center text-sm">
                <span className="text-hotel-text-secondary">{t("stayCost")}</span>
                <strong className="text-base">
                  {processingMember.stay_cost.toLocaleString()}{" "}
                  {processingMember.current_mon}
                </strong>
              </div>

              {/* Currency dropdown */}
              <div>
                <label className="block text-xs font-medium text-hotel-text-secondary mb-1">
                  {t("currency")}
                </label>
                <select
                  value={processingMember.current_mon || "RWF"}
                  onChange={(e) => {
                    const code = e.target.value;
                    let puv = processingMember.puv;
                    let mon = processingMember.current_mon;
                    if (code === "RWF") {
                      if (localPuv > 0) puv = localPuv;
                      mon = "RWF";
                    } else if (currencyOptions.find(c => c.code === code)?.exchange_rate) {
                      const rate = currencyOptions.find(c => c.code === code)!.exchange_rate;
                      if (localPuv > 0) {
                        puv = Math.round(localPuv / rate);
                      }
                      mon = code;
                    } else {
                      mon = code;
                    }
                    const updated = { ...processingMember, puv, current_mon: mon };
                    const arr = updated.arrival_date ? new Date(updated.arrival_date) : null;
                    const dep = updated.depart_date ? new Date(updated.depart_date) : null;
                    const qty = arr && dep ? Math.max(Math.round((dep.getTime() - arr.getTime()) / 86400000), 0) : 0;
                    const base = qty * updated.puv;
                    updated.stay_cost = updated.discount > 0 ? base * (1 - updated.discount / 100) : base;
                    setProcessingMember(updated);
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

              <button
                onClick={handleConfirmMemberCheckIn}
                disabled={loadingMember}
                className="w-full py-3 rounded font-semibold text-sm bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-hotel-border disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingMember ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />}
                {loadingMember ? "Checking in..." : t("confirmAndCheckIn")}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════════
          BATCH CHECK-IN CONFIRMATION MODAL
         ════════════════════════════════════════════ */}
      {showBatchConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-amber-50 to-white">
              <h2 className="text-base font-bold text-hotel-text-primary flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-600" />
                Confirm Batch Check-In
              </h2>
              <button
                onClick={() => setShowBatchConfirm(false)}
                disabled={loadingBatch}
                className="text-hotel-text-secondary hover:text-hotel-text-secondary disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-hotel-text-primary text-sm leading-relaxed">
                You are about to check in <strong>{pendingCount} group member{pendingCount !== 1 ? "s" : ""}</strong> from <strong>{groupFound?.groupe_name}</strong>. This action will:
              </p>
              <ul className="text-sm text-hotel-text-secondary space-y-2 ml-4">
                <li>• Update their status to checked in</li>
                <li>• Assign them to their respective rooms</li>
                <li>• Update room occupancy records</li>
              </ul>
              <p className="text-sm font-medium text-hotel-gold bg-amber-50 p-3 rounded">
                This action cannot be undone individually. Members can only be unchecked in via the normal checkout process.
              </p>
            </div>

            <div className="px-6 py-4 bg-white flex gap-3 justify-end border-t border-hotel-border">
              <button
                onClick={() => setShowBatchConfirm(false)}
                disabled={loadingBatch}
                className="px-4 py-2 rounded bg-hotel-paper text-hotel-text-primary hover:bg-hotel-paper transition-colors font-medium text-sm disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchCheckIn}
                disabled={loadingBatch}
                className="px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium text-sm flex items-center gap-2 disabled:bg-hotel-border disabled:cursor-not-allowed"
              >
                {loadingBatch && <Loader2 className="animate-spin" size={16} />}
                {loadingBatch ? "Checking in..." : "Confirm & Check-In All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation Dialog */}
      {successMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 w-full max-w-md text-center space-y-4">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
            <h3 className="text-base font-semibold text-hotel-text-primary">Check-In Complete</h3>
            <p className="text-sm text-hotel-text-secondary">{successMsg}</p>
            <button
              onClick={() => setSuccessMsg("")}
              className="bg-emerald-500 text-white px-6 py-2 rounded text-sm hover:bg-emerald-600"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}


