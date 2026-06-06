"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/stat-card";
import { fetchDashboardStats, fetchMyEnrollments, fetchMyRegistrations } from "@/features/client/api/learner";
import { fetchEvidences } from "@/lib/api";
import { isActiveRegistrationWorkflow, isLearningAccessibleRegistration } from "@/lib/domain/registration-rules";
import { useUser } from "@/lib/context/user-context";
import {
    BookOpen,
    CheckCircle,
    Clock,
    ArrowRight,
    Sparkles,
    PlayCircle,
    Loader2,
    Star,
} from "lucide-react";

const InsightsCard = dynamic(() => import("@/components/learner/dashboard-visuals").then((mod) => mod.InsightsCard), {
    ssr: false,
});
const ProgressChart = dynamic(() => import("@/components/learner/dashboard-visuals").then((mod) => mod.ProgressChart), {
    ssr: false,
});

const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name ? name.substring(0, 2).toUpperCase() : "LN";
};

export default function DashboardPage() {
    const { user, isLoading: userLoading } = useUser();

    const learnerQueryOptions = {
        enabled: !!user,
        staleTime: 60_000,
        refetchOnWindowFocus: false as const,
    };

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: fetchDashboardStats,
        ...learnerQueryOptions,
    });

    const { data: enrollmentData, isLoading: enrollmentsLoading } = useQuery({
        queryKey: ["my-enrollments"],
        queryFn: fetchMyEnrollments,
        ...learnerQueryOptions,
    });

    const { data: registrationData, isLoading: registrationsLoading } = useQuery({
        queryKey: ["my-registrations"],
        queryFn: fetchMyRegistrations,
        ...learnerQueryOptions,
    });

    const { data: evidenceData, isLoading: evidencesLoading } = useQuery({
        queryKey: ["my-evidences"],
        queryFn: fetchEvidences,
        ...learnerQueryOptions,
    });

    const enrollments = enrollmentData?.enrollments ?? [];
    const registrations = registrationData?.registrations ?? [];
    const evidences = evidenceData?.evidences ?? [];
    const activeEnrollment = enrollments.find((e) => e.status === "ACTIVE");
    const activeRegistration = registrations.find((registration) => isActiveRegistrationWorkflow(registration.status));
    const isLoading = userLoading || statsLoading || enrollmentsLoading || registrationsLoading || evidencesLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* User Identity Card & Welcome Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1a242f] border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
                    {/* Avatar / Initials */}
                    <div className="relative flex-shrink-0">
                        {user?.avatarUrl ? (
                            <img 
                                src={user.avatarUrl} 
                                alt={user.name} 
                                className="h-20 w-20 rounded-full object-cover border-2 border-primary/20 shadow-sm"
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-extrabold text-2xl border border-primary/20 shadow-sm">
                                {user?.name ? getInitials(user.name) : "LN"}
                            </div>
                        )}
                        <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" title="Active">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        </span>
                    </div>
                    {/* Details */}
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {user?.name || "Learner"}
                            </h1>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground border border-primary/20 uppercase tracking-wider">
                                {user?.role || "LEARNER"}
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium">
                            {user?.email}
                        </p>
                    </div>
                </div>
                <div className="text-left md:text-right space-y-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Ekosistem Pembelajaran</span>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        Renjana LMS & LXP
                    </h3>
                </div>
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
                    value={registrations.filter((registration) => isLearningAccessibleRegistration(registration.status)).length}
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
                            <h2 className="text-2xl font-bold">Mulai langkah pertama Anda</h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Anda belum memiliki registrasi atau kelas aktif. Jelajahi batch dan event yang sedang dibuka lalu daftarkan diri Anda.
                            </p>
                        </div>
                        <Link
                            href="/events"
                            className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
                        >
                            Lihat Batch & Event
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
                                Lihat Semua Batch & Event
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

            {/* Ulasan & Feedback Tugas */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Ulasan & Feedback Tugas</h2>
                {evidences.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-gray-950 dark:text-white font-semibold mb-2">Belum ada ulasan tugas</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg mx-auto">
                            Kirim bukti tugas atau evidence pembelajaran di kelas untuk mendapatkan penilaian dan komentar dari instruktur.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {evidences.map((evidence) => {
                            const isGraded = evidence.rating !== null && evidence.rating !== undefined;
                            return (
                                <div
                                    key={evidence.id}
                                    className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">
                                                {evidence.title}
                                            </h3>
                                            {isGraded ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200/50 dark:border-green-800/30 shrink-0">
                                                    Dinilai
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30 shrink-0">
                                                    Menunggu Penilaian
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                            Diunggah pada: {new Date(evidence.uploadedAt).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>

                                    {isGraded ? (
                                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50 space-y-2">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-4 w-4 ${
                                                            star <= (evidence.rating || 0)
                                                                ? "text-amber-500 fill-amber-500"
                                                                : "text-gray-300 dark:text-gray-600"
                                                        }`}
                                                    />
                                                ))}
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">
                                                    ({evidence.rating}/5)
                                                </span>
                                            </div>
                                            {evidence.comment ? (
                                                <p className="text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-900/30 p-3 rounded-xl border border-gray-100/50 dark:border-gray-800/30 leading-relaxed">
                                                    &ldquo;{evidence.comment}&rdquo;
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                                                    Tidak ada komentar dari instruktur.
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
                                            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                                                Tugas Anda sedang ditinjau oleh instruktur.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                        <h2 className="text-xl font-bold">Aksi Cepat</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <Link
                        href="/events"
                        className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] hover:border-primary/50 transition-all group"
                    >
                        <BookOpen className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-bold group-hover:text-primary transition-colors">Lihat Batch & Event</h3>
                        <p className="text-sm text-gray-500 mt-1">Temukan batch dan event yang sedang dibuka</p>
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
