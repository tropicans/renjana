"use client";

import React from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Header } from "@/components/dashboard/header";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/dashboard-routing";

type SidebarComponentProps = {
    collapsed: boolean;
    onToggle: () => void;
};

type ProtectedConsoleLayoutProps = {
    allowedRoles: UserRole[];
    title: string;
    SidebarComponent: React.ComponentType<SidebarComponentProps>;
    children: React.ReactNode;
};

export function ProtectedConsoleLayout({
    allowedRoles,
    title,
    SidebarComponent,
    children,
}: ProtectedConsoleLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <RouteGuard allowedRoles={allowedRoles}>
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                {mobileMenuOpen ? (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                ) : null}

                <div className={cn("lg:block", mobileMenuOpen ? "block" : "hidden")}>
                    <SidebarComponent
                        collapsed={sidebarCollapsed}
                        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    />
                </div>

                <Header
                    sidebarCollapsed={sidebarCollapsed}
                    onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    title={title}
                />

                <main
                    className={cn(
                        "min-h-screen pt-16 transition-all duration-300",
                        sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
                    )}
                >
                    <div className="p-6 lg:p-8">{children}</div>
                </main>
            </div>
        </RouteGuard>
    );
}
