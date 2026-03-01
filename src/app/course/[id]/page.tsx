"use client";

import { SiteHeader } from "@/components/ui/site-header";
import { EnrollButton } from "@/components/course/enroll-button";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById } from "@/lib/api";
import Link from "next/link";
import { CheckCircle, Clock, BookOpen, ArrowLeft, Users, Loader2, MapPin, Calendar } from "lucide-react";
import { useParams } from "next/navigation";

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = params.id as string;

    const { data, isLoading, error } = useQuery({
        queryKey: ["course", courseId],
        queryFn: () => fetchCourseById(courseId),
        enabled: !!courseId,
    });

    const course = data?.course;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                <SiteHeader />
                <div className="flex items-center justify-center pt-32">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
                        <p className="text-gray-500 mb-6">The course you&apos;re looking for doesn&apos;t exist.</p>
                        <Link href="/courses" className="text-primary font-bold hover:underline">
                            ← Back to Courses
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const totalDurationMin = course.modules.reduce(
        (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.durationMin ?? 0), 0),
        0
    );

    const isOfflineEvent = course.type === "OFFLINE_EVENT";

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-white antialiased">
            <SiteHeader />

            <main className="pt-20 pb-24">
                {/* Breadcrumb */}
                <div className="bg-white dark:bg-[#0a0f14] border-b border-gray-100 dark:border-gray-800">
                    <div className="max-w-[1200px] mx-auto px-6 py-4">
                        <Link href="/courses" className="text-gray-500 hover:text-primary flex items-center gap-2 text-sm transition font-medium">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Courses
                        </Link>
                    </div>
                </div>

                {/* Hero Area */}
                <section className="py-16 px-6 bg-white dark:bg-[#0a0f14]">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2">
                                <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                                    {course.status}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                                    {course.title}
                                </h1>
                                <p className="text-xl text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                                    {course.description}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <BookOpen className="h-5 w-5" />
                                        <span>{course.modules.length} modules</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock className="h-5 w-5" />
                                        <span>{totalDurationMin} min</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Users className="h-5 w-5" />
                                        <span>{course.enrollments.length} enrolled</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-8 bg-background-light dark:bg-[#1a242f] rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Modules</span>
                                        <div className="flex items-center gap-2 font-semibold">
                                            <BookOpen className="w-4 h-4 text-primary" />
                                            {course.modules.length} Modul
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Lessons</span>
                                        <div className="flex items-center gap-2 font-semibold">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            {totalLessons} Lesson
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Duration</span>
                                        <div className="flex items-center gap-2 font-semibold">
                                            <Clock className="w-4 h-4 text-primary" />
                                            {totalDurationMin} min
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enrollment Card */}
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-[#1a242f] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-8 sticky top-24">
                                    {/* Gradient placeholder */}
                                    <div className="w-full aspect-video rounded-xl mb-6 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                        {isOfflineEvent ? (
                                            <Calendar className="h-16 w-16 text-primary/30" />
                                        ) : (
                                            <BookOpen className="h-16 w-16 text-primary/30" />
                                        )}
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {isOfflineEvent ? (
                                            <>
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                    <span className="text-sm font-medium">Jadwal Fix Tersedia</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                    <span className="text-sm font-medium">Lokasi tatap muka</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                    <span className="text-sm font-medium">{course.modules.length} modul terstruktur</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                    <span className="text-sm font-medium">{totalLessons} lesson interaktif</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-sm font-medium">Sertifikat Resmi</span>
                                        </div>
                                        {!isOfflineEvent && (
                                            <div className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                <span className="text-sm font-medium">Akses materi selamanya</span>
                                            </div>
                                        )}
                                    </div>

                                    <EnrollButton courseId={course.id} variant="large" className="w-full" isOfflineEvent={isOfflineEvent} />

                                    <p className="text-center text-gray-400 text-xs mt-4">
                                        {isOfflineEvent ? "Free registration for invitees" : "Free enrollment for all members"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Syllabus */}
                <section className="py-16 px-6">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="lg:col-span-2 space-y-12">
                            <div>
                                <h2 className="text-3xl font-bold mb-6">
                                    {isOfflineEvent ? "Event Rundown" : "Syllabus / Curriculum"}
                                </h2>
                                <div className="space-y-4">
                                    {course.modules.map((module, i) => (
                                        <div
                                            key={module.id}
                                            className="p-5 bg-white dark:bg-[#1a242f] rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-all"
                                        >
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                    {i + 1}
                                                </div>
                                                <span className="font-bold text-lg">{module.title}</span>
                                            </div>
                                            {module.lessons.length > 0 && (
                                                <div className="ml-14 space-y-2">
                                                    {module.lessons.map((lesson) => (
                                                        <div key={lesson.id} className="flex items-center gap-3 text-sm text-gray-500">
                                                            <CheckCircle className="h-4 w-4 text-gray-300" />
                                                            <span>{lesson.title}</span>
                                                            {lesson.durationMin && (
                                                                <span className="text-xs text-gray-400 ml-auto">{lesson.durationMin} min</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-100 dark:border-white/10 py-12 bg-white dark:bg-background-dark">
                    <div className="max-w-[1200px] mx-auto px-6 text-center">
                        <p className="text-gray-400 dark:text-gray-600 text-xs">
                            © {new Date().getFullYear()} Renjana Legal Training. All rights reserved.
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
