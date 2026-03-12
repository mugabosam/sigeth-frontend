import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { queryKeys } from "../lib/queryKeys";
import type { RDF, CATROOM, StatusRef } from "../types";

// ── Queries ──

export function useRooms() {
    return useQuery({
        queryKey: queryKeys.rooms.list(),
        queryFn: async () => {
            const { data } = await api.get<RDF[]>("/rooms");
            return data;
        },
    });
}

export function useRoom(roomNum: string) {
    return useQuery({
        queryKey: queryKeys.rooms.detail(roomNum),
        queryFn: async () => {
            const { data } = await api.get<RDF>(`/rooms/${roomNum}`);
            return data;
        },
        enabled: !!roomNum,
    });
}

export function useRoomStatuses() {
    return useQuery({
        queryKey: queryKeys.rooms.statuses(),
        queryFn: async () => {
            const { data } = await api.get<StatusRef[]>("/rooms/statuses");
            return data;
        },
        staleTime: Infinity, // reference data rarely changes
    });
}

export function useRoomCategories() {
    return useQuery({
        queryKey: queryKeys.rooms.categories(),
        queryFn: async () => {
            const { data } = await api.get<CATROOM[]>("/rooms/categories");
            return data;
        },
        staleTime: Infinity,
    });
}

// ── Mutations ──

export function useUpdateRoom() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (room: RDF) => {
            const { data } = await api.put<RDF>(`/rooms/${room.room_num}`, room);
            return data;
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: queryKeys.rooms.list() });
            qc.invalidateQueries({ queryKey: queryKeys.rooms.detail(variables.room_num) });
        },
    });
}

export function useUpdateRoomStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ roomNum, status }: { roomNum: string; status: string }) => {
            const { data } = await api.patch<RDF>(`/rooms/${roomNum}/status`, { status });
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
            qc.invalidateQueries({ queryKey: queryKeys.staff.dispatching() });
        },
    });
}
