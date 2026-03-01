"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/lib/api";
import Link from "next/link";
import { Loader2, Plus, BookOpen, Clock, Users, ArrowRight } from "lucide-react";

export default function InstructorCoursesPage() {
    // Note: For simplicity, we are fetching all published courses. 
    // In a real app, this should filter by the instructor's assigned courses.
    const { data, isLoading, error } = useQuery({
        queryKey: ["courses"],
        queryFn: async () => fetchCourses(),
    });

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center text-red-500">
                Gagal memuat daftar kursus.
            </div>
        );
    }

    const courses = data?.courses ?? [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Kelola Modul Kursus</h1>
                    <p className="text-gray-500 mt-1">Pilih kursus untuk memperbarui modul dan materi.</p>
                </div>
                <button
                    disabled
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors opacity-50 cursor-not-allowed"
                >
                    <Plus className="h-4 w-4" />
                    Buat Kursus Baru
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="group flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden hover:border-emerald-500/50 hover:shadow-xl transition-all"
                    >
                        <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                            {course.thumbnail ? (
                                <img src={course.thumbnail} alt={course.title} className="object-cover w-full h-full" />
                            ) : (
                                <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                            )}
                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white uppercase tracking-wider">
                                {course.type}
                            </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-lg font-bold line-clamp-2 mb-2 group-hover:text-emerald-500 transition-colors">
                                {course.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                                {course.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-gray-400 mb-5">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {course._count.modules} modul
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {course._count.enrollments} peserta
                                </span>
                            </div>

                            <Link
                                href={`/instructor/courses/${course.id}/modules`}
                                className="flex items-center justify-center w-full gap-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-colors border border-gray-100 dark:border-gray-800"
                            >
                                Kelola Modul
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {courses.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Belum Ada Kursus</h3>
                    <p className="text-gray-500">Anda belum ditugaskan ke kursus apa pun.</p>
                </div>
            )}
        </div>
    );
}
