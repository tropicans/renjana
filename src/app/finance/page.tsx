"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, fetchFinanceRegistrations } from "@/lib/api";
import { Loader2, DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";
import { formatRupiah } from "@/lib/events";

export default function FinanceDashboardPage() {
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: fetchDashboardStats,
    });

    const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
        queryKey: ["finance-registrations"],
        queryFn: fetchFinanceRegistrations,
    });

    if (statsLoading || registrationsLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const stats = statsData;
    const registrations = registrationsData?.registrations ?? [];
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Keuangan</h1>
                <p className="text-gray-500 mt-1">Overview pendapatan dan enrollment</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-green-500" /></div><div><p className="text-xl font-bold">{formatRupiah(stats?.totalCollected)}</p><p className="text-xs text-gray-500">Pembayaran Terkumpul</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><CreditCard className="h-5 w-5 text-blue-500" /></div><div><p className="text-xl font-bold">{stats?.verifiedPayments ?? 0}</p><p className="text-xs text-gray-500">Pembayaran Terverifikasi</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary" /></div><div><p className="text-xl font-bold">{formatRupiah(stats?.totalBilled)}</p><p className="text-xs text-gray-500">Nilai Tertagih</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Users className="h-5 w-5 text-amber-500" /></div><div><p className="text-xl font-bold">{stats?.pendingPayments ?? 0}</p><p className="text-xs text-gray-500">Menunggu Verifikasi</p></div></div>
                </div>
            </div>

            {/* Recent registrations as transactions */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Transaksi Terbaru</h2>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500"><th className="p-4 font-semibold">Peserta</th><th className="p-4 font-semibold">Event</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold text-right">Nilai</th></tr></thead>
                        <tbody>
                            {registrations.slice(0, 10).map((registration) => (
                                <tr key={registration.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                                    <td className="p-4 font-medium">{registration.user.fullName}</td>
                                    <td className="p-4 text-gray-500">{registration.event.title}</td>
                                    <td className="p-4 text-gray-500 text-xs">{registration.paymentStatus}</td>
                                    <td className="p-4 text-right font-semibold text-green-600">{formatRupiah(registration.totalFee)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
