"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInstructorLearners } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, User, BookOpen, CheckCircle, Clock, Award, TrendingUp } from "lucide-react";

export default function LearnerDetailPage() {
    const { id } = useParams<{ id: string }>();

    const { data, isLoading } = useQuery({
        queryKey: ["instructor-learners"],
        queryFn: fetchInstructorLearners,
    });

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const allEnrollments = data?.enrollments ?? [];
    const learnerEnrollments = allEnrollments.filter(e => e.userId === id);
    const learner = learnerEnrollments[0]?.user;

    if (!learner) return <div className="text-center py-12 text-gray-500">Peserta tidak ditemukan</div>;

    const avgProgress = learnerEnrollments.length ? Math.round(learnerEnrollments.reduce((s, e) => s + e.completionPercentage, 0) / learnerEnrollments.length) : 0;
    const completed = learnerEnrollments.filter(e => e.status === "COMPLETED").length;

    return (
        <div className="space-y-8">
            <Link href="/instructor/learners" className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Kembali</Link>

            {/* Profile */}
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{learner.fullName}</h1>
                    <p className="text-gray-500">{learner.email}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><BookOpen className="h-5 w-5 text-blue-500" /></div><div><p className="text-2xl font-bold">{learnerEnrollments.length}</p><p className="text-xs text-gray-500">Program Diikuti</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-500" /></div><div><p className="text-2xl font-bold">{completed}</p><p className="text-xs text-gray-500">Selesai</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{avgProgress}%</p><p className="text-xs text-gray-500">Rata-rata</p></div></div>
                </div>
            </div>

            {/* Enrollments */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Program yang Diikuti</h2>
                {learnerEnrollments.map(e => (
                    <div key={e.id} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold">{e.course.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">Terdaftar: {new Date(e.enrolledAt).toLocaleDateString("id-ID")}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {e.certificate && <span className="text-xs text-primary flex items-center gap-1"><Award className="h-4 w-4" /> Sertifikat</span>}
                                {e.status === "COMPLETED" ? <span className="px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 text-xs font-semibold flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Selesai</span> : <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-xs font-semibold flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Aktif</span>}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex-1 h-2.5 rounded-full bg-gray-100 dark:bg-gray-800">
                                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${e.completionPercentage}%` }} />
                            </div>
                            <span className="text-sm font-semibold">{e.completionPercentage}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
