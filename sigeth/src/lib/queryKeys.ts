// Centralised query-key factory – keeps cache keys consistent and enables
// targeted invalidation from any mutation hook.

export const queryKeys = {
    // ── Rooms ──
    rooms: {
        all: ["rooms"] as const,
        list: () => [...queryKeys.rooms.all, "list"] as const,
        detail: (roomNum: string) => [...queryKeys.rooms.all, roomNum] as const,
        statuses: () => [...queryKeys.rooms.all, "statuses"] as const,
        categories: () => [...queryKeys.rooms.all, "categories"] as const,
    },

    // ── Reservations (individual + group) ──
    reservations: {
        all: ["reservations"] as const,
        list: () => [...queryKeys.reservations.all, "list"] as const,
        detail: (roomNum: string) => [...queryKeys.reservations.all, roomNum] as const,
        archive: () => [...queryKeys.reservations.all, "archive"] as const,
        groups: () => [...queryKeys.reservations.all, "groups"] as const,
        groupArchive: () => [...queryKeys.reservations.all, "group-archive"] as const,
    },

    // ── Invoices & Sales ──
    invoices: {
        all: ["invoices"] as const,
        list: () => [...queryKeys.invoices.all, "list"] as const,
        sales: () => [...queryKeys.invoices.all, "sales"] as const,
        consumptions: () => [...queryKeys.invoices.all, "consumptions"] as const,
    },

    // ── Staff (housekeeping + dispatching) ──
    staff: {
        all: ["staff"] as const,
        list: () => [...queryKeys.staff.all, "list"] as const,
        detail: (id: string) => [...queryKeys.staff.all, id] as const,
        dispatching: () => [...queryKeys.staff.all, "dispatching"] as const,
    },
} as const;
