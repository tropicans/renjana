"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchMyNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "@/features/client/api/learner";
import { useUser } from "@/lib/context/user-context";
import { useToast } from "@/components/ui/toast";

const MY_NOTIFICATIONS_QUERY_KEY = ["my-notifications"] as const;
const MY_NOTIFICATIONS_STALE_TIME_MS = 2 * 60 * 1000;

type NotificationsContextValue = {
    notifications: Awaited<ReturnType<typeof fetchMyNotifications>>["notifications"];
    unreadCount: number;
    isLoading: boolean;
    isFetching: boolean;
    markAllRead: () => void;
    markRead: (id: string) => void;
    markAllReadPending: boolean;
    markReadPending: boolean;
};

const NotificationsContext = React.createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const toast = useToast();
    const queryClient = useQueryClient();
    const { isAuthenticated } = useUser();

    const notificationsQuery = useQuery({
        queryKey: MY_NOTIFICATIONS_QUERY_KEY,
        queryFn: fetchMyNotifications,
        enabled: isAuthenticated,
        staleTime: MY_NOTIFICATIONS_STALE_TIME_MS,
        refetchOnMount: false,
    });

    const invalidateNotifications = React.useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: MY_NOTIFICATIONS_QUERY_KEY });
    }, [queryClient]);

    const markAllReadMutation = useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: invalidateNotifications,
        onError: (error: Error) => toast.error(error.message),
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => markNotificationRead(id),
        onSuccess: invalidateNotifications,
        onError: (error: Error) => toast.error(error.message),
    });

    const value = React.useMemo<NotificationsContextValue>(() => ({
        notifications: notificationsQuery.data?.notifications ?? [],
        unreadCount: notificationsQuery.data?.unreadCount ?? 0,
        isLoading: notificationsQuery.isLoading,
        isFetching: notificationsQuery.isFetching,
        markAllRead: () => markAllReadMutation.mutate(),
        markRead: (id: string) => markReadMutation.mutate(id),
        markAllReadPending: markAllReadMutation.isPending,
        markReadPending: markReadMutation.isPending,
    }), [
        notificationsQuery.data,
        notificationsQuery.isFetching,
        notificationsQuery.isLoading,
        markAllReadMutation,
        markReadMutation,
    ]);

    return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
    const context = React.useContext(NotificationsContext);
    if (!context) {
        throw new Error("useNotifications must be used within NotificationsProvider");
    }

    return context;
}

export { MY_NOTIFICATIONS_QUERY_KEY, MY_NOTIFICATIONS_STALE_TIME_MS };
