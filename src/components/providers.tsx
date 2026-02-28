"use client";

import { SessionProvider } from "next-auth/react";
import { UserProvider } from "@/lib/context/user-context";
import { ToastProvider } from "@/components/ui/toast";
import { LanguageProvider } from "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <LanguageProvider>
                <UserProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </UserProvider>
            </LanguageProvider>
        </SessionProvider>
    );
}
