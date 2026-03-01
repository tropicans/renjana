"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/stat-card";
import { AdminTrendChart } from "@/components/admin/admin-charts";
import { fetchDashboardStats, fetchAdminUsers, fetchCourses } from "@/lib/api";
import {
    BookOpen,
    Layers,
    Users,
    Activity,
    Plus,
    ArrowRight,
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
                        Manage programs, activities, and enrollments
                    </p>
                </div>
                <Link
                    href="/admin/programs/new"
                    className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                >
                    <Plus className="h-4 w-4" />
                    New Program
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Courses"
                    value={stats?.totalCourses ?? 0}
                    icon={BookOpen}
                    description="Published programs"
                />
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers ?? 0}
                    icon={Users}
                />
                <StatCard
                    title="Active Enrollments"
                    value={stats?.activeEnrollments ?? 0}
                    icon={Layers}
                    trend={{ value: 8, positive: true }}
                />
                <StatCard
                    title="Completed"
                    value={stats?.completedEnrollments ?? 0}
                    icon={Activity}
                    description="Enrollments completed"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                    href="/admin/programs"
                    className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-red-500/50 hover:shadow-lg hover:-translate-y-0.5"
                >
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <BookOpen className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-red-500 transition-colors">Programs</h3>
                    <p className="text-sm text-gray-500 mt-1">Create and manage learning programs</p>
                </Link>
                <Link
                    href="/admin/users"
                    className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-red-500/50 hover:shadow-lg hover:-translate-y-0.5"
                >
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-red-500 transition-colors">Users</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage all users</p>
                </Link>
                <Link
                    href="/admin/enrollments"
                    className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-red-500/50 hover:shadow-lg hover:-translate-y-0.5"
                >
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <Layers className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-red-500 transition-colors">Enrollments</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage enrollment logic</p>
                </Link>
                <Link
                    href="/admin/audit"
                    className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-red-500/50 hover:shadow-lg hover:-translate-y-0.5"
                >
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <Activity className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-red-500 transition-colors">Audit Log</h3>
                    <p className="text-sm text-gray-500 mt-1">View system activity</p>
                </Link>
            </div>

            {/* Trends Chart */}
            {(coursesData?.courses ?? []).length > 0 && (
                <div className="mt-8">
                    <AdminTrendChart coursesData={coursesData!.courses} />
                </div>
            )}

            {/* Recent Users */}
            {recentUsers.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Recent Users</h2>
                        <Link
                            href="/admin/users"
                            className="text-red-500 font-semibold hover:underline flex items-center gap-1"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
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
                                        {u._count.enrollments} enrollments
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Courses Overview */}
            {(coursesData?.courses ?? []).length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">All Courses</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {(coursesData?.courses ?? []).map((c) => (
                            <div
                                key={c.id}
                                className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]"
                            >
                                <h3 className="font-bold">{c.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                                <div className="flex gap-4 mt-3 text-xs text-gray-400">
                                    <span>{c._count.modules} modules</span>
                                    <span>{c.totalLessons} lessons</span>
                                    <span>{c._count.enrollments} enrolled</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
