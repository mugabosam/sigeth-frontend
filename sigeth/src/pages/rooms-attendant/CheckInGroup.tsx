/* eslint-disable -- Inline styles necessary for dynamic width and progress calculations */
import { useState, useMemo } from "react";
import {
  Search,
  Users,
  UserCheck,
  X,
  CheckCircle2,
  ArrowRightLeft,
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
    if (!groupFound) return [];
    return reservations.filter(
      (r) =>
        r.code_p === groupFound.code_g ||
        r.groupe_name === groupFound.groupe_name,
    );
  }, [groupFound, reservations]);

  const checkedInCount = groupMembers.filter((m) => m.status === 1).length;
  const pendingCount = groupMembers.filter((m) => m.status === 0).length;

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

    setReservations((prev) =>
      prev.map((r) => (r.id === response.reservation.id ? response.reservation : r)),
    );
    setRooms((prev) =>
      prev.map((room) => (room.id === response.room.id ? response.room : room)),
    );

    return response.reservation;
  };

  /* ── Batch check-in all pending ── */
  const handleBatchCheckIn = async () => {
    const pending = groupMembers.filter((m) => m.status === 0);
    let count = 0;
    for (const member of pending) {
      try {
        await checkInMember(member);
        count++;
      } catch {
        break;
      }
    }
    if (count > 0) {
      setSuccessMsg(`${count} group member(s) checked in successfully.`);
    }
  };

  /* ── Single member check-in from modal ── */
  const handleConfirmMemberCheckIn = async () => {
    if (!processingMember) return;
    await checkInMember(processingMember, swapRoom ?? undefined);
    setSuccessMsg(
      `${processingMember.guest_name} has been checked in to room ${swapRoom ?? processingMember.room_num} successfully.`,
    );
    setProcessingMember(null);
    setSwapRoom(null);
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
      <div className="flex justify-between items-center bg-white border border-hotel-border rounded p-4 p-4 rounded border border-blue-100">
        <h1 className="text-2xl font-bold bg-hotel-gold bg-clip-text text-transparent">
          {t("checkInGroupReservation")}
        </h1>
      </div>

      {/* ── Group Search ── */}
      <div className="bg-white rounded border border-hotel-border p-4">
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
              className="w-full border border-hotel-border rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
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
              className="w-full border border-hotel-border rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              onKeyDown={(e) => e.key === "Enter" && handleSearchGroup()}
            />
            {showGroupSuggestions && groupSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-hotel-border rounded z-50 max-h-48 overflow-y-auto">
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
              className="w-full bg-hotel-gold text-white px-6 py-2 rounded flex items-center justify-center gap-2 text-sm font-medium hover:shadow-lg transition-colors duration-200"
            >
              <Search size={16} />
              {t("search")}
            </button>
          </div>
        </div>
      </div>

      {/* ── Group info card ── */}
      {groupFound && (
        <>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center">
                    <Users size={24} className="text-amber-700" />
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
                    <span className="text-gray-400">{t("persons")}:</span>{" "}
                    <strong>{groupFound.number_pers}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">{t("arrivalDate")}:</span>{" "}
                    <strong>{groupFound.arrival_date}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">{t("departDate")}:</span>{" "}
                    <strong>{groupFound.depart_date}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">{t("stayCost")}:</span>{" "}
                    <strong>
                      {groupFound.stay_cost.toLocaleString()}{" "}
                      {groupFound.current_mon}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Batch check-in button */}
              {pendingCount > 0 && (
                <button
                  onClick={handleBatchCheckIn}
                  className="bg-emerald-500 text-white px-5 py-2.5 rounded flex items-center gap-2 text-sm font-semibold hover:bg-emerald-600 shrink-0"
                >
                  <UserCheck size={18} />
                  {t("checkInAll")} ({pendingCount})
                </button>
              )}
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
              <div className="w-full bg-gray-200 rounded-full h-2">
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
          <div className="bg-white rounded border border-hotel-border overflow-hidden">
            <div className="px-6 py-4 border-b bg-white border border-hotel-border rounded p-4">
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
                  {groupMembers.map((m, i) => (
                    <tr
                      key={i}
                      className={`border-b border-hotel-border ${m.status === 1 ? "bg-green-50" : "hover:bg-hotel-cream"} transition-colors duration-150`}
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
                        {m.status === 1 ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-hotel-text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                            <CheckCircle2 size={12} />
                            {t("checkedIn")}
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            {t("pendingArrival")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {m.status === 0 && (
                          <button
                            onClick={() => {
                              setProcessingMember(m);
                              setLocalPuv(m.current_mon === "RWF" ? m.puv : 0);
                              setSwapRoom(null);
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:shadow-lg transition-colors flex items-center gap-1"
                          >
                            <UserCheck size={14} />
                            {t("checkIn")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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
                className="text-gray-400 hover:text-hotel-text-secondary"
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
                    <span className="text-gray-400 text-xs">{label}</span>
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
                        <span className="text-xs text-hotel-gold">
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
                className="w-full py-3 rounded font-semibold text-sm bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center gap-2"
              >
                <UserCheck size={18} />
                {t("confirmAndCheckIn")}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Success Confirmation Dialog */}
      {successMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 w-full max-w-md text-center space-y-4">
            <CheckCircle2 size={40} className="text-green-500 mx-auto" />
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

    </div>
  );
}
