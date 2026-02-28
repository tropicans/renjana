"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminEnrollments } from "@/lib/api";
import { Loader2, FileText } from "lucide-react";

export default function InvoicesPage() {
    const { data, isLoading } = useQuery({ queryKey: ["admin-enrollments"], queryFn: fetchAdminEnrollments });
    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    const enrollments = data?.enrollments ?? [];

    return (
        <div className="space-y-8">
            <div><h1 className="text-3xl font-extrabold tracking-tight">Invoices</h1><p className="text-gray-500 mt-1">{enrollments.length} invoice</p></div>
            <div className="grid gap-4">
                {enrollments.map(e => (
                    <div key={e.id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><FileText className="h-5 w-5 text-blue-500" /></div>
                            <div><p className="font-semibold text-sm">INV-{e.id.slice(0, 8).toUpperCase()}</p><p className="text-xs text-gray-500">{e.user.fullName} — {e.course.title}</p></div>
                        </div>
                        <div className="text-right"><p className="font-bold">Rp 2.500.000</p><p className="text-xs text-gray-500">{new Date(e.enrolledAt).toLocaleDateString("id-ID")}</p></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
