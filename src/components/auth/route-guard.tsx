"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getDashboardUrl, useRequireAuth } from "@/lib/context/user-context";
import type { UserRole } from "@/lib/data/users";

interface RouteGuardProps {
    children: ReactNode;
    allowedRoles?: UserRole[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
    const router = useRouter();
    const { user, isLoading, isAuthenticated, hasAccess } = useRequireAuth(allowedRoles);

    useEffect(() => {
        if (isLoading) {
            return;
        }

        if (!isAuthenticated) {
            router.replace("/login");
            return;
        }

        if (!hasAccess && user) {
            router.replace(getDashboardUrl(user.role));
        }
    }, [hasAccess, isAuthenticated, isLoading, router, user]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || !hasAccess) {
        return null;
    }

    return <>{children}</>;
}
