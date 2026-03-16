import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import type { RCS, GRC } from "../types";
import { frontOfficeApi } from "../services/sigethApi";

// ── Individual Reservations ──

export function useReservations() {
    return useQuery({
        queryKey: queryKeys.reservations.list(),
        queryFn: () => frontOfficeApi.reservations(),
    });
}

export function useReservation(id: string) {
    return useQuery({
        queryKey: queryKeys.reservations.detail(id),
        queryFn: () => frontOfficeApi.reservation(id),
        enabled: !!id,
    });
}

export function useReservationArchive() {
    return useQuery({
        queryKey: queryKeys.reservations.archive(),
        queryFn: () => frontOfficeApi.archives(),
    });
}

// ── Group Reservations ──

export function useGroupReservations() {
    return useQuery({
        queryKey: queryKeys.reservations.groups(),
        queryFn: () => frontOfficeApi.groups(),
    });
}

export function useGroupArchive() {
    return useQuery({
        queryKey: queryKeys.reservations.groupArchive(),
        queryFn: () => frontOfficeApi.groupArchives(),
    });
}

// ── Mutations ──

export function useCreateReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (reservation: RCS) => frontOfficeApi.createReservation(reservation),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.reservations.all });
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
}

export function useUpdateReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (reservation: RCS) => {
            if (!reservation.id) {
                throw new Error("Reservation id is required to update a reservation.");
            }
            return frontOfficeApi.updateReservation(reservation.id, reservation);
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: queryKeys.reservations.list() });
            if (variables.id) {
                qc.invalidateQueries({ queryKey: queryKeys.reservations.detail(variables.id) });
            }
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
}

export function useCreateGroupReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (group: GRC) => frontOfficeApi.createGroup(group),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.reservations.groups() });
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
}

export function useCheckIn() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { room_num: string; guest_name: string }) => {
            return frontOfficeApi.checkin(payload);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.reservations.all });
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
}

export function useCheckOut() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { room_num: string; guest_name: string }) => {
            return frontOfficeApi.checkout(payload);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.reservations.all });
            qc.invalidateQueries({ queryKey: queryKeys.reservations.archive() });
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
}
