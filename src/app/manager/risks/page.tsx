"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInstructorLearners } from "@/lib/api";
import { Loader2, AlertTriangle, Users, TrendingDown } from "lucide-react";

export default function ManagerRisksPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["instructor-learners"],
        queryFn: fetchInstructorLearners,
    });

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const enrollments = data?.enrollments ?? [];
    // Risk = active enrollments with low progress
    const atRisk = enrollments.filter(e => e.status === "ACTIVE" && e.completionPercentage < 30);
    const stalled = enrollments.filter(e => e.status === "ACTIVE" && e.completionPercentage >= 30 && e.completionPercentage < 70);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Risk Assessment</h1>
                <p className="text-gray-500 mt-1">Identifikasi peserta yang membutuhkan perhatian</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-5 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-red-500" /></div><div><p className="text-2xl font-bold text-red-600">{atRisk.length}</p><p className="text-xs text-red-500/70">High Risk (progress &lt; 30%)</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><TrendingDown className="h-5 w-5 text-amber-500" /></div><div><p className="text-2xl font-bold text-amber-600">{stalled.length}</p><p className="text-xs text-amber-500/70">Medium Risk (progress 30-70%)</p></div></div>
                </div>
            </div>

            {atRisk.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-red-600 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Peserta High Risk</h2>
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                        {atRisk.map((e, i) => (
                            <div key={e.id} className={`p-5 flex items-center justify-between ${i < atRisk.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                                <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-red-500/10 flex items-center justify-center"><Users className="h-4 w-4 text-red-500" /></div><div><p className="font-semibold">{e.user.fullName}</p><p className="text-xs text-gray-500">{e.course.title}</p></div></div>
                                <div className="flex items-center gap-3"><div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-red-500" style={{ width: `${e.completionPercentage}%` }} /></div><span className="text-xs font-semibold text-red-600">{e.completionPercentage}%</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {stalled.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-amber-600 flex items-center gap-2"><TrendingDown className="h-5 w-5" /> Peserta Medium Risk</h2>
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                        {stalled.map((e, i) => (
                            <div key={e.id} className={`p-5 flex items-center justify-between ${i < stalled.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                                <div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center"><Users className="h-4 w-4 text-amber-500" /></div><div><p className="font-semibold">{e.user.fullName}</p><p className="text-xs text-gray-500">{e.course.title}</p></div></div>
                                <div className="flex items-center gap-3"><div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-amber-500" style={{ width: `${e.completionPercentage}%` }} /></div><span className="text-xs font-semibold text-amber-600">{e.completionPercentage}%</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {atRisk.length === 0 && stalled.length === 0 && (
                <div className="text-center py-12 text-gray-500 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    ✅ Tidak ada peserta yang berisiko tertinggal.
                </div>
            )}
        </div>
    );
}
