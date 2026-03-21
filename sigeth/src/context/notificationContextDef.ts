import { createContext } from "react";

export interface Notification {
    id: string;
    module: string;
    message: string;
    time: string;
    read: boolean;
    type?: "success" | "error" | "info" | "warning";
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (
        message: string,
        module: string,
        type?: "success" | "error" | "info" | "warning",
    ) => void;
    removeNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}

export const NotificationContext = createContext<
    NotificationContextType | undefined
>(undefined);
