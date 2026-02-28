"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInstructorLearners } from "@/lib/api";
import Link from "next/link";
import { Users, Search, Loader2, CheckCircle, Clock, Award, TrendingUp } from "lucide-react";

export default function InstructorLearnersPage() {
    const [search, setSearch] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["instructor-learners"],
        queryFn: fetchInstructorLearners,
    });

    const enrollments = data?.enrollments ?? [];
    const stats = data?.stats;

    const filtered = search
        ? enrollments.filter(e => e.user.fullName.toLowerCase().includes(search.toLowerCase()) || e.course.title.toLowerCase().includes(search.toLowerCase()))
        : enrollments;

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Peserta Didik</h1>
                <p className="text-gray-500 mt-1">{stats?.totalLearners ?? 0} peserta terdaftar</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Users className="h-5 w-5 text-blue-500" /></div><div><p className="text-2xl font-bold">{stats?.totalLearners}</p><p className="text-xs text-gray-500">Total Peserta</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Clock className="h-5 w-5 text-amber-500" /></div><div><p className="text-2xl font-bold">{stats?.activeEnrollments}</p><p className="text-xs text-gray-500">Sedang Belajar</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-500" /></div><div><p className="text-2xl font-bold">{stats?.completedEnrollments}</p><p className="text-xs text-gray-500">Lulus</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats?.avgCompletion}%</p><p className="text-xs text-gray-500">Rata-rata</p></div></div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Cari peserta atau program..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm" />
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500"><th className="p-4 font-semibold">Peserta</th><th className="p-4 font-semibold">Program</th><th className="p-4 font-semibold">Progress</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold">Sertifikat</th></tr></thead>
                    <tbody>
                        {filtered.map(e => (
                            <tr key={e.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all">
                                <td className="p-4"><Link href={`/instructor/learners/${e.userId}`} className="hover:text-primary"><p className="font-medium">{e.user.fullName}</p><p className="text-xs text-gray-500">{e.user.email}</p></Link></td>
                                <td className="p-4 text-gray-500">{e.course.title}</td>
                                <td className="p-4"><div className="flex items-center gap-2"><div className="w-20 h-2 rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-primary" style={{ width: `${e.completionPercentage}%` }} /></div><span className="text-xs">{e.completionPercentage}%</span></div></td>
                                <td className="p-4">{e.status === "COMPLETED" ? <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Selesai</span> : <span className="text-xs text-amber-600 font-semibold">Aktif</span>}</td>
                                <td className="p-4">{e.certificate ? <span className="text-xs text-primary flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Issued</span> : <span className="text-xs text-gray-400">—</span>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
