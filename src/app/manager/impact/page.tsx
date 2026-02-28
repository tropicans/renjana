"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInstructorLearners } from "@/lib/api";
import { Loader2, Award, TrendingUp, Target, Clock } from "lucide-react";

export default function ManagerImpactPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["instructor-learners"],
        queryFn: fetchInstructorLearners,
    });

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const enrollments = data?.enrollments ?? [];
    const stats = data?.stats;
    const certCount = enrollments.filter(e => e.certificate).length;
    const completionRate = stats && stats.activeEnrollments + stats.completedEnrollments > 0 ? Math.round((stats.completedEnrollments / (stats.activeEnrollments + stats.completedEnrollments)) * 100) : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Training Impact</h1>
                <p className="text-gray-500 mt-1">Dampak dan efektivitas program pelatihan</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center"><Award className="h-5 w-5 text-green-500" /></div><div><p className="text-2xl font-bold">{certCount}</p><p className="text-xs text-gray-500">Sertifikasi Diterbitkan</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats?.avgCompletion ?? 0}%</p><p className="text-xs text-gray-500">Rata-rata Penyelesaian</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Target className="h-5 w-5 text-blue-500" /></div><div><p className="text-2xl font-bold">{completionRate}%</p><p className="text-xs text-gray-500">Completion Rate</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Clock className="h-5 w-5 text-amber-500" /></div><div><p className="text-2xl font-bold">{stats?.totalLearners ?? 0}</p><p className="text-xs text-gray-500">Peserta Aktif</p></div></div>
                </div>
            </div>

            {/* Completion leaderboard */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Peserta dengan Sertifikat</h2>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    {enrollments.filter(e => e.certificate).length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Belum ada peserta bersertifikat.</div>
                    ) : (
                        enrollments.filter(e => e.certificate).map((e, i) => (
                            <div key={e.id} className={`p-5 flex items-center justify-between ${i < enrollments.filter(e => e.certificate).length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                                <div><p className="font-semibold">{e.user.fullName}</p><p className="text-xs text-gray-500">{e.course.title}</p></div>
                                <span className="text-xs text-green-600 flex items-center gap-1"><Award className="h-4 w-4" /> {new Date(e.certificate!.issuedAt).toLocaleDateString("id-ID")}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
