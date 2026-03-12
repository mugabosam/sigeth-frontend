import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { queryKeys } from "../lib/queryKeys";
import type { InvoiceRecord, SalesEntry, TEMPO } from "../types";

// ── Queries ──

export function useInvoices() {
    return useQuery({
        queryKey: queryKeys.invoices.list(),
        queryFn: async () => {
            const { data } = await api.get<InvoiceRecord[]>("/invoices");
            return data;
        },
    });
}

export function useSales() {
    return useQuery({
        queryKey: queryKeys.invoices.sales(),
        queryFn: async () => {
            const { data } = await api.get<SalesEntry[]>("/sales");
            return data;
        },
    });
}

export function useConsumptions(roomNum?: string) {
    return useQuery({
        queryKey: [...queryKeys.invoices.consumptions(), roomNum] as const,
        queryFn: async () => {
            const url = roomNum ? `/consumptions?room=${roomNum}` : "/consumptions";
            const { data } = await api.get<TEMPO[]>(url);
            return data;
        },
    });
}

// ── Mutations ──

export function useCreateInvoice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (invoice: Omit<InvoiceRecord, "numero">) => {
            const { data } = await api.post<InvoiceRecord>("/invoices", invoice);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
        },
    });
}

export function useRecordSale() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (sale: SalesEntry) => {
            const { data } = await api.post<SalesEntry>("/sales", sale);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.invoices.sales() });
            qc.invalidateQueries({ queryKey: queryKeys.invoices.consumptions() });
            qc.invalidateQueries({ queryKey: queryKeys.rooms.all });
        },
    });
}
