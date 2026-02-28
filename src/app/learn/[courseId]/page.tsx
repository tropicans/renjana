"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/context/user-context";
import { useToast } from "@/components/ui/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCourseById, fetchMyEnrollments, fetchProgress, markLessonComplete } from "@/lib/api";
import { useState, useMemo } from "react";
import {
    ArrowLeft,
    PlayCircle,
    FileText,
    HelpCircle,
    CheckCircle2,
    Circle,
    Clock,
    ChevronDown,
    ChevronRight,
    Video,
    Users,
    Award,
    Loader2,
} from "lucide-react";

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useUser();
    const toast = useToast();
    const queryClient = useQueryClient();
    const courseId = params.courseId as string;

    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());

    // Fetch course detail
    const { data: courseData, isLoading: courseLoading } = useQuery({
        queryKey: ["course", courseId],
        queryFn: () => fetchCourseById(courseId),
        enabled: !!courseId,
    });

    // Fetch user's enrollments to find the enrollment for this course
    const { data: enrollmentData } = useQuery({
        queryKey: ["my-enrollments"],
        queryFn: fetchMyEnrollments,
        enabled: !!user,
    });

    const course = courseData?.course;
    const enrollment = enrollmentData?.enrollments?.find((e) => e.courseId === courseId);

    // Fetch progress for this enrollment
    const { data: progressData } = useQuery({
        queryKey: ["progress", enrollment?.id],
        queryFn: () => fetchProgress(enrollment!.id),
        enabled: !!enrollment?.id,
    });

    const completedLessonIds = useMemo(() => {
        const set = new Set<string>();
        progressData?.progresses?.forEach((p) => {
            if (p.isCompleted) set.add(p.lessonId);
        });
        return set;
    }, [progressData]);

    const completionPercentage = progressData?.completionPercentage ?? enrollment?.completionPercentage ?? 0;

    // Flatten all lessons for navigation
    const allLessons = useMemo(() => {
        if (!course) return [];
        return course.modules.flatMap((m) => m.lessons);
    }, [course]);

    // Auto-select first incomplete lesson
    const defaultLesson = useMemo(() => {
        for (const lesson of allLessons) {
            if (!completedLessonIds.has(lesson.id)) return lesson;
        }
        return allLessons[allLessons.length - 1] ?? null;
    }, [allLessons, completedLessonIds]);

    const selectedLesson = useMemo(() => {
        if (selectedLessonId) {
            return allLessons.find((l) => l.id === selectedLessonId) ?? defaultLesson;
        }
        return defaultLesson;
    }, [allLessons, defaultLesson, selectedLessonId]);

    // Mutation: mark lesson complete
    const completeMutation = useMutation({
        mutationFn: (lessonId: string) => markLessonComplete(enrollment!.id, lessonId),
        onSuccess: (data) => {
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["progress", enrollment!.id] });
            queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

            if (data.enrollment.completionPercentage === 100) {
                toast.success("🎉 Selamat! Anda telah menyelesaikan course ini!");
            } else {
                toast.success("Aktivitas selesai! Lanjutkan ke aktivitas berikutnya.");
            }

            // Auto-advance to next lesson
            if (selectedLesson) {
                const currentIdx = allLessons.findIndex((l) => l.id === selectedLesson.id);
                if (currentIdx < allLessons.length - 1) {
                    setSelectedLessonId(allLessons[currentIdx + 1].id);
                }
            }
        },
        onError: () => {
            toast.error("Gagal menyimpan progress. Coba lagi.");
        },
    });

    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
        router.push(`/login?redirect=/learn/${courseId}`);
        return null;
    }

    // Redirect if not enrolled
    if (!courseLoading && !authLoading && user && course && !enrollment) {
        router.push(`/course/${courseId}`);
        return null;
    }

    const toggleModule = (moduleId: string) => {
        const newCollapsed = new Set(collapsedModules);
        if (newCollapsed.has(moduleId)) {
            newCollapsed.delete(moduleId);
        } else {
            newCollapsed.add(moduleId);
        }
        setCollapsedModules(newCollapsed);
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

    const isLoading = authLoading || courseLoading || !course || !enrollment;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const totalDuration = allLessons.reduce((sum, l) => sum + (l.durationMin ?? 0), 0);

    return (
        <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] flex">
            {/* Sidebar - Course Navigation */}
            <aside className="w-80 bg-white dark:bg-[#1a242f] border-r border-gray-100 dark:border-gray-800 flex flex-col h-screen sticky top-0">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Dashboard
                    </Link>
                    <h2 className="font-bold text-lg line-clamp-2">{course.title}</h2>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{totalDuration} min</span>
                        <span className="mx-2">•</span>
                        <span className="text-primary font-semibold">{completionPercentage}% selesai</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Modules List */}
                <div className="flex-1 overflow-y-auto">
                    {course.modules.map((module, index) => (
                        <div key={module.id} className="border-b border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                        {index + 1}
                                    </span>
                                    <span className="font-semibold text-sm">{module.title}</span>
                                </div>
                                {!collapsedModules.has(module.id) ? (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                            {!collapsedModules.has(module.id) && (
                                <div className="pb-2">
                                    {module.lessons.map((lesson) => {
                                        const isCompleted = completedLessonIds.has(lesson.id);
                                        const isSelected = selectedLesson?.id === lesson.id;
                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => setSelectedLessonId(lesson.id)}
                                                className={`w-full pl-16 pr-4 py-3 flex items-center gap-3 text-left text-sm transition-colors ${isSelected
                                                        ? "bg-primary/10 text-primary"
                                                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                    }`}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-gray-300 shrink-0" />
                                                )}
                                                <span className={`flex-1 ${isCompleted ? "text-gray-500 line-through" : ""}`}>
                                                    {lesson.title}
                                                </span>
                                                {lesson.durationMin && (
                                                    <span className="text-xs text-gray-400">{lesson.durationMin}m</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Completion Status */}
                {completionPercentage === 100 && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                            <Award className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="font-bold text-green-700 dark:text-green-400">Selamat!</p>
                                <p className="text-sm text-green-600 dark:text-green-500">Course selesai</p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content - Activity Viewer */}
            <main className="flex-1 flex flex-col">
                {selectedLesson ? (
                    <>
                        {/* Video/Content Area */}
                        <div className="aspect-video bg-black relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                                        {getActivityIcon(selectedLesson.type)}
                                    </div>
                                    <p className="text-lg font-bold">{selectedLesson.title}</p>
                                    <p className="text-sm text-white/60 mt-2">
                                        {selectedLesson.type === "VIDEO"
                                            ? "Video Content"
                                            : selectedLesson.type === "QUIZ"
                                                ? "Quiz Activity"
                                                : selectedLesson.type === "ASSIGNMENT"
                                                    ? "Assignment"
                                                    : selectedLesson.type === "LIVE_SESSION"
                                                        ? "Live Session"
                                                        : "Reading Material"}
                                    </p>
                                    {selectedLesson.durationMin && (
                                        <p className="text-xs text-white/40 mt-4">
                                            [Content Player - {selectedLesson.durationMin} menit]
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Activity Info & Actions */}
                        <div className="flex-1 p-8">
                            <div className="max-w-3xl">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div>
                                        <span className="text-xs font-bold text-primary uppercase tracking-widest">
                                            {selectedLesson.type}
                                        </span>
                                        <h1 className="text-2xl font-bold mt-2">{selectedLesson.title}</h1>
                                    </div>
                                    {selectedLesson.durationMin && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4" />
                                            {selectedLesson.durationMin} menit
                                        </div>
                                    )}
                                </div>

                                <div className="prose dark:prose-invert max-w-none mb-8">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Ini adalah konten placeholder untuk aktivitas &quot;{selectedLesson.title}&quot;.
                                        Dalam implementasi nyata, konten video, quiz, atau materi bacaan akan ditampilkan di sini.
                                    </p>
                                </div>

                                {/* Complete Button */}
                                {!completedLessonIds.has(selectedLesson.id) ? (
                                    <button
                                        onClick={() => completeMutation.mutate(selectedLesson.id)}
                                        disabled={completeMutation.isPending}
                                        className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {completeMutation.isPending ? (
                                            <>
                                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-5 w-5" />
                                                Tandai Selesai
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 text-green-500">
                                        <CheckCircle2 className="h-6 w-6" />
                                        <span className="font-bold">Aktivitas ini sudah selesai</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Pilih aktivitas untuk memulai</p>
                    </div>
                )}
            </main>
        </div>
    );
}
