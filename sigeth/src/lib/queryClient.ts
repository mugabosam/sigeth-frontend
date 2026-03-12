import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,       // 5 minutes before refetch
            retry: 1,                        // retry failed requests once
            refetchOnWindowFocus: false,     // avoid noisy refetches
        },
        mutations: {
            retry: 0,
        },
    },
});
