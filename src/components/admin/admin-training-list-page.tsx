"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminCourses, createCourse, deleteCourse, updateCourse } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { BookOpen, Plus, Loader2, Users, Layers, Trash2, CheckCircle, Clock, Archive } from "lucide-react";

const statusConfig = {
    PUBLISHED: { label: "Dipublikasikan", icon: CheckCircle, class: "text-green-600 bg-green-50 dark:bg-green-900/20" },
    DRAFT: { label: "Draft", icon: Clock, class: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
    ARCHIVED: { label: "Diarsipkan", icon: Archive, class: "text-gray-500 bg-gray-100 dark:bg-gray-800" },
};

export function AdminTrainingListPage() {
    const toast = useToast();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-courses"],
        queryFn: fetchAdminCourses,
    });

    const courses = data?.courses ?? [];

    const createMutation = useMutation({
        mutationFn: () => createCourse({ title, description, status: "DRAFT" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
            toast.success("Pelatihan berhasil dibuat ✅");
            setTitle("");
            setDescription("");
            setShowForm(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteCourse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
            toast.success("Pelatihan dihapus");
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateCourse(id, { status: status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-courses"] }),
    });

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Pelatihan</h1>
                    <p className="mt-1 text-gray-500">{courses.length} pelatihan terdaftar</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:opacity-90">
                    <Plus className="h-4 w-4" /> Tambah Pelatihan
                </button>
            </div>

            {showForm ? (
                <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                    <input type="text" placeholder="Judul pelatihan" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm dark:border-gray-700" />
                    <textarea placeholder="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-transparent p-3 text-sm dark:border-gray-700" rows={3} />
                    <button onClick={() => createMutation.mutate()} disabled={!title || createMutation.isPending} className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
                        {createMutation.isPending ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            ) : null}

            <div className="grid gap-4">
                {courses.map((course) => {
                    const cfg = statusConfig[course.status as keyof typeof statusConfig] || statusConfig.DRAFT;
                    const Icon = cfg.icon;

                    return (
                        <div key={course.id} className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                        <BookOpen className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <Link href={`/admin/pelatihan/${course.id}`} className="text-lg font-bold transition-colors hover:text-primary">{course.title}</Link>
                                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{course.description || "Tidak ada deskripsi"}</p>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {course._count.modules} modul</span>
                                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course._count.enrollments} peserta</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleStatusMutation.mutate({ id: course.id, status: course.status })} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${cfg.class}`}>
                                        <Icon className="h-3.5 w-3.5" /> {cfg.label}
                                    </button>
                                    <button onClick={() => { if (confirm("Hapus pelatihan ini?")) deleteMutation.mutate(course.id); }} className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
