"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminEnrollments } from "@/lib/api";
import { Loader2, Receipt } from "lucide-react";

export default function TransactionsPage() {
    const { data, isLoading } = useQuery({ queryKey: ["admin-enrollments"], queryFn: fetchAdminEnrollments });
    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    const enrollments = data?.enrollments ?? [];
    const basePrice = 2500000;

    return (
        <div className="space-y-8">
            <div><h1 className="text-3xl font-extrabold tracking-tight">Transaksi</h1><p className="text-gray-500 mt-1">{enrollments.length} transaksi</p></div>
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500"><th className="p-4 font-semibold">ID</th><th className="p-4 font-semibold">Peserta</th><th className="p-4 font-semibold">Program</th><th className="p-4 font-semibold">Tanggal</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold text-right">Nilai</th></tr></thead>
                    <tbody>
                        {enrollments.map(e => (
                            <tr key={e.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                                <td className="p-4 text-xs text-gray-400 font-mono">#{e.id.slice(0, 8)}</td>
                                <td className="p-4 font-medium">{e.user.fullName}</td>
                                <td className="p-4 text-gray-500">{e.course.title}</td>
                                <td className="p-4 text-xs text-gray-500">{new Date(e.enrolledAt).toLocaleDateString("id-ID")}</td>
                                <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full font-semibold ${e.status === "COMPLETED" ? "bg-green-50 text-green-600 dark:bg-green-900/20" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20"}`}>{e.status === "COMPLETED" ? "Lunas" : "Aktif"}</span></td>
                                <td className="p-4 text-right font-semibold">Rp {basePrice.toLocaleString("id-ID")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
