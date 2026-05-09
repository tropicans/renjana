"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@/lib/context/user-context";
import { NotificationsProvider } from "@/lib/context/notifications-context";
import { ToastProvider } from "@/components/ui/toast";
import { LanguageProvider } from "@/lib/i18n";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30 * 1000, // 30 seconds
                        retry: 1,
                    },
                },
            })
    );

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <LanguageProvider>
                    <UserProvider>
                        <ToastProvider>
                            <NotificationsProvider>
                                {children}
                            </NotificationsProvider>
                        </ToastProvider>
                    </UserProvider>
                </LanguageProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
