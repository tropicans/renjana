"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/stat-card";
import { AdminTrendChart } from "@/components/admin/admin-charts";
import { fetchDashboardStats, fetchAdminUsers, fetchCourses } from "@/lib/api";
import {
    BookOpen,
    CalendarDays,
    Layers,
    Users,
    Activity,
    Plus,
    Loader2,
} from "lucide-react";

export default function AdminDashboardPage() {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: fetchDashboardStats,
    });

    const { data: usersData } = useQuery({
        queryKey: ["admin-users"],
        queryFn: fetchAdminUsers,
    });

    const { data: coursesData } = useQuery({
        queryKey: ["courses"],
        queryFn: () => fetchCourses(),
    });

    if (statsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const recentUsers = (usersData?.users ?? []).slice(0, 4);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Admin Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Kelola event, pelatihan, registrasi, dan audit trail
                    </p>
                </div>
                <Link
                    href="/admin/pelatihan/new"
                    className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                >
                    <Plus className="h-4 w-4" />
                    Pelatihan Baru
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Pelatihan"
                    value={stats?.totalCourses ?? 0}
                    icon={BookOpen}
                    description="Pelatihan yang sudah dipublikasikan"
                />
                <StatCard
                    title="Total Event"
                    value={stats?.totalEvents ?? 0}
                    icon={CalendarDays}
                    description="Event yang sudah dibuat"
                />
                <StatCard
                    title="Total Pengguna"
                    value={stats?.totalUsers ?? 0}
                    icon={Users}
                />
                <StatCard
                    title="Enrollment Aktif"
                    value={stats?.activeEnrollments ?? 0}
                    icon={Layers}
                    trend={{ value: 8, positive: true }}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                    href="/admin/pelatihan"
                    className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-red-500/50 hover:shadow-lg hover:-translate-y-0.5"
                >
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <BookOpen className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-red-500 transition-colors">Pelatihan</h3>
                    <p className="text-sm text-gray-500 mt-1">Buat dan kelola katalog pelatihan</p>
                </Link>
                <Link
                    href="/admin/events"
                    className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-red-500/50 hover:shadow-lg hover:-translate-y-0.5"
                >
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <CalendarDays className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-red-500 transition-colors">Events</h3>
                    <p className="text-sm text-gray-500 mt-1">Kelola lifecycle event dan kesiapan pembelajaran</p>
                </Link>
                <Link
                    href="/admin/registrations"
                    className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-red-500/50 hover:shadow-lg hover:-translate-y-0.5"
                >
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <Layers className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-red-500 transition-colors">Registrasi</h3>
                    <p className="text-sm text-gray-500 mt-1">Tinjau approval peserta dan intake event</p>
                </Link>
                <Link
                    href="/admin/audit"
                    className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-red-500/50 hover:shadow-lg hover:-translate-y-0.5"
                >
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <Activity className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-red-500 transition-colors">Log Audit</h3>
                    <p className="text-sm text-gray-500 mt-1">Lihat aktivitas sistem</p>
                </Link>
            </div>

            {/* Trends Chart */}
            {(coursesData?.courses ?? []).length > 0 && (
                <div className="mt-8">
                    <AdminTrendChart coursesData={coursesData!.courses} />
                </div>
            )}

            {/* Pengguna Terbaru */}
            {recentUsers.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Pengguna Terbaru</h2>
                    </div>
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                        {recentUsers.map((u, index) => (
                            <div
                                key={u.id}
                                className={`flex items-center justify-between p-5 ${index !== recentUsers.length - 1
                                    ? "border-b border-gray-100 dark:border-gray-800"
                                    : ""
                                    }`}
                            >
                                <div className="space-y-1">
                                    <p className="font-semibold">{u.fullName}</p>
                                    <p className="text-sm text-gray-500">{u.email}</p>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                        {u.role}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {u._count.enrollments} enrollment
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pelatihan Overview */}
            {(coursesData?.courses ?? []).length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Semua Pelatihan</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {(coursesData?.courses ?? []).map((c) => (
                            <div
                                key={c.id}
                                className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]"
                            >
                                <h3 className="font-bold">{c.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                                <div className="flex gap-4 mt-3 text-xs text-gray-400">
                                    <span>{c._count.modules} modul</span>
                                    <span>{c.totalLessons} lesson</span>
                                    <span>{c._count.enrollments} peserta</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
