"use client";

import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/dashboard/stat-card";
import { fetchDashboardStats, fetchMyEnrollments, fetchMyRegistrations, fetchCourseById, fetchProgress } from "@/features/client/api/learner";
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
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Video,
    Users,
    Award,
    HelpCircle,
    FileText,
} from "lucide-react";
import {
    getNextIncompleteLesson,
    getLastActiveDate,
    formatLastActiveDate,
    getLessonStatus,
} from "@/lib/dashboard-timeline-utils";

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

    // Fetch course detail for the active enrollment
    const { data: activeCourseData, isLoading: activeCourseLoading } = useQuery({
        queryKey: ["course", activeEnrollment?.courseId],
        queryFn: () => fetchCourseById(activeEnrollment!.courseId),
        enabled: !!activeEnrollment?.courseId,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    // Fetch progress for the active enrollment
    const { data: activeProgressData, isLoading: activeProgressLoading } = useQuery({
        queryKey: ["progress", activeEnrollment?.id],
        queryFn: () => fetchProgress(activeEnrollment!.id),
        enabled: !!activeEnrollment?.id,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    const activeCourse = activeCourseData?.course;
    const activeProgress = activeProgressData;

    // Flatten all lessons of the active course
    const activeLessons = React.useMemo(() => {
        if (!activeCourse) return [];
        return activeCourse.modules.flatMap((m) =>
            m.lessons.map((l) => ({
                ...l,
                moduleId: m.id,
            }))
        );
    }, [activeCourse]);

    // Next incomplete lesson
    const nextIncompleteLesson = React.useMemo(() => {
        if (!activeLessons.length || !activeProgress) return null;
        return getNextIncompleteLesson(activeLessons, activeProgress.progresses);
    }, [activeLessons, activeProgress]);

    // Format last active date
    const formattedLastActive = React.useMemo(() => {
        if (!activeProgress || !activeEnrollment) return null;
        const lastActiveDate = getLastActiveDate(activeProgress.progresses, activeEnrollment.enrolledAt);
        return formatLastActiveDate(lastActiveDate);
    }, [activeProgress, activeEnrollment]);

    // Set of completed lesson IDs
    const completedLessonIds = React.useMemo(() => {
        const set = new Set<string>();
        activeProgress?.progresses?.forEach((p) => {
            if (p.isCompleted) set.add(p.lessonId);
        });
        return set;
    }, [activeProgress]);

    const activeModuleId = React.useMemo(() => {
        return nextIncompleteLesson?.moduleId || activeCourse?.modules[activeCourse.modules.length - 1]?.id || null;
    }, [nextIncompleteLesson, activeCourse]);

    const [collapsedModules, setCollapsedModules] = React.useState<Record<string, boolean>>({});

    const toggleModule = (moduleId: string) => {
        setCollapsedModules((prev) => ({
            ...prev,
            [moduleId]: !(prev[moduleId] ?? (moduleId !== activeModuleId)),
        }));
    };

    const isModuleCollapsed = (moduleId: string) => {
        return collapsedModules[moduleId] ?? (moduleId !== activeModuleId);
    };

    const getActivityIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case "VIDEO": return <Video className="h-4 w-4" />;
            case "QUIZ": return <HelpCircle className="h-4 w-4" />;
            case "ASSIGNMENT": return <FileText className="h-4 w-4" />;
            case "READING": return <FileText className="h-4 w-4" />;
            case "LIVE_SESSION": return <Users className="h-4 w-4" />;
            default: return <PlayCircle className="h-4 w-4" />;
        }
    };

    const isLoading = userLoading || statsLoading || enrollmentsLoading || registrationsLoading || evidencesLoading || (!!activeEnrollment && (activeCourseLoading || activeProgressLoading));

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
                <div className="space-y-6">
                    {/* Continue Learning Card */}
                    <div className="rounded-3xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 md:p-8 shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            {/* Left Side: Course & Next Lesson Info */}
                            <div className="space-y-4 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-primary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                                        Lanjutkan Belajar
                                    </span>
                                    {formattedLastActive && (
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                                            Terakhir belajar: {formattedLastActive}
                                        </span>
                                    )}
                                </div>
                                
                                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                    {activeEnrollment.course.title}
                                </h2>

                                {nextIncompleteLesson ? (
                                    <div className="p-4 rounded-2xl bg-white/50 dark:bg-[#1a242f]/30 border border-gray-100 dark:border-gray-800 flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            {getActivityIcon(nextIncompleteLesson.type)}
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider block">
                                                Aktivitas Berikutnya (Up Next)
                                            </span>
                                            <p className="font-bold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">
                                                {nextIncompleteLesson.title}
                                            </p>
                                            {nextIncompleteLesson.durationMin && (
                                                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 font-medium">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {nextIncompleteLesson.durationMin} menit
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/30 flex items-center gap-3">
                                        <Award className="h-8 w-8 text-green-500 shrink-0" />
                                        <div>
                                            <p className="font-bold text-sm text-green-800 dark:text-green-400">
                                                Semua materi modul telah diselesaikan!
                                            </p>
                                            <p className="text-xs text-green-600 dark:text-green-500 font-medium">
                                                Selesaikan pre/post-test atau tunggu penerbitan sertifikat Anda.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Circular Progress & Button */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0 lg:self-stretch justify-center">
                                <div className="h-px w-full bg-gray-100 dark:bg-gray-800 lg:hidden" />
                                <ProgressChart completionPercentage={activeEnrollment.completionPercentage} />
                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                    <Link
                                        href={`/learn/${activeEnrollment.courseId}`}
                                        className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 shrink-0"
                                    >
                                        <PlayCircle className="h-5 w-5" />
                                        Resume Course
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Timeline */}
                    {activeCourse && (
                        <div className="bg-white dark:bg-[#1a242f] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                        Rencana Belajar & Progress
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">
                                        Ikuti alur materi secara berurutan untuk menyelesaikan kelas ini.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-[#101922] px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-800 shrink-0 font-semibold text-gray-600 dark:text-gray-400">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Total durasi: {activeLessons.reduce((sum, l) => sum + (l.durationMin ?? 0), 0)} menit</span>
                                </div>
                            </div>

                            <div className="relative pl-1">
                                {/* Main timeline connecting line */}
                                <div className="absolute left-[21px] top-6 bottom-6 w-0.5 bg-gray-100 dark:bg-gray-800/80" />

                                <div className="space-y-4">
                                    {activeCourse.modules.map((module, mIdx) => {
                                        const collapsed = isModuleCollapsed(module.id);
                                        const moduleLessons = module.lessons || [];
                                        const allModuleLessonsCompleted = moduleLessons.length > 0 && moduleLessons.every(l => completedLessonIds.has(l.id));

                                        return (
                                            <div key={module.id} className="relative z-10 space-y-2">
                                                {/* Module Header */}
                                                <button
                                                    onClick={() => toggleModule(module.id)}
                                                    className="w-full flex items-center justify-between bg-gray-50/50 hover:bg-gray-50 dark:bg-[#101922]/30 dark:hover:bg-[#101922]/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm transition-all duration-200 group text-left cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border-2 font-bold text-sm transition-all duration-200 shadow-sm ${
                                                            allModuleLessonsCompleted
                                                                ? "bg-green-500 border-green-500 text-white"
                                                                : "bg-white dark:bg-[#1a242f] border-primary text-primary"
                                                        }`}>
                                                            {allModuleLessonsCompleted ? (
                                                                <CheckCircle2 className="h-5 w-5" />
                                                            ) : (
                                                                <span>{mIdx + 1}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] uppercase font-extrabold text-primary tracking-wider block">
                                                                Modul {mIdx + 1}
                                                            </span>
                                                            <h3 className="font-extrabold text-sm md:text-base text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                                                {module.title}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            {moduleLessons.filter(l => completedLessonIds.has(l.id)).length}/{moduleLessons.length} Materi
                                                        </span>
                                                        {collapsed ? (
                                                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                                                        )}
                                                    </div>
                                                </button>

                                                {/* Lessons List under the module */}
                                                {!collapsed && (
                                                    <div className="pl-5 ml-5 border-l border-dashed border-gray-200 dark:border-gray-800 space-y-2 pt-1 pb-3">
                                                        {moduleLessons.map((lesson) => {
                                                            const status = getLessonStatus(lesson.id, nextIncompleteLesson?.id || null, completedLessonIds);
                                                            const isCompleted = status === "COMPLETED";
                                                            const isInProgress = status === "IN_PROGRESS";

                                                            return (
                                                                <div
                                                                    key={lesson.id}
                                                                    className="relative flex items-center gap-3 p-1"
                                                                >
                                                                    {/* Connector branch line */}
                                                                    <div className="absolute -left-[21px] top-1/2 w-[21px] border-t border-dashed border-gray-200 dark:border-gray-800" />

                                                                    {isCompleted ? (
                                                                        <Link
                                                                            href={`/learn/${activeEnrollment.courseId}`}
                                                                            className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-[#101922]/20 transition-all duration-200 flex-1 text-left"
                                                                        >
                                                                            <div className="h-7 w-7 rounded-full bg-green-50 dark:bg-green-950/20 text-green-500 border border-green-200/30 dark:border-green-800/20 flex items-center justify-center shrink-0">
                                                                                <CheckCircle2 className="h-4 w-4" />
                                                                            </div>
                                                                            <div className="flex-1 space-y-0.5">
                                                                                <span className="font-semibold text-sm text-gray-500 dark:text-gray-400 line-through line-clamp-1">
                                                                                    {lesson.title}
                                                                                </span>
                                                                            </div>
                                                                            {lesson.durationMin && (
                                                                                <span className="text-[10px] text-gray-400 bg-gray-50 dark:bg-[#101922] px-2 py-0.5 rounded-full shrink-0 font-medium">
                                                                                    {lesson.durationMin}m
                                                                                </span>
                                                                            )}
                                                                        </Link>
                                                                    ) : isInProgress ? (
                                                                        <Link
                                                                            href={`/learn/${activeEnrollment.courseId}`}
                                                                            className="flex items-center gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-sm hover:bg-primary/10 transition-all duration-200 flex-1 text-left ring-2 ring-primary/10"
                                                                        >
                                                                            <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/20 animate-pulse">
                                                                                {getActivityIcon(lesson.type)}
                                                                            </div>
                                                                            <div className="flex-1 space-y-0.5">
                                                                                <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider block">
                                                                                    Sedang Dipelajari
                                                                                </span>
                                                                                <span className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1">
                                                                                    {lesson.title}
                                                                                </span>
                                                                            </div>
                                                                            {lesson.durationMin && (
                                                                                <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0 font-extrabold uppercase tracking-wider">
                                                                                    {lesson.durationMin}m
                                                                                </span>
                                                                            )}
                                                                        </Link>
                                                                    ) : (
                                                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-transparent opacity-60 flex-1 text-left cursor-not-allowed">
                                                                            <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-[#101922] text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0">
                                                                                {getActivityIcon(lesson.type)}
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <span className="font-semibold text-sm text-gray-400 dark:text-gray-500 line-clamp-1">
                                                                                    {lesson.title}
                                                                                </span>
                                                                            </div>
                                                                            {lesson.durationMin && (
                                                                                <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded-full shrink-0 font-medium">
                                                                                    {lesson.durationMin}m
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
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
