"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ProtectedConsoleLayout } from "@/components/layout/protected-console-layout";
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedConsoleLayout
            allowedRoles={["LEARNER"]}
            title="Learner Dashboard"
            SidebarComponent={Sidebar}
        >
            {children}
        </ProtectedConsoleLayout>
    );
}
