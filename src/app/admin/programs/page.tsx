"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminCourses, createCourse, deleteCourse, updateCourse } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { BookOpen, Plus, Loader2, Users, Layers, Trash2, Edit, CheckCircle, Clock, Archive } from "lucide-react";

const statusConfig = {
    PUBLISHED: { label: "Published", icon: CheckCircle, class: "text-green-600 bg-green-50 dark:bg-green-900/20" },
    DRAFT: { label: "Draft", icon: Clock, class: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
    ARCHIVED: { label: "Archived", icon: Archive, class: "text-gray-500 bg-gray-100 dark:bg-gray-800" },
};

export default function AdminProgramsPage() {
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
            toast.success("Program berhasil dibuat ✅");
            setTitle(""); setDescription(""); setShowForm(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteCourse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
            toast.success("Program dihapus");
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateCourse(id, { status: status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-courses"] }),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Program / Courses</h1>
                    <p className="text-gray-500 mt-1">{courses.length} program terdaftar</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-90">
                    <Plus className="h-4 w-4" /> Tambah Program
                </button>
            </div>

            {showForm && (
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-4">
                    <input type="text" placeholder="Judul Program" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm" />
                    <textarea placeholder="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm" rows={3} />
                    <button onClick={() => createMutation.mutate()} disabled={!title || createMutation.isPending} className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm disabled:opacity-50">
                        {createMutation.isPending ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            )}

            <div className="grid gap-4">
                {courses.map((c) => {
                    const cfg = statusConfig[c.status as keyof typeof statusConfig] || statusConfig.DRAFT;
                    const Icon = cfg.icon;
                    return (
                        <div key={c.id} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <BookOpen className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <Link href={`/admin/programs/${c.id}`} className="font-bold text-lg hover:text-primary transition-colors">{c.title}</Link>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description || "Tidak ada deskripsi"}</p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {c._count.modules} modul</span>
                                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c._count.enrollments} peserta</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => toggleStatusMutation.mutate({ id: c.id, status: c.status })} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${cfg.class}`}>
                                        <Icon className="h-3.5 w-3.5" /> {cfg.label}
                                    </button>
                                    <button onClick={() => { if (confirm("Hapus program ini?")) deleteMutation.mutate(c.id); }} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
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
