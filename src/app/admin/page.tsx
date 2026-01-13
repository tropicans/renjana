import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { cn } from "@/lib/utils";
import {
    BookOpen,
    Layers,
    Users,
    Activity,
    Plus,
    ArrowRight,
} from "lucide-react";

// Mock data
const mockStats = {
    totalPrograms: 8,
    totalActivities: 124,
    activeEnrollments: 412,
    monthlyEvents: 1847,
};

const mockRecentActivity = [
    { id: 1, action: "Program created", item: "Advanced Mediation Skills", user: "Admin", time: "2 hours ago" },
    { id: 2, action: "Enrollment approved", item: "Batch 2026-A (15 learners)", user: "System", time: "3 hours ago" },
    { id: 3, action: "Activity updated", item: "Module 5: Conflict Resolution", user: "Dr. Sarah", time: "5 hours ago" },
    { id: 4, action: "Program published", item: "Legal Framework Fundamentals", user: "Admin", time: "1 day ago" },
];

export default function AdminDashboardPage() {
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
                    title="Total Programs"
                    value={mockStats.totalPrograms}
                    icon={BookOpen}
                    description="Active programs"
                />
                <StatCard
                    title="Total Activities"
                    value={mockStats.totalActivities}
                    icon={Layers}
                    trend={{ value: 12, positive: true }}
                />
                <StatCard
                    title="Active Enrollments"
                    value={mockStats.activeEnrollments}
                    icon={Users}
                    trend={{ value: 8, positive: true }}
                />
                <StatCard
                    title="Events This Month"
                    value={mockStats.monthlyEvents}
                    icon={Activity}
                    description="Learning events"
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
                    href="/admin/activities"
                    className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-red-500/50 hover:shadow-lg hover:-translate-y-0.5"
                >
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <Layers className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-red-500 transition-colors">Activities</h3>
                    <p className="text-sm text-gray-500 mt-1">Define activity templates</p>
                </Link>
                <Link
                    href="/admin/enrollments"
                    className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-red-500/50 hover:shadow-lg hover:-translate-y-0.5"
                >
                    <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-red-500" />
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

            {/* Recent Activity */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Recent Activity</h2>
                    <Link
                        href="/admin/audit"
                        className="text-red-500 font-semibold hover:underline flex items-center gap-1"
                    >
                        View All
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    {mockRecentActivity.map((activity, index) => (
                        <div
                            key={activity.id}
                            className={cn(
                                "flex items-center justify-between p-5",
                                index !== mockRecentActivity.length - 1 && "border-b border-gray-100 dark:border-gray-800"
                            )}
                        >
                            <div className="space-y-1">
                                <p className="font-semibold">{activity.action}</p>
                                <p className="text-sm text-gray-500">{activity.item}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">{activity.user}</p>
                                <p className="text-xs text-gray-400">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
