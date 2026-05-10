"use client";

import React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ProtectedConsoleLayout } from "@/components/layout/protected-console-layout";
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedConsoleLayout
            allowedRoles={["ADMIN"]}
            title="Admin Control Plane"
            SidebarComponent={AdminSidebar}
        >
            {children}
        </ProtectedConsoleLayout>
    );
}
