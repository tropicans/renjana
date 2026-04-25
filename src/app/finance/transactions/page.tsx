"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFinanceRegistrations } from "@/lib/api";
import { formatRupiah } from "@/lib/events";
import { Loader2 } from "lucide-react";

export default function TransactionsPage() {
    const { data, isLoading } = useQuery({ queryKey: ["finance-registrations"], queryFn: fetchFinanceRegistrations });
    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    const registrations = data?.registrations ?? [];

    return (
        <div className="space-y-8">
            <div><h1 className="text-3xl font-extrabold tracking-tight">Transaksi</h1><p className="text-gray-500 mt-1">{registrations.length} transaksi</p></div>
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500"><th className="p-4 font-semibold">ID</th><th className="p-4 font-semibold">Peserta</th><th className="p-4 font-semibold">Event</th><th className="p-4 font-semibold">Tanggal</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold text-right">Nilai</th></tr></thead>
                    <tbody>
                        {registrations.map((registration) => (
                            <tr key={registration.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                                <td className="p-4 text-xs text-gray-400 font-mono">#{registration.id.slice(0, 8)}</td>
                                <td className="p-4 font-medium">{registration.user.fullName}</td>
                                <td className="p-4 text-gray-500">{registration.event.title}</td>
                                <td className="p-4 text-xs text-gray-500">{new Date(registration.createdAt).toLocaleDateString("id-ID")}</td>
                                <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full font-semibold ${registration.paymentStatus === "VERIFIED" ? "bg-green-50 text-green-600 dark:bg-green-900/20" : registration.paymentStatus === "REJECTED" ? "bg-red-50 text-red-600 dark:bg-red-900/20" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20"}`}>{registration.paymentStatus}</span></td>
                                <td className="p-4 text-right font-semibold">{formatRupiah(registration.totalFee)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
