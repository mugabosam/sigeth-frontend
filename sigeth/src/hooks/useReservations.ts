import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { queryKeys } from "../lib/queryKeys";
import type { RCS, RCSA, GRC, GRCA } from "../types";

// ── Individual Reservations ──

export function useReservations() {
    return useQuery({
        queryKey: queryKeys.reservations.list(),
        queryFn: async () => {
            const { data } = await api.get<RCS[]>("/reservations");
            return data;
        },
    });
}

export function useReservation(roomNum: string) {
    return useQuery({
        queryKey: queryKeys.reservations.detail(roomNum),
        queryFn: async () => {
            const { data } = await api.get<RCS>(`/reservations/${roomNum}`);
            return data;
        },
        enabled: !!roomNum,
    });
}

export function useReservationArchive() {
    return useQuery({
        queryKey: queryKeys.reservations.archive(),
        queryFn: async () => {
            const { data } = await api.get<RCSA[]>("/reservations/archive");
            return data;
        },
    });
}

// ── Group Reservations ──

export function useGroupReservations() {
    return useQuery({
        queryKey: queryKeys.reservations.groups(),
        queryFn: async () => {
            const { data } = await api.get<GRC[]>("/reservations/groups");
            return data;
        },
    });
}

export function useGroupArchive() {
    return useQuery({
        queryKey: queryKeys.reservations.groupArchive(),
        queryFn: async () => {
            const { data } = await api.get<GRCA[]>("/reservations/groups/archive");
            return data;
        },
    });
}

// ── Mutations ──

export function useCreateReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (reservation: RCS) => {
            const { data } = await api.post<RCS>("/reservations", reservation);
            return data;
        },
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
            const { data } = await api.put<RCS>(
                `/reservations/${reservation.room_num}`,
                reservation,
            );
            return data;
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: queryKeys.reservations.list() });
            qc.invalidateQueries({ queryKey: queryKeys.reservations.detail(variables.room_num) });
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
}

export function useCreateGroupReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (group: GRC) => {
            const { data } = await api.post<GRC>("/reservations/groups", group);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.reservations.groups() });
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
}

export function useCheckIn() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (roomNum: string) => {
            const { data } = await api.post(`/reservations/${roomNum}/check-in`);
            return data;
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
        mutationFn: async (roomNum: string) => {
            const { data } = await api.post(`/reservations/${roomNum}/check-out`);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.reservations.all });
            qc.invalidateQueries({ queryKey: queryKeys.reservations.archive() });
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
            qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
        },
    });
}
