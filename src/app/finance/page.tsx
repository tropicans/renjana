"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInstructorStats, fetchAdminEnrollments } from "@/lib/api";
import { Loader2, DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";

export default function FinanceDashboardPage() {
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ["instructor-stats"],
        queryFn: fetchInstructorStats,
    });

    const { data: enrollData, isLoading: enrollLoading } = useQuery({
        queryKey: ["admin-enrollments"],
        queryFn: fetchAdminEnrollments,
    });

    if (statsLoading || enrollLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const stats = statsData?.stats;
    const enrollments = enrollData?.enrollments ?? [];
    const basePrice = 2500000; // IDR per enrollment (configurable)
    const totalRevenue = enrollments.length * basePrice;
    const completedRevenue = enrollments.filter(e => e.status === "COMPLETED").length * basePrice;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Keuangan</h1>
                <p className="text-gray-500 mt-1">Overview pendapatan dan enrollment</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-green-500" /></div><div><p className="text-xl font-bold">Rp {(totalRevenue / 1000000).toFixed(1)}M</p><p className="text-xs text-gray-500">Estimasi Total Pendapatan</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><CreditCard className="h-5 w-5 text-blue-500" /></div><div><p className="text-xl font-bold">{enrollments.length}</p><p className="text-xs text-gray-500">Total Enrollment</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary" /></div><div><p className="text-xl font-bold">Rp {(basePrice / 1000000).toFixed(1)}M</p><p className="text-xs text-gray-500">Harga per Enrollment</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Users className="h-5 w-5 text-amber-500" /></div><div><p className="text-xl font-bold">{stats?.totalCourses ?? 0}</p><p className="text-xs text-gray-500">Program Aktif</p></div></div>
                </div>
            </div>

            {/* Recent Enrollments as "Transactions" */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Transaksi Terbaru</h2>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500"><th className="p-4 font-semibold">Peserta</th><th className="p-4 font-semibold">Program</th><th className="p-4 font-semibold">Tanggal</th><th className="p-4 font-semibold text-right">Nilai</th></tr></thead>
                        <tbody>
                            {enrollments.slice(0, 10).map(e => (
                                <tr key={e.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                                    <td className="p-4 font-medium">{e.user.fullName}</td>
                                    <td className="p-4 text-gray-500">{e.course.title}</td>
                                    <td className="p-4 text-gray-500 text-xs">{new Date(e.enrolledAt).toLocaleDateString("id-ID")}</td>
                                    <td className="p-4 text-right font-semibold text-green-600">Rp {basePrice.toLocaleString("id-ID")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
