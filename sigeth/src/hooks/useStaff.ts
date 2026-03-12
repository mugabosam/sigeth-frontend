import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { queryKeys } from "../lib/queryKeys";
import type { HSTAFF, RSTAFF } from "../types";

// ── Queries ──

export function useStaff() {
    return useQuery({
        queryKey: queryKeys.staff.list(),
        queryFn: async () => {
            const { data } = await api.get<HSTAFF[]>("/staff");
            return data;
        },
    });
}

export function useStaffMember(id: number) {
    return useQuery({
        queryKey: queryKeys.staff.detail(id),
        queryFn: async () => {
            const { data } = await api.get<HSTAFF>(`/staff/${id}`);
            return data;
        },
        enabled: id > 0,
    });
}

export function useStaffDispatching() {
    return useQuery({
        queryKey: queryKeys.staff.dispatching(),
        queryFn: async () => {
            const { data } = await api.get<RSTAFF[]>("/staff/dispatching");
            return data;
        },
    });
}

// ── Mutations ──

export function useCreateStaff() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (member: HSTAFF) => {
            const { data } = await api.post<HSTAFF>("/staff", member);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.staff.list() });
        },
    });
}

export function useUpdateStaff() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (member: HSTAFF) => {
            const { data } = await api.put<HSTAFF>(`/staff/${member.number}`, member);
            return data;
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: queryKeys.staff.list() });
            qc.invalidateQueries({ queryKey: queryKeys.staff.detail(variables.number) });
        },
    });
}

export function useDeleteStaff() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/staff/${id}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.staff.list() });
        },
    });
}

export function useAssignStaff() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (assignment: RSTAFF) => {
            const { data } = await api.post<RSTAFF>("/staff/dispatching", assignment);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.staff.dispatching() });
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
}
