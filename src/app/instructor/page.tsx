"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInstructorStats } from "@/lib/api";
import { InstructorTrendChart } from "@/components/instructor/instructor-charts";
import { BookOpen, Users, CheckCircle, MapPin, FileText, TrendingUp, Loader2, Clock } from "lucide-react";

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) {
    return (
        <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-gray-500">{title}</p>
                </div>
            </div>
        </div>
    );
}

export default function InstructorDashboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["instructor-stats"],
        queryFn: fetchInstructorStats,
    });

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const stats = data?.stats;
    const recent = data?.recentEnrollments ?? [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Instruktur</h1>
                <p className="text-gray-500 mt-1">Overview aktivitas pelatihan</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total Program" value={stats?.totalCourses ?? 0} icon={BookOpen} color="bg-primary/10 text-primary" />
                <StatCard title="Peserta Aktif" value={stats?.totalEnrollments ?? 0} icon={Users} color="bg-blue-500/10 text-blue-500" />
                <StatCard title="Selesai" value={stats?.completedEnrollments ?? 0} icon={CheckCircle} color="bg-green-500/10 text-green-500" />
                <StatCard title="Kehadiran" value={stats?.totalAttendances ?? 0} icon={MapPin} color="bg-amber-500/10 text-amber-500" />
                <StatCard title="Evidence" value={stats?.totalEvidences ?? 0} icon={FileText} color="bg-purple-500/10 text-purple-500" />
                <StatCard title="Rata-rata Progress" value={`${stats?.avgProgress ?? 0}%`} icon={TrendingUp} color="bg-cyan-500/10 text-cyan-500" />
            </div>

            {/* Trends Chart */}
            {((stats as any)?.courses ?? []).length > 0 && (
                <div className="mt-8">
                    <InstructorTrendChart courses={(stats as any).courses} />
                </div>
            )}

            {/* Recent Enrollments */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Pendaftaran Terbaru</h2>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    {recent.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Belum ada pendaftaran.</div>
                    ) : (
                        recent.map((e, i) => (
                            <div key={e.id} className={`p-5 flex items-center justify-between ${i !== recent.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                                <div>
                                    <p className="font-semibold">{e.user.fullName}</p>
                                    <p className="text-sm text-gray-500">{e.course.title}</p>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(e.enrolledAt).toLocaleDateString("id-ID")}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
