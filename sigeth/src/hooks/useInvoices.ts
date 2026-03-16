import { useQuery, useMutation } from "@tanstack/react-query";
import { frontOfficeApi } from "../services/sigethApi";
import type { TEMPO } from "../types";

export function useGuestInvoicePreview(roomNum?: string, guestName?: string) {
    return useQuery({
        queryKey: ["invoice-preview", roomNum, guestName] as const,
        queryFn: async (): Promise<TEMPO[]> => {
            if (!roomNum || !guestName) {
                return [];
            }
            const response = await frontOfficeApi.previewInvoice({
                room_num: roomNum,
                guest_name: guestName,
            });
            return response.items;
        },
        enabled: Boolean(roomNum && guestName),
    });
}

export function useGroupInvoicePreview(groupeName?: string) {
    return useQuery({
        queryKey: ["group-invoice-preview", groupeName] as const,
        queryFn: async (): Promise<TEMPO[]> => {
            if (!groupeName) {
                return [];
            }
            const response = await frontOfficeApi.previewGroupInvoice({
                groupe_name: groupeName,
            });
            return response.items;
        },
        enabled: Boolean(groupeName),
    });
}

export function useGenerateGuestInvoice() {
    return useMutation({
        mutationFn: frontOfficeApi.generateInvoice,
    });
}

export function useGenerateGroupInvoice() {
    return useMutation({
        mutationFn: frontOfficeApi.generateGroupInvoice,
    });
}
