"use client";

import React from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <RouteGuard allowedRoles={["LEARNER", "INSTRUCTOR", "MANAGER", "FINANCE", "ADMIN"]}>
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                {/* Mobile overlay */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar - hidden on mobile unless open */}
                <div
                    className={cn(
                        "lg:block",
                        mobileMenuOpen ? "block" : "hidden"
                    )}
                >
                    <Sidebar
                        collapsed={sidebarCollapsed}
                        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    />
                </div>

                {/* Header */}
                <Header
                    sidebarCollapsed={sidebarCollapsed}
                    onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    title="Learner Dashboard"
                />

                {/* Main content */}
                <main
                    className={cn(
                        "min-h-screen pt-16 transition-all duration-300",
                        sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
                    )}
                >
                    <div className="p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </RouteGuard>
    );
}
