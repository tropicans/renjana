"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInstructorStats } from "@/lib/api";
import { Users, Target, TrendingUp, BookOpen, Loader2, CheckCircle, Clock } from "lucide-react";

function StatCard({ title, value, icon: Icon, color, sub }: { title: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) {
    return (
        <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}><Icon className="h-5 w-5" /></div>
                <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-gray-500">{title}</p>{sub && <p className="text-xs text-green-500 mt-0.5">{sub}</p>}</div>
            </div>
        </div>
    );
}

export default function ManagerDashboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["instructor-stats"],
        queryFn: fetchInstructorStats,
    });

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const stats = data?.stats;
    const recent = data?.recentEnrollments ?? [];
    const completionRate = stats && stats.totalEnrollments > 0 ? Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100) : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Manager Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview performa organisasi</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Peserta" value={stats?.totalEnrollments ?? 0} icon={Users} color="bg-blue-500/10 text-blue-500" />
                <StatCard title="Rata-rata Progress" value={`${stats?.avgProgress ?? 0}%`} icon={Target} color="bg-primary/10 text-primary" />
                <StatCard title="Completion Rate" value={`${completionRate}%`} icon={CheckCircle} color="bg-green-500/10 text-green-500" />
                <StatCard title="Total Program" value={stats?.totalCourses ?? 0} icon={TrendingUp} color="bg-amber-500/10 text-amber-500" />
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Aktivitas Terbaru</h2>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    {recent.map((e, i) => (
                        <div key={e.id} className={`p-5 flex items-center justify-between ${i < recent.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-4 w-4 text-primary" /></div>
                                <div><p className="font-semibold text-sm">{e.user.fullName}</p><p className="text-xs text-gray-500">Mendaftar: {e.course.title}</p></div>
                            </div>
                            <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(e.enrolledAt).toLocaleDateString("id-ID")}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
