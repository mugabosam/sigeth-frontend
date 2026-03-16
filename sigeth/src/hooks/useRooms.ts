import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import type { RDF } from "../types";
import { coreApi, frontOfficeApi, housekeepingApi } from "../services/sigethApi";

// ── Queries ──

export function useRooms() {
    return useQuery({
        queryKey: queryKeys.rooms.list(),
        queryFn: () => frontOfficeApi.rooms(),
    });
}

export function useRoom(roomId: string) {
    return useQuery({
        queryKey: queryKeys.rooms.detail(roomId),
        queryFn: () => frontOfficeApi.room(roomId),
        enabled: !!roomId,
    });
}

export function useRoomStatuses() {
    return useQuery({
        queryKey: queryKeys.rooms.statuses(),
        queryFn: () => coreApi.statuses(),
        staleTime: Infinity, // reference data rarely changes
    });
}

export function useRoomCategories() {
    return useQuery({
        queryKey: queryKeys.rooms.categories(),
        queryFn: () => coreApi.catrooms(),
        staleTime: Infinity,
    });
}

// ── Mutations ──

export function useUpdateRoom() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (room: RDF) => {
            if (!room.id) {
                throw new Error("Room id is required to update a room.");
            }
            return frontOfficeApi.updateRoom(room.id, room);
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: queryKeys.rooms.list() });
            if (variables.id) {
                qc.invalidateQueries({ queryKey: queryKeys.rooms.detail(variables.id) });
            }
        },
    });
}

export function useUpdateRoomStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ roomNum, status }: { roomNum: string; status: string }) => {
            return housekeepingApi.updateRoomStatus({ room_num: roomNum, status_code: status });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
            qc.invalidateQueries({ queryKey: queryKeys.staff.dispatching() });
        },
    });
}
