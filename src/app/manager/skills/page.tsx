"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInstructorLearners } from "@/lib/api";
import { Loader2, TrendingUp, Users, Award, BarChart3 } from "lucide-react";

export default function ManagerSkillsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["instructor-learners"],
        queryFn: fetchInstructorLearners,
    });

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const enrollments = data?.enrollments ?? [];
    // Group by course for skill analysis
    const courseMap = new Map<string, { title: string; total: number; completed: number; avgProgress: number }>();
    enrollments.forEach(e => {
        const existing = courseMap.get(e.courseId) || { title: e.course.title, total: 0, completed: 0, avgProgress: 0 };
        existing.total++;
        if (e.status === "COMPLETED") existing.completed++;
        existing.avgProgress = Math.round(((existing.avgProgress * (existing.total - 1)) + e.completionPercentage) / existing.total);
        courseMap.set(e.courseId, existing);
    });

    const courses = Array.from(courseMap.values());

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Skills Coverage</h1>
                <p className="text-gray-500 mt-1">Analisis kompetensi per program pelatihan</p>
            </div>

            <div className="grid gap-4">
                {courses.map((c, i) => (
                    <div key={i} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-primary" /></div>
                                <div><h3 className="font-bold">{c.title}</h3><p className="text-xs text-gray-500">{c.total} peserta</p></div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-green-600"><Award className="h-4 w-4" /> {c.completed} lulus</span>
                                <span className="flex items-center gap-1 text-primary"><TrendingUp className="h-4 w-4" /> {c.avgProgress}%</span>
                            </div>
                        </div>
                        <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary to-green-500 transition-all" style={{ width: `${c.avgProgress}%` }} />
                        </div>
                    </div>
                ))}
                {courses.length === 0 && (
                    <div className="text-center py-12 text-gray-500 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">Belum ada data program.</div>
                )}
            </div>
        </div>
    );
}
