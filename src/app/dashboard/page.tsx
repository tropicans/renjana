"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/stat-card";
import { InsightsCard, ProgressChart } from "@/components/learner/dashboard-visuals";
import { useUser } from "@/lib/context/user-context";
import { fetchDashboardStats, fetchMyEnrollments, fetchMyRegistrations } from "@/lib/api";
import {
    BookOpen,
    CheckCircle,
    Clock,
    ArrowRight,
    Sparkles,
    PlayCircle,
    Loader2,
} from "lucide-react";

export default function DashboardPage() {
    const { user, isLoading: userLoading } = useUser();

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: fetchDashboardStats,
        enabled: !!user,
    });

    const { data: enrollmentData, isLoading: enrollmentsLoading } = useQuery({
        queryKey: ["my-enrollments"],
        queryFn: fetchMyEnrollments,
        enabled: !!user,
    });

    const { data: registrationData, isLoading: registrationsLoading } = useQuery({
        queryKey: ["my-registrations"],
        queryFn: fetchMyRegistrations,
        enabled: !!user,
    });

    const enrollments = enrollmentData?.enrollments ?? [];
    const registrations = registrationData?.registrations ?? [];
    const activeEnrollment = enrollments.find((e) => e.status === "ACTIVE");
    const activeRegistration = registrations.find((registration) => ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUIRED", "APPROVED", "ACTIVE"].includes(registration.status));
    const isLoading = userLoading || statsLoading || enrollmentsLoading || registrationsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    Welcome back, {user?.name?.split(" ")[0] || "Learner"}! 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Here&apos;s what&apos;s happening with your learning journey today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Registrations"
                    value={registrations.length}
                    icon={BookOpen}
                    description="Active event records"
                />
                <StatCard
                    title="Completed Courses"
                    value={stats?.completedCourses ?? enrollments.filter((item) => item.status === "COMPLETED").length}
                    icon={CheckCircle}
                    trend={
                        stats?.completedCourses
                            ? { value: stats.completedCourses * 10, positive: true }
                            : undefined
                    }
                />
                <StatCard
                    title="Approved Events"
                    value={registrations.filter((registration) => ["APPROVED", "ACTIVE", "COMPLETED"].includes(registration.status)).length}
                    icon={Sparkles}
                    description="Ready for learning access"
                />
                <StatCard
                    title="Hours Learned"
                    value={Math.round(stats?.totalHoursLearned ?? 0)}
                    icon={Clock}
                    trend={{ value: 12, positive: true }}
                />
            </div>

            {/* AI Insights Card */}
            <InsightsCard
                userName={user?.name?.split(" ")[0] || "Learner"}
                completedCourses={stats?.completedCourses ?? 0}
                activeCourses={stats?.activeCourses ?? 0}
                totalHours={stats?.totalHoursLearned ?? 0}
            />

            {/* Next Action - Prominent CTA */}
            {activeEnrollment ? (
                <div className="rounded-3xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-primary text-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
                                    Continue Learning
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold">{activeEnrollment.course.title}</h2>
                        </div>
                        <div className="flex items-center gap-6">
                            <ProgressChart completionPercentage={activeEnrollment.completionPercentage} />
                            <Link
                                href={`/learn/${activeEnrollment.courseId}`}
                                className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
                            >
                                <PlayCircle className="h-5 w-5" />
                                Resume Course
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            ) : activeRegistration ? (
                <div className="rounded-3xl border-2 border-sky-200 bg-sky-50 p-8 dark:border-sky-800 dark:bg-sky-950/20">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-3">
                            <span className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
                                Registration Status
                            </span>
                            <h2 className="text-2xl font-bold">{activeRegistration.event.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Status saat ini: <span className="font-semibold text-sky-700 dark:text-sky-300">{activeRegistration.status}</span>. Lengkapi revisi atau tunggu verifikasi admin sebelum akses pembelajaran dibuka.
                            </p>
                        </div>
                        <Link
                            href="/my-registrations"
                            className="bg-sky-600 text-white px-8 py-4 rounded-full font-bold hover:bg-sky-700 transition-all flex items-center gap-2 shadow-lg shadow-sky-500/20 shrink-0"
                        >
                            Lihat Registrasi
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            ) : enrollments.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold">Start Your Learning Journey</h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Jelajahi kegiatan aktif lalu lanjutkan pendaftaran event pertama Anda.
                            </p>
                        </div>
                        <Link
                            href="/events"
                            className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
                        >
                            Explore Events
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="rounded-3xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-8">
                    <div className="flex items-center gap-4">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <div>
                            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                                All Courses Completed! 🎉
                            </h2>
                            <p className="text-green-600 dark:text-green-500">
                                Great job! Browse more courses to continue learning.
                            </p>
                        </div>
                    </div>
                </div>
            )
            }

            {/* My Enrolled Courses */}
            {
                enrollments.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">My Courses</h2>
                            <Link href="/events" className="text-sm text-primary hover:underline">
                                View All Events
                            </Link>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {enrollments.map((e) => (
                                <Link
                                    key={e.id}
                                    href={`/learn/${e.courseId}`}
                                    className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] hover:border-primary/50 transition-all group"
                                >
                                    <h3 className="font-bold group-hover:text-primary transition-colors">
                                        {e.course.title}
                                    </h3>
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                                            <span>{e.status === "COMPLETED" ? "Completed" : "In Progress"}</span>
                                            <span>{e.completionPercentage}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${e.completionPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <Link
                        href="/events"
                        className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] hover:border-primary/50 transition-all group"
                    >
                        <BookOpen className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-bold group-hover:text-primary transition-colors">Browse Events</h3>
                        <p className="text-sm text-gray-500 mt-1">Lihat kegiatan yang sedang dibuka</p>
                    </Link>
                    <Link
                        href="/my-registrations"
                        className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] hover:border-primary/50 transition-all group"
                    >
                        <Sparkles className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-bold group-hover:text-primary transition-colors">My Registrations</h3>
                        <p className="text-sm text-gray-500 mt-1">Pantau status, dokumen, dan pembayaran</p>
                    </Link>
                    <Link
                        href="/dashboard/evaluations"
                        className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] hover:border-primary/50 transition-all group"
                    >
                        <CheckCircle className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-bold group-hover:text-primary transition-colors">Evaluations</h3>
                        <p className="text-sm text-gray-500 mt-1">Isi evaluasi penyelenggaraan saat dibuka</p>
                    </Link>
                </div>
            </div>
        </div >
    );
}
