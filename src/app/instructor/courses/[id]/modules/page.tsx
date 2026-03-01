"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchCourseById } from "@/lib/api";
import { Loader2, Plus, GripVertical, Edit2, Trash2, Video, FileText, CheckSquare, Save } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function InstructorModuleManagementPage() {
    const params = useParams();
    const courseId = params.id as string;
    const { success, error: toastError } = useToast();
    const queryClient = useQueryClient();

    const [isCreating, setIsCreating] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["course", courseId],
        queryFn: () => fetchCourseById(courseId),
    });

    // Mock mutation for creating a module
    const createModuleMutation = useMutation({
        mutationFn: async (title: string) => {
            const res = await fetch("/api/instructor/modules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId, title, order: (data?.course?.modules?.length || 0) + 1 }),
            });
            if (!res.ok) throw new Error("Gagal membuat modul");
            return res.json();
        },
        onSuccess: () => {
            success("Modul berhasil ditambahkan.");
            setIsCreating(false);
            setNewModuleTitle("");
            queryClient.invalidateQueries({ queryKey: ["course", courseId] });
        },
        onError: () => toastError("Gagal menambahkan modul."),
    });

    if (isLoading) return <div className="flex h-64 justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;
    const course = data?.course;

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newModuleTitle.trim()) return;
        createModuleMutation.mutate(newModuleTitle);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Kelola Modul: {course?.title}</h1>
                <p className="text-gray-500 mt-1">Tambah, edit, dan atur struktur pembelajaran.</p>
            </div>

            <div className="space-y-4">
                {course?.modules?.map((mod: any, index: number) => (
                    <div key={mod.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                        {/* Module Header */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
                            <span className="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <GripVertical className="h-5 w-5" />
                            </span>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">Modul {index + 1}: {mod.title}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Lessons List */}
                        <div className="p-4 space-y-2">
                            {mod.lessons?.length === 0 && (
                                <p className="text-sm text-gray-500 italic text-center py-4">Belum ada materi di modul ini.</p>
                            )}
                            {mod.lessons?.map((lesson: any, lIndex: number) => (
                                <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 group transition-all">
                                    <span className="text-gray-300 dark:text-gray-600"><GripVertical className="h-4 w-4" /></span>
                                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                        {lesson.type === 'VIDEO' ? <Video className="h-4 w-4" /> :
                                            lesson.type === 'READING' ? <FileText className="h-4 w-4" /> :
                                                <CheckSquare className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{lesson.title}</p>
                                        <p className="text-xs text-gray-500">{lesson.type} • {lesson.durationMin ?? 0} menit</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        <button className="p-1.5 text-gray-400 hover:text-emerald-500 rounded"><Edit2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                </div>
                            ))}

                            <button className="w-full mt-2 py-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-500 hover:text-emerald-500 hover:border-emerald-500 transition-colors flex items-center justify-center gap-2">
                                <Plus className="h-4 w-4" /> Tambah Materi
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Module Item */}
                {!isCreating ? (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full p-6 border-2 border-dashed border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="h-5 w-5" /> Buat Modul Baru
                    </button>
                ) : (
                    <form onSubmit={handleCreateSubmit} className="p-5 rounded-xl border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10">
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-3">Modul Baru</h4>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Judul Modul..."
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#0a0f14] outline-none focus:ring-2 focus:ring-emerald-500 mb-4 text-sm"
                        />
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-lg">Batal</button>
                            <button type="submit" disabled={createModuleMutation.isPending} className="px-4 py-2 text-sm font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2">
                                {createModuleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Simpan Modul
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
