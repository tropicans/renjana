"use client";

import React from "react";
import { FinanceSidebar } from "@/components/finance/finance-sidebar";
import { ProtectedConsoleLayout } from "@/components/layout/protected-console-layout";
export default function FinanceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedConsoleLayout
            allowedRoles={["FINANCE"]}
            title="Finance Console"
            SidebarComponent={FinanceSidebar}
        >
            {children}
        </ProtectedConsoleLayout>
    );
}
