"use client";

import React from "react";
import { InstructorSidebar } from "@/components/instructor/instructor-sidebar";
import { ProtectedConsoleLayout } from "@/components/layout/protected-console-layout";
export default function InstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedConsoleLayout
            allowedRoles={["INSTRUCTOR"]}
            title="Instructor Console"
            SidebarComponent={InstructorSidebar}
        >
            {children}
        </ProtectedConsoleLayout>
    );
}
