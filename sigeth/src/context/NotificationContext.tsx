import React, { createContext, useState, useCallback } from "react";

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

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (
      message: string,
      module: string,
      type: "success" | "error" | "info" | "warning" = "info",
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newNotification: Notification = {
        id,
        module,
        message,
        time: "Just now",
        read: false,
        type,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Auto-remove notification after 5 seconds if success
      if (type === "success") {
        setTimeout(() => {
          removeNotification(id);
        }, 5000);
      }
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
