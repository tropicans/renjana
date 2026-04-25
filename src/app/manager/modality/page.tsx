"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/lib/api";
import { Loader2, Monitor, MapPin, Wifi } from "lucide-react";

export default function ManagerModalityPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: fetchDashboardStats,
    });

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const stats = data;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Modalitas Pelatihan</h1>
                <p className="text-gray-500 mt-1">Distribusi metode pembelajaran</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] text-center">
                    <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4"><Monitor className="h-7 w-7 text-blue-500" /></div>
                    <h3 className="font-bold text-lg">Daring (Online)</h3>
                    <p className="text-3xl font-extrabold text-blue-500 mt-2">{stats?.onlinePrograms ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Program tersedia</p>
                    <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10">
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Peserta</span><span className="font-bold">{stats?.onlineParticipants ?? 0}</span></div>
                        <div className="flex justify-between text-xs mt-1"><span className="text-gray-500">Completion</span><span className="font-bold text-green-600">{stats?.avgCompletion ?? 0}%</span></div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] text-center">
                    <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4"><MapPin className="h-7 w-7 text-green-500" /></div>
                    <h3 className="font-bold text-lg">Luring (Tatap Muka)</h3>
                    <p className="text-3xl font-extrabold text-green-500 mt-2">{stats?.offlinePrograms ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Program tersedia</p>
                    <div className="mt-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/10">
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Peserta</span><span className="font-bold">{stats?.offlineParticipants ?? 0}</span></div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] text-center">
                    <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4"><Wifi className="h-7 w-7 text-purple-500" /></div>
                    <h3 className="font-bold text-lg">Hybrid</h3>
                    <p className="text-3xl font-extrabold text-purple-500 mt-2">{stats?.hybridPrograms ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Program tersedia</p>
                    <div className="mt-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/10">
                        <div className="flex justify-between text-xs"><span className="text-gray-500">Peserta</span><span className="font-bold">{stats?.hybridParticipants ?? 0}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
