/**
 * CheckOut.tsx — Guest Check-Out Page
 *
 * Checkout process (backend):
 *   - Individual: RCS → RCSA, JLAUNDRY → JLAUNDRY_arc, JBANQUET → JBANQUET_arc, RDF cleared
 *   - Group: GRC → GRCA, all member rooms released
 */
import { useState, useMemo } from "react";
import {
  Search,
  LogOut,
  Users,
  User,
} from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { useHotelData } from "../../context/HotelDataContext";
import { useNotification } from "../../hooks/useNotification";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { frontOfficeApi } from "../../services/sigethApi";

type CheckoutMode = "individual" | "group";

export default function CheckOut() {
  const { t } = useLang();
  const {
    rooms,
    setRooms,
    reservations,
    setReservations,
    reservationArchive,
    setReservationArchive,
    groupReservations,
    setGroupReservations,
    groupArchive,
    setGroupArchive,
  } = useHotelData();
  const { addNotification } = useNotification();

  const [mode, setMode] = useState<CheckoutMode>("individual");
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedGuest, setSelectedGuest] = useState<string>("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  // ── Occupied rooms for individual checkout ──
  const occupiedRooms = useMemo(() => {
    const q = search.toLowerCase();
    return rooms.filter(
      (r) =>
        r.status === "OCC" &&
        (r.room_num.toLowerCase().includes(q) ||
          r.guest_name.toLowerCase().includes(q)),
    );
  }, [rooms, search]);

  // ── Active groups for group checkout ──
  const activeGroups = useMemo(() => {
    const q = search.toLowerCase();
    return groupReservations.filter(
      (g) =>
        g.status === 0 &&
        (g.groupe_name.toLowerCase().includes(q) ||
          g.code_g.toLowerCase().includes(q)),
    );
  }, [groupReservations, search]);

  // ── Individual checkout ──
  const handleIndividualCheckout = (roomNum: string, guestName: string) => {
    setSelectedRoom(roomNum);
    setSelectedGuest(guestName);
    setConfirmOpen(true);
  };

  const confirmIndividualCheckout = async () => {
    try {
      const response = await frontOfficeApi.checkout({
        room_num: selectedRoom,
        guest_name: selectedGuest,
      });

      // Move reservation to archive in local state
      const archivedRes = reservations.find(
        (r) => r.room_num === selectedRoom && r.guest_name === selectedGuest,
      );
      if (archivedRes) {
        setReservations((prev) =>
          prev.filter((r) => r.id !== archivedRes.id),
        );
        setReservationArchive((prev) => [
          ...prev,
          { ...response.archive },
        ]);
      }

      // Clear room in local state
      setRooms((prev) =>
        prev.map((r) =>
          r.room_num === selectedRoom
            ? {
                ...r,
                status: "VC" as const,
                guest_name: "",
                twin_name: "",
                twin_num: 0,
                arrival_date: "",
                depart_date: "",
                qty: 0,
                deposit: 0,
              }
            : r,
        ),
      );

      addNotification(
        `Guest ${selectedGuest} checked out from room ${selectedRoom}`,
        "Rooms Attendant",
        "success",
      );
    } catch (error) {
      addNotification(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : "Check-out failed",
        "Rooms Attendant",
        "error",
      );
    }

    setConfirmOpen(false);
    setSelectedRoom("");
    setSelectedGuest("");
  };

  // ── Group checkout ──
  const handleGroupCheckout = (groupeName: string) => {
    setSelectedGroup(groupeName);
    setConfirmOpen(true);
  };

  const confirmGroupCheckout = async () => {
    try {
      const response = await frontOfficeApi.groupCheckout({
        groupe_name: selectedGroup,
      });

      // Move group to archive
      const archivedGroup = groupReservations.find(
        (g) => g.groupe_name === selectedGroup,
      );
      if (archivedGroup) {
        setGroupReservations((prev) =>
          prev.filter((g) => g.id !== archivedGroup.id),
        );
        setGroupArchive((prev) => [...prev, { ...response.archive }]);
      }

      // Remove group member reservations
      setReservations((prev) =>
        prev.filter((r) => r.groupe_name !== selectedGroup),
      );

      // Clear all rooms occupied by this group
      setRooms((prev) =>
        prev.map((r) =>
          r.groupe_name === selectedGroup
            ? {
                ...r,
                status: "VC" as const,
                guest_name: "",
                twin_name: "",
                twin_num: 0,
                arrival_date: "",
                depart_date: "",
                qty: 0,
                deposit: 0,
                groupe_name: "",
              }
            : r,
        ),
      );

      addNotification(
        `Group "${selectedGroup}" checked out successfully`,
        "Rooms Attendant",
        "success",
      );
    } catch (error) {
      addNotification(
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: string }).message)
          : "Group check-out failed",
        "Rooms Attendant",
        "error",
      );
    }

    setConfirmOpen(false);
    setSelectedGroup("");
  };

  // ── Nights calculator ──
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Check-Out
        </h1>
      </div>

      {/* Mode toggle */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => {
              setMode("individual");
              setSearch("");
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === "individual"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <User size={16} />
            Individual Check-Out
          </button>
          <button
            onClick={() => {
              setMode("group");
              setSearch("");
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === "group"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Users size={16} />
            Group Check-Out
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              mode === "individual"
                ? `${t("search")} ${t("roomNumber")} / ${t("guestName")}...`
                : `${t("search")} ${t("groupName")} / ${t("groupCode")}...`
            }
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* ── Individual checkout list ── */}
      {mode === "individual" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-100">
            <LogOut size={20} className="text-red-600" />
            <div className="flex-1">
              <h2 className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Occupied Rooms
              </h2>
            </div>
            <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">
              {occupiedRooms.length}
            </span>
          </div>

          {occupiedRooms.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">
              {search
                ? `No occupied rooms match "${search}"`
                : "No occupied rooms to check out"}
            </div>
          ) : (
            occupiedRooms.map((room) => {
              const nights = calcNights(room.arrival_date, room.depart_date);
              return (
                <div
                  key={room.room_num}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                          {room.guest_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {room.guest_name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Room {room.room_num} — {room.designation}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-gray-500 text-xs">
                            {t("arrivalDate")}
                          </span>
                          <p className="font-semibold text-gray-900">
                            {room.arrival_date}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">
                            {t("departDate")}
                          </span>
                          <p className="font-semibold text-gray-900">
                            {room.depart_date}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">
                            {t("nights")}
                          </span>
                          <p className="font-semibold text-gray-900">
                            {nights}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">
                            {t("deposit")}
                          </span>
                          <p className="font-semibold text-gray-900">
                            {room.deposit.toLocaleString()} {room.current_mon}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleIndividualCheckout(
                          room.room_num,
                          room.guest_name,
                        )
                      }
                      className="ml-4 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all transform hover:scale-105 shrink-0 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg"
                    >
                      <LogOut size={16} />
                      Check-Out
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Group checkout list ── */}
      {mode === "group" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
            <Users size={20} className="text-amber-600" />
            <div className="flex-1">
              <h2 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Active Groups
              </h2>
            </div>
            <span className="bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">
              {activeGroups.length}
            </span>
          </div>

          {activeGroups.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">
              {search
                ? `No active groups match "${search}"`
                : "No active groups to check out"}
            </div>
          ) : (
            activeGroups.map((group) => {
              const memberCount = reservations.filter(
                (r) =>
                  r.code_p === group.code_g ||
                  r.groupe_name === group.groupe_name,
              ).length;
              const checkedInCount = reservations.filter(
                (r) =>
                  (r.code_p === group.code_g ||
                    r.groupe_name === group.groupe_name) &&
                  r.status === 1,
              ).length;

              return (
                <div
                  key={group.code_g}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                          <Users size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {group.groupe_name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {t("groupCode")}: {group.code_g}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-gray-500 text-xs">
                            {t("persons")}
                          </span>
                          <p className="font-semibold text-gray-900">
                            {group.number_pers}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">
                            Members Checked In
                          </span>
                          <p className="font-semibold text-gray-900">
                            {checkedInCount} / {memberCount}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">
                            {t("stayCost")}
                          </span>
                          <p className="font-semibold text-gray-900">
                            {group.stay_cost.toLocaleString()}{" "}
                            {group.current_mon}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">
                            {t("deposit")}
                          </span>
                          <p className="font-semibold text-gray-900">
                            {group.deposit.toLocaleString()}{" "}
                            {group.current_mon}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleGroupCheckout(group.groupe_name)
                      }
                      className="ml-4 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all transform hover:scale-105 shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg"
                    >
                      <LogOut size={16} />
                      Check-Out Group
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Confirmation modal ── */}
      <ConfirmationModal
        isOpen={confirmOpen}
        title={
          mode === "individual"
            ? "Check-Out Guest"
            : "Check-Out Group"
        }
        message={
          mode === "individual"
            ? `Are you sure you want to check out ${selectedGuest} from room ${selectedRoom}? This will archive the reservation and release the room.`
            : `Are you sure you want to check out the entire group "${selectedGroup}"? This will archive all member reservations and release all rooms.`
        }
        confirmText="Check-Out"
        cancelText={t("cancel")}
        isDangerous={true}
        onConfirm={
          mode === "individual"
            ? confirmIndividualCheckout
            : confirmGroupCheckout
        }
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedRoom("");
          setSelectedGuest("");
          setSelectedGroup("");
        }}
      />
    </div>
  );
}
