"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminCourse, updateCourse } from "@/lib/api";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { ArrowLeft, BookOpen, Users, Layers, FileText, Loader2, CheckCircle } from "lucide-react";

export default function AdminProgramDetailPage() {
    const { id } = useParams<{ id: string }>();
    const toast = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-course", id],
        queryFn: () => fetchAdminCourse(id),
        enabled: !!id,
    });

    const course = data?.course;

    const publishMutation = useMutation({
        mutationFn: () => updateCourse(id, { status: course?.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-course", id] });
            toast.success("Status updated");
        },
    });

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!course) return <div className="text-center py-12 text-gray-500">Program tidak ditemukan</div>;

    const totalLessons = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length ?? 0), 0) ?? 0;

    return (
        <div className="space-y-8">
            <Link href="/admin/programs" className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Kembali</Link>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{course.title}</h1>
                    <p className="text-gray-500 mt-1">{course.description || "Tidak ada deskripsi"}</p>
                </div>
                <button onClick={() => publishMutation.mutate()} className={`px-5 py-2.5 rounded-full font-bold text-sm ${course.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {course.status === "PUBLISHED" ? "✅ Published" : "📝 Draft"} — Klik untuk toggle
                </button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Layers className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{course.modules?.length ?? 0}</p><p className="text-xs text-gray-500">Modul</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><FileText className="h-5 w-5 text-blue-500" /></div><div><p className="text-2xl font-bold">{totalLessons}</p><p className="text-xs text-gray-500">Lessons</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center"><Users className="h-5 w-5 text-green-500" /></div><div><p className="text-2xl font-bold">{course.enrollments?.length ?? 0}</p><p className="text-xs text-gray-500">Peserta</p></div></div>
                </div>
            </div>

            {/* Modules */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Silabus</h2>
                {course.modules?.map((mod: any, i: number) => (
                    <div key={mod.id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                        <h3 className="font-bold">Modul {i + 1}: {mod.title}</h3>
                        <div className="mt-3 space-y-2">
                            {mod.lessons?.map((lesson: any) => (
                                <div key={lesson.id} className="flex items-center gap-2 text-sm text-gray-500 pl-4">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    <span>{lesson.title}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{lesson.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Enrolled Users */}
            {course.enrollments?.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Peserta Terdaftar</h2>
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500"><th className="p-4 font-semibold">Nama</th><th className="p-4 font-semibold">Email</th><th className="p-4 font-semibold">Progress</th><th className="p-4 font-semibold">Status</th></tr></thead>
                            <tbody>
                                {course.enrollments.map((e: any) => (
                                    <tr key={e.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                                        <td className="p-4 font-medium">{e.user.fullName}</td>
                                        <td className="p-4 text-gray-500">{e.user.email}</td>
                                        <td className="p-4"><div className="flex items-center gap-2"><div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-primary" style={{ width: `${e.completionPercentage}%` }} /></div><span className="text-xs">{e.completionPercentage}%</span></div></td>
                                        <td className="p-4">{e.status === "COMPLETED" ? <span className="text-green-600 flex items-center gap-1 text-xs"><CheckCircle className="h-3.5 w-3.5" /> Selesai</span> : <span className="text-amber-600 text-xs">Aktif</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
