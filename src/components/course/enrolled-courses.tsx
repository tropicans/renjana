"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchMyEnrollments } from "@/lib/api";
import { useUser } from "@/lib/context/user-context";
import { PlayCircle, Clock, BookOpen } from "lucide-react";

export function EnrolledCourses() {
    const { user, isAuthenticated } = useUser();

    const { data, isLoading } = useQuery({
        queryKey: ["my-enrollments"],
        queryFn: fetchMyEnrollments,
        enabled: !!user,
    });

    const enrollments = data?.enrollments ?? [];

    if (!isAuthenticated || !user) {
        return (
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                    Login untuk melihat course yang sedang Anda ikuti.
                </p>
                <Link
                    href="/login"
                    className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-full font-semibold text-sm"
                >
                    Login
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-8 text-center">
                <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
        );
    }

    if (enrollments.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <PlayCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Belum ada course</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    Mulai perjalanan belajar Anda dengan mendaftar ke salah satu course kami.
                </p>
                <Link
                    href="/courses"
                    className="inline-block px-6 py-2 bg-primary text-white rounded-full font-semibold text-sm"
                >
                    Jelajahi Courses
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Course Saya</h2>
                <Link href="/dashboard" className="text-sm text-primary hover:underline">
                    Lihat Semua
                </Link>
            </div>
            <div className="grid gap-4">
                {enrollments.slice(0, 3).map((enrollment) => (
                    <Link
                        key={enrollment.id}
                        href={`/learn/${enrollment.courseId}`}
                        className="group flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] hover:border-primary/50 transition-all"
                    >
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                            <BookOpen className="h-8 w-8 text-primary/30" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold truncate group-hover:text-primary transition-colors">
                                {enrollment.course.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {enrollment.status === "COMPLETED" ? "Selesai" : "Sedang Belajar"}
                            </p>
                            {/* Progress Bar */}
                            <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-gray-500">Progress</span>
                                    <span className="font-semibold text-primary">{enrollment.completionPercentage}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${enrollment.completionPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
