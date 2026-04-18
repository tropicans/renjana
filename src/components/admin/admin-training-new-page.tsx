"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Plus, X, Loader2, ChevronUp, ChevronDown, FileImage, FileVideo, FileText, File as FileIcon } from "lucide-react";
import { createCourse, deleteAdminLessonMaterials, uploadAdminLessonMaterial } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

const lessonTypeOptions = ["VIDEO", "QUIZ", "READING", "ASSIGNMENT"] as const;

type LessonDraft = {
    id: number;
    title: string;
    type: string;
    durationMin: string;
    contentUrl: string;
    materialFileName: string | null;
    materialFileType: string | null;
    materialSize: number | null;
};

type ModuleDraft = {
    id: number;
    title: string;
    lessons: LessonDraft[];
};

function createLessonDraft(): LessonDraft {
    return {
        id: Date.now() + Math.floor(Math.random() * 1000),
        title: "",
        type: "VIDEO",
        durationMin: "",
        contentUrl: "",
        materialFileName: null,
        materialFileType: null,
        materialSize: null,
    };
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
    if (toIndex < 0 || toIndex >= items.length) return items;
    const next = [...items];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
}

function getMaterialLabel(contentUrl: string): string {
    if (!contentUrl) return "";
    const cleanUrl = contentUrl.split("?")[0];
    const parts = cleanUrl.split("/");
    return parts[parts.length - 1] || contentUrl;
}

function getMaterialPreviewType(contentUrl: string): "image" | "video" | "pdf" | null {
    if (!contentUrl) return null;
    const cleanUrl = contentUrl.split("?")[0].toLowerCase();
    if (cleanUrl.match(/\.(jpg|jpeg|png|webp|gif)$/)) return "image";
    if (cleanUrl.match(/\.(mp4|webm|ogg)$/)) return "video";
    if (cleanUrl.endsWith(".pdf")) return "pdf";
    return null;
}

function getMaterialMeta(contentUrl: string): { label: string; icon: typeof FileIcon } {
    const previewType = getMaterialPreviewType(contentUrl);
    if (previewType === "image") return { label: "Gambar", icon: FileImage };
    if (previewType === "video") return { label: "Video", icon: FileVideo };
    if (previewType === "pdf") return { label: "PDF", icon: FileText };
    return { label: "Dokumen", icon: FileIcon };
}

function formatBytes(bytes: number | null): string | null {
    if (!bytes || bytes <= 0) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminTrainingNewPage() {
    const router = useRouter();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [uploadingKey, setUploadingKey] = React.useState<string | null>(null);
    const [pendingUploadUrls, setPendingUploadUrls] = React.useState<string[]>([]);
    const pendingUploadUrlsRef = React.useRef<string[]>([]);
    const [modules, setModules] = React.useState<ModuleDraft[]>([
        { id: 1, title: "", lessons: [createLessonDraft()] },
    ]);

    React.useEffect(() => {
        pendingUploadUrlsRef.current = pendingUploadUrls;
    }, [pendingUploadUrls]);

    React.useEffect(() => {
        return () => {
            if (pendingUploadUrlsRef.current.length > 0) {
                void deleteAdminLessonMaterials(pendingUploadUrlsRef.current);
            }
        };
    }, []);

    const createMutation = useMutation({
        mutationFn: () => createCourse({
            title: title.trim(),
            description: description.trim(),
            status: "DRAFT",
            modules: modules
                .filter((module) => module.title.trim())
                .map((module, index) => ({
                    title: module.title.trim(),
                    order: index + 1,
                    lessons: module.lessons
                        .filter((lesson) => lesson.title.trim())
                        .map((lesson, lessonIndex) => ({
                            title: lesson.title.trim(),
                            type: lesson.type,
                            order: lessonIndex + 1,
                            durationMin: lesson.durationMin.trim() ? Number(lesson.durationMin) : null,
                            contentUrl: lesson.contentUrl.trim() || null,
                            materialFileName: lesson.materialFileName,
                            materialFileType: lesson.materialFileType,
                            materialFileSize: lesson.materialSize,
                        })),
                })),
        }),
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
            setPendingUploadUrls([]);
            toast.success("Pelatihan berhasil dibuat.");
            router.push(`/admin/pelatihan/${data.course.id}`);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const addModule = () => {
        setModules([...modules, { id: Date.now(), title: "", lessons: [createLessonDraft()] }]);
    };

    const moveModule = (moduleId: number, direction: "up" | "down") => {
        setModules((prev) => {
            const index = prev.findIndex((module) => module.id === moduleId);
            if (index === -1) return prev;
            return moveItem(prev, index, direction === "up" ? index - 1 : index + 1);
        });
    };

    const removeModule = (id: number) => {
        if (modules.length > 1) {
            const removedUrls = modules
                .filter((module) => module.id === id)
                .flatMap((module) => module.lessons.map((lesson) => lesson.contentUrl))
                .filter((url): url is string => pendingUploadUrls.includes(url));
            if (removedUrls.length > 0) {
                void deleteAdminLessonMaterials(removedUrls);
                setPendingUploadUrls((prev) => prev.filter((url) => !removedUrls.includes(url)));
            }
            setModules(modules.filter((module) => module.id !== id));
        }
    };

    const updateModuleTitle = (id: number, value: string) => {
        setModules((prev) => prev.map((module) => module.id === id ? { ...module, title: value } : module));
    };

    const addLesson = (moduleId: number) => {
        setModules((prev) => prev.map((module) => module.id === moduleId ? { ...module, lessons: [...module.lessons, createLessonDraft()] } : module));
    };

    const moveLesson = (moduleId: number, lessonId: number, direction: "up" | "down") => {
        setModules((prev) => prev.map((module) => {
            if (module.id !== moduleId) return module;
            const lessonIndex = module.lessons.findIndex((lesson) => lesson.id === lessonId);
            if (lessonIndex === -1) return module;
            return {
                ...module,
                lessons: moveItem(module.lessons, lessonIndex, direction === "up" ? lessonIndex - 1 : lessonIndex + 1),
            };
        }));
    };

    const removeLesson = (moduleId: number, lessonId: number) => {
        setModules((prev) => prev.map((module) => {
            if (module.id !== moduleId) return module;
            if (module.lessons.length <= 1) return module;
            const removedUrls = module.lessons
                .filter((lesson) => lesson.id === lessonId)
                .map((lesson) => lesson.contentUrl)
                .filter((url): url is string => pendingUploadUrls.includes(url));
            if (removedUrls.length > 0) {
                void deleteAdminLessonMaterials(removedUrls);
                setPendingUploadUrls((current) => current.filter((url) => !removedUrls.includes(url)));
            }
            return { ...module, lessons: module.lessons.filter((lesson) => lesson.id !== lessonId) };
        }));
    };

    const updateLesson = (moduleId: number, lessonId: number, key: keyof LessonDraft, value: string) => {
        setModules((prev) => prev.map((module) => {
            if (module.id !== moduleId) return module;
            return {
                ...module,
                lessons: module.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, [key]: value } : lesson),
            };
        }));
    };

    const uploadLessonMaterial = async (moduleId: number, lessonId: number, file: File) => {
        const key = `${moduleId}-${lessonId}`;
        setUploadingKey(key);

        try {
            const result = await uploadAdminLessonMaterial(file);
            const previousPendingUrl = modules
                .flatMap((module) => module.lessons)
                .find((lesson) => lesson.id === lessonId)?.contentUrl;
            if (previousPendingUrl && pendingUploadUrls.includes(previousPendingUrl)) {
                await deleteAdminLessonMaterials([previousPendingUrl]);
                setPendingUploadUrls((prev) => prev.filter((url) => url !== previousPendingUrl));
            }
            setModules((prev) => prev.map((module) => module.id === moduleId ? {
                ...module,
                lessons: module.lessons.map((lesson) => lesson.id === lessonId ? {
                    ...lesson,
                    contentUrl: result.fileUrl,
                    materialFileName: result.fileName,
                    materialFileType: result.fileType,
                    materialSize: result.fileSize,
                } : lesson),
            } : module));
            setPendingUploadUrls((prev) => Array.from(new Set([...prev, result.fileUrl])));
            toast.success("File materi berhasil diunggah.");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload file gagal.");
        } finally {
            setUploadingKey(null);
        }
    };

    const clearLessonMaterial = (moduleId: number, lessonId: number) => {
        const currentUrl = modules
            .flatMap((module) => module.lessons)
            .find((lesson) => lesson.id === lessonId)?.contentUrl;
        if (currentUrl && pendingUploadUrls.includes(currentUrl)) {
            void deleteAdminLessonMaterials([currentUrl]);
            setPendingUploadUrls((prev) => prev.filter((url) => url !== currentUrl));
        }
        setModules((prev) => prev.map((module) => module.id === moduleId ? {
            ...module,
            lessons: module.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, contentUrl: "", materialFileName: null, materialFileType: null, materialSize: null } : lesson),
        } : module));
        toast.success("Materi lesson dihapus dari form.");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate();
    };

    const hasTitle = title.trim().length > 0;
    const hasAtLeastOneModule = modules.some((module) => module.title.trim());

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/pelatihan" className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 transition-all hover:border-red-500/50 dark:border-gray-700">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Pelatihan Baru</h1>
                    <p className="text-gray-500 dark:text-gray-400">Buat data pelatihan baru</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                    <h2 className="text-xl font-bold">Informasi Dasar</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Judul Pelatihan *</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" required placeholder="mis. Pelatihan Sertifikasi Mediator" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:border-red-500 dark:border-gray-700 dark:bg-gray-900" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Deskripsi *</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} placeholder="Jelaskan tujuan dan hasil pelatihan..." className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:border-red-500 dark:border-gray-700 dark:bg-gray-900" />
                    </div>

                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        Isi struktur pelatihan dari awal: judul, deskripsi, modul, dan lesson dasar agar tim admin tidak perlu input ulang setelah data dibuat.
                    </div>
                </div>

                <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Modul</h2>
                        <button type="button" onClick={addModule} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold transition-all hover:border-red-500/50 dark:border-gray-700">
                            <Plus className="h-4 w-4" />
                            Tambah Modul
                        </button>
                    </div>

                    <div className="space-y-4">
                        {modules.map((module, index) => (
                            <div key={module.id} className="space-y-4 rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">Modul {index + 1}</span>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => moveModule(module.id, "up")} disabled={index === 0} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition-all hover:border-red-500/50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700">
                                            <ChevronUp className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => moveModule(module.id, "down")} disabled={index === modules.length - 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition-all hover:border-red-500/50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700">
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                        {modules.length > 1 ? (
                                            <button type="button" onClick={() => removeModule(module.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition-all hover:border-red-500 hover:text-red-500 dark:border-gray-700">
                                                <X className="h-4 w-4" />
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <input value={module.title} onChange={(e) => updateModuleTitle(module.id, e.target.value)} type="text" placeholder="Judul modul" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 md:col-span-2" />
                                </div>

                                <div className="space-y-3 rounded-xl bg-slate-50/70 p-4 dark:bg-slate-900/40">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Lesson</p>
                                        <button type="button" onClick={() => addLesson(module.id)} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold transition-all hover:border-red-500/50 dark:border-gray-700">
                                            <Plus className="h-3.5 w-3.5" />
                                            Tambah Lesson
                                        </button>
                                    </div>

                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <div key={lesson.id} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Lesson {lessonIndex + 1}</span>
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => moveLesson(module.id, lesson.id, "up")} disabled={lessonIndex === 0} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition-all hover:border-red-500/50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700">
                                                        <ChevronUp className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={() => moveLesson(module.id, lesson.id, "down")} disabled={lessonIndex === module.lessons.length - 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition-all hover:border-red-500/50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700">
                                                        <ChevronDown className="h-4 w-4" />
                                                    </button>
                                                    {module.lessons.length > 1 ? (
                                                        <button type="button" onClick={() => removeLesson(module.id, lesson.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition-all hover:border-red-500 hover:text-red-500 dark:border-gray-700">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="grid gap-3 md:grid-cols-2">
                                                <input value={lesson.title} onChange={(e) => updateLesson(module.id, lesson.id, "title", e.target.value)} type="text" placeholder="Judul lesson" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 md:col-span-2" />
                                                <select value={lesson.type} onChange={(e) => updateLesson(module.id, lesson.id, "type", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:border-red-500 dark:border-gray-700 dark:bg-gray-900">
                                                    {lessonTypeOptions.map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                                <input value={lesson.durationMin} onChange={(e) => updateLesson(module.id, lesson.id, "durationMin", e.target.value)} type="number" min="0" placeholder="Durasi (menit)" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:border-red-500 dark:border-gray-700 dark:bg-gray-900" />
                                                <input value={lesson.contentUrl} onChange={(e) => updateLesson(module.id, lesson.id, "contentUrl", e.target.value)} type="url" placeholder="Link materi / video" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition-all focus:border-red-500 dark:border-gray-700 dark:bg-gray-900 md:col-span-2" />
                                                {lesson.contentUrl ? (
                                                    <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                                                        {(() => {
                                                            const materialMeta = getMaterialMeta(lesson.contentUrl);
                                                            const MaterialIcon = materialMeta.icon;
                                                            return (
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <MaterialIcon className="h-4 w-4" />
                                                                <p className="font-semibold">Materi tersimpan</p>
                                                                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">{materialMeta.label}</span>
                                                                {formatBytes(lesson.materialSize) ? <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">{formatBytes(lesson.materialSize)}</span> : null}
                                                            </div>
                                                            <p className="text-xs opacity-80 break-all">{lesson.materialFileName || getMaterialLabel(lesson.contentUrl)}</p>
                                                        </div>
                                                            );
                                                        })()}
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <a href={lesson.contentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-emerald-300 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 dark:border-emerald-800 dark:hover:bg-emerald-900/20">
                                                                Buka materi
                                                            </a>
                                                            <button type="button" onClick={() => clearLessonMaterial(module.id, lesson.id)} className="inline-flex items-center rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20">
                                                                Hapus materi
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : null}
                                                {lesson.contentUrl && getMaterialPreviewType(lesson.contentUrl) === "image" ? (
                                                    <div className="md:col-span-2 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                                                        <Image src={lesson.contentUrl} alt={lesson.title || "Preview materi"} width={1200} height={720} className="max-h-64 w-full object-contain bg-slate-50 dark:bg-slate-950" unoptimized />
                                                    </div>
                                                ) : null}
                                                {lesson.contentUrl && getMaterialPreviewType(lesson.contentUrl) === "video" ? (
                                                    <div className="md:col-span-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                                                        <video src={lesson.contentUrl} controls className="max-h-64 w-full rounded-lg bg-black" />
                                                    </div>
                                                ) : null}
                                                {lesson.contentUrl && getMaterialPreviewType(lesson.contentUrl) === "pdf" ? (
                                                    <div className="md:col-span-2 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                                                        <iframe src={lesson.contentUrl} title={lesson.title || "Preview PDF materi"} className="h-72 w-full" />
                                                    </div>
                                                ) : null}
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="block text-xs font-semibold text-gray-500">{lesson.contentUrl ? "Ganti dengan upload file baru" : "Atau upload file materi"}</label>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png,.webp,.mp4,.webm,.doc,.docx,.ppt,.pptx"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                void uploadLessonMaterial(module.id, lesson.id, file);
                                                                e.currentTarget.value = "";
                                                            }
                                                        }}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-200"
                                                    />
                                                    {uploadingKey === `${module.id}-${lesson.id}` ? <p className="text-xs text-primary">Mengunggah file materi...</p> : null}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <Link href="/admin/pelatihan" className="flex-1 rounded-full border border-gray-200 px-6 py-4 text-center font-bold transition-all hover:border-red-500/50 dark:border-gray-700">
                        Batal
                    </Link>
                    <button type="submit" disabled={!hasTitle || !hasAtLeastOneModule || createMutation.isPending} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-4 font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 disabled:opacity-50">
                        {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Buat Pelatihan
                    </button>
                </div>
            </form>
        </div>
    );
}
