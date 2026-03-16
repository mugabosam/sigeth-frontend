import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import type { HSTAFF, RSTAFF } from "../types";
import { housekeepingApi } from "../services/sigethApi";

// ── Queries ──

export function useStaff() {
    return useQuery({
        queryKey: queryKeys.staff.list(),
        queryFn: () => housekeepingApi.staff(),
    });
}

export function useStaffMember(id: string) {
    return useQuery({
        queryKey: queryKeys.staff.detail(id),
        queryFn: async () => {
            const staff = await housekeepingApi.staff();
            const found = staff.find((member) => member.id === id);
            if (!found) {
                throw new Error("Staff member not found.");
            }
            return found;
        },
        enabled: !!id,
    });
}

export function useStaffDispatching() {
    return useQuery({
        queryKey: queryKeys.staff.dispatching(),
        queryFn: () => housekeepingApi.dispatching(),
    });
}

// ── Mutations ──

export function useCreateStaff() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (member: HSTAFF) => housekeepingApi.createStaff(member),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.staff.list() });
        },
    });
}

export function useUpdateStaff() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (member: HSTAFF) => {
            if (!member.id) {
                throw new Error("Staff id is required to update a staff member.");
            }
            return housekeepingApi.updateStaff(member.id, member);
        },
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: queryKeys.staff.list() });
            if (variables.id) {
                qc.invalidateQueries({ queryKey: queryKeys.staff.detail(variables.id) });
            }
        },
    });
}

export function useDeleteStaff() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => housekeepingApi.deleteStaff(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.staff.list() });
        },
    });
}

export function useAssignStaff() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (assignment: RSTAFF) => {
            return housekeepingApi.assignStaff({
                staff_number: assignment.staff_number,
                room_num: assignment.room_num,
            });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.staff.dispatching() });
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
}
