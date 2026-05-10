"use client";

import React from "react";
import { ManagerSidebar } from "@/components/manager/manager-sidebar";
import { ProtectedConsoleLayout } from "@/components/layout/protected-console-layout";
export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedConsoleLayout
            allowedRoles={["MANAGER"]}
            title="HR Manager Dashboard"
            SidebarComponent={ManagerSidebar}
        >
            {children}
        </ProtectedConsoleLayout>
    );
}
