"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminLessonMaterials, fetchAdminCourse, type ApiAdminCourseDetail, updateCourse, uploadAdminLessonMaterial } from "@/lib/api";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { ArrowLeft, Users, Layers, FileText, Loader2, CheckCircle, Save, Plus, Trash2, ChevronUp, ChevronDown, FileImage, FileVideo, File as FileIcon } from "lucide-react";

const statusOptions = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const lessonTypeOptions = ["VIDEO", "QUIZ", "READING", "ASSIGNMENT"] as const;

type LessonForm = {
    id?: string;
    title: string;
    type: string;
    durationMin: string;
    contentUrl: string;
    materialFileName: string | null;
    materialFileType: string | null;
    materialSize: number | null;
};

type ModuleForm = {
    id?: string;
    title: string;
    lessons: LessonForm[];
};

function mapModulesToForm(modules: ApiAdminCourseDetail["modules"]): ModuleForm[] {
    return modules.map((module) => ({
        id: module.id,
        title: module.title,
        lessons: module.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            durationMin: lesson.durationMin?.toString() || "",
            contentUrl: lesson.contentUrl || "",
            materialFileName: lesson.materialFileName || null,
            materialFileType: lesson.materialFileType || null,
            materialSize: lesson.materialFileSize || null,
        })),
    }));
}

function createEmptyLesson(): LessonForm {
    return {
        title: "",
        type: "VIDEO",
        durationMin: "",
        contentUrl: "",
        materialFileName: null,
        materialFileType: null,
        materialSize: null,
    };
}

function createEmptyModule(): ModuleForm {
    return {
        title: "",
        lessons: [createEmptyLesson()],
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

export function AdminTrainingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [form, setForm] = React.useState({
        title: "",
        description: "",
        status: "DRAFT",
    });
    const [modules, setModules] = React.useState<ModuleForm[]>([]);
    const [uploadingKey, setUploadingKey] = React.useState<string | null>(null);
    const [pendingUploadUrls, setPendingUploadUrls] = React.useState<string[]>([]);
    const pendingUploadUrlsRef = React.useRef<string[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-course", id],
        queryFn: () => fetchAdminCourse(id),
        enabled: !!id,
    });

    const course = data?.course;

    React.useEffect(() => {
        if (!course) return;
        setForm({
            title: course.title,
            description: course.description || "",
            status: course.status,
        });
        setModules(mapModulesToForm(course.modules || []));
    }, [course]);

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

    const saveMutation = useMutation({
        mutationFn: () => updateCourse(id, {
            title: form.title.trim(),
            description: form.description.trim(),
            status: form.status,
            modules: modules
                .filter((module) => module.title.trim())
                .map((module, moduleIndex) => ({
                    title: module.title.trim(),
                    order: moduleIndex + 1,
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-course", id] });
            queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
            setPendingUploadUrls([]);
            toast.success("Pelatihan berhasil diperbarui.");
        },
    });

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!course) return <div className="py-12 text-center text-gray-500">Pelatihan tidak ditemukan</div>;

    const totalLessons = course.modules?.reduce((acc, module) => acc + (module.lessons?.length ?? 0), 0) ?? 0;
    const enrollments = course.enrollments ?? [];
    const serializedModules = JSON.stringify(modules);
    const initialSerializedModules = JSON.stringify(mapModulesToForm(course.modules || []));
    const isDirty = form.title !== course.title || form.description !== (course.description || "") || form.status !== course.status || serializedModules !== initialSerializedModules;
    const isTitleEmpty = !form.title.trim();

    function updateModuleTitle(index: number, value: string) {
        setModules((prev) => prev.map((module, moduleIndex) => moduleIndex === index ? { ...module, title: value } : module));
    }

    function removeModule(index: number) {
        const removedUrls = modules[index]?.lessons
            .map((lesson) => lesson.contentUrl)
            .filter((url): url is string => pendingUploadUrls.includes(url)) ?? [];
        if (removedUrls.length > 0) {
            void deleteAdminLessonMaterials(removedUrls);
            setPendingUploadUrls((prev) => prev.filter((url) => !removedUrls.includes(url)));
        }
        setModules((prev) => prev.filter((_, moduleIndex) => moduleIndex !== index));
    }

    function addModule() {
        setModules((prev) => [...prev, createEmptyModule()]);
    }

    function moveModule(index: number, direction: "up" | "down") {
        setModules((prev) => moveItem(prev, index, direction === "up" ? index - 1 : index + 1));
    }

    function addLesson(moduleIndex: number) {
        setModules((prev) => prev.map((module, index) => index === moduleIndex ? { ...module, lessons: [...module.lessons, createEmptyLesson()] } : module));
    }

    function moveLesson(moduleIndex: number, lessonIndex: number, direction: "up" | "down") {
        setModules((prev) => prev.map((module, index) => {
            if (index !== moduleIndex) return module;
            return {
                ...module,
                lessons: moveItem(module.lessons, lessonIndex, direction === "up" ? lessonIndex - 1 : lessonIndex + 1),
            };
        }));
    }

    function removeLesson(moduleIndex: number, lessonIndex: number) {
        const currentUrl = modules[moduleIndex]?.lessons[lessonIndex]?.contentUrl;
        if (currentUrl && pendingUploadUrls.includes(currentUrl)) {
            void deleteAdminLessonMaterials([currentUrl]);
            setPendingUploadUrls((prev) => prev.filter((url) => url !== currentUrl));
        }
        setModules((prev) => prev.map((module, index) => index === moduleIndex ? { ...module, lessons: module.lessons.filter((_, currentLessonIndex) => currentLessonIndex !== lessonIndex) } : module));
    }

    function updateLesson(moduleIndex: number, lessonIndex: number, key: keyof LessonForm, value: string) {
        setModules((prev) => prev.map((module, index) => {
            if (index !== moduleIndex) return module;
            return {
                ...module,
                lessons: module.lessons.map((lesson, currentLessonIndex) => currentLessonIndex === lessonIndex ? { ...lesson, [key]: value } : lesson),
            };
        }));
    }

    async function uploadLessonMaterial(moduleIndex: number, lessonIndex: number, file: File) {
        const key = `${moduleIndex}-${lessonIndex}`;
        setUploadingKey(key);

        try {
            const result = await uploadAdminLessonMaterial(file);
            const previousPendingUrl = modules[moduleIndex]?.lessons[lessonIndex]?.contentUrl;
            if (previousPendingUrl && pendingUploadUrls.includes(previousPendingUrl)) {
                await deleteAdminLessonMaterials([previousPendingUrl]);
                setPendingUploadUrls((prev) => prev.filter((url) => url !== previousPendingUrl));
            }
            setModules((prev) => prev.map((module, currentModuleIndex) => currentModuleIndex === moduleIndex ? {
                ...module,
                lessons: module.lessons.map((lesson, currentLessonIndex) => currentLessonIndex === lessonIndex ? {
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
    }

    function clearLessonMaterial(moduleIndex: number, lessonIndex: number) {
        const currentUrl = modules[moduleIndex]?.lessons[lessonIndex]?.contentUrl;
        if (currentUrl && pendingUploadUrls.includes(currentUrl)) {
            void deleteAdminLessonMaterials([currentUrl]);
            setPendingUploadUrls((prev) => prev.filter((url) => url !== currentUrl));
        }
        setModules((prev) => prev.map((module, currentModuleIndex) => currentModuleIndex === moduleIndex ? {
            ...module,
            lessons: module.lessons.map((lesson, currentLessonIndex) => currentLessonIndex === lessonIndex ? { ...lesson, contentUrl: "", materialFileName: null, materialFileType: null, materialSize: null } : lesson),
        } : module));
        toast.success("Materi lesson dihapus.");
    }

    return (
        <div className="space-y-8">
            <Link href="/admin/pelatihan" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary"><ArrowLeft className="h-4 w-4" /> Kembali</Link>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{course.title}</h1>
                    <p className="mt-1 text-gray-500">Kelola info utama program, status publikasi, silabus, dan peserta.</p>
                </div>
                <button onClick={() => saveMutation.mutate()} disabled={!isDirty || isTitleEmpty || saveMutation.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Simpan perubahan
                </button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold">Informasi Pelatihan</h2>
                        <p className="mt-1 text-sm text-gray-500">Perbarui nama pelatihan, deskripsi singkat, dan status tampil di katalog.</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${form.status === "PUBLISHED" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300" : form.status === "ARCHIVED" ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"}`}>
                        {form.status}
                    </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium">Judul pelatihan</label>
                        <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Masukkan judul pelatihan" className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium">Deskripsi</label>
                        <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Ringkasan materi atau tujuan pelatihan" rows={5} className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">Status publikasi</label>
                        <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700">
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        Pelatihan `PUBLISHED` tampil untuk peserta, `DRAFT` disiapkan internal, dan `ARCHIVED` disimpan tanpa dipromosikan.
                    </div>
                </div>
                {isTitleEmpty ? <p className="mt-3 text-sm text-red-500">Judul pelatihan wajib diisi.</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Layers className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{course.modules?.length ?? 0}</p><p className="text-xs text-gray-500">Modul</p></div></div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10"><FileText className="h-5 w-5 text-blue-500" /></div><div><p className="text-2xl font-bold">{totalLessons}</p><p className="text-xs text-gray-500">Lessons</p></div></div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10"><Users className="h-5 w-5 text-green-500" /></div><div><p className="text-2xl font-bold">{course.enrollments?.length ?? 0}</p><p className="text-xs text-gray-500">Peserta</p></div></div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold">Silabus</h2>
                {modules.map((module, moduleIndex) => (
                    <div key={module.id || `module-${moduleIndex}`} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium">Modul {moduleIndex + 1}</label>
                                <input value={module.title} onChange={(e) => updateModuleTitle(moduleIndex, e.target.value)} placeholder="Judul modul" className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            </div>
                            <div className="mt-7 flex items-center gap-2">
                                <button type="button" onClick={() => moveModule(moduleIndex, "up")} disabled={moduleIndex === 0} className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"><ChevronUp className="h-4 w-4" /></button>
                                <button type="button" onClick={() => moveModule(moduleIndex, "down")} disabled={moduleIndex === modules.length - 1} className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"><ChevronDown className="h-4 w-4" /></button>
                                <button type="button" onClick={() => removeModule(moduleIndex)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/10"><Trash2 className="h-4 w-4" /> Hapus modul</button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {module.lessons.map((lesson, lessonIndex) => (
                                <div key={lesson.id || `lesson-${moduleIndex}-${lessonIndex}`} className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold">Lesson {lessonIndex + 1}</p>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => moveLesson(moduleIndex, lessonIndex, "up")} disabled={lessonIndex === 0} className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-2 py-1 text-gray-600 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"><ChevronUp className="h-3.5 w-3.5" /></button>
                                            <button type="button" onClick={() => moveLesson(moduleIndex, lessonIndex, "down")} disabled={lessonIndex === module.lessons.length - 1} className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-2 py-1 text-gray-600 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"><ChevronDown className="h-3.5 w-3.5" /></button>
                                            <button type="button" onClick={() => removeLesson(moduleIndex, lessonIndex)} className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /> Hapus</button>
                                        </div>
                                    </div>

                                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                                        <input value={lesson.title} onChange={(e) => updateLesson(moduleIndex, lessonIndex, "title", e.target.value)} placeholder="Judul lesson" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700 md:col-span-2" />
                                        <select value={lesson.type} onChange={(e) => updateLesson(moduleIndex, lessonIndex, "type", e.target.value)} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700">
                                            {lessonTypeOptions.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <input value={lesson.durationMin} onChange={(e) => updateLesson(moduleIndex, lessonIndex, "durationMin", e.target.value)} placeholder="Durasi (menit)" inputMode="numeric" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                                        <input value={lesson.contentUrl} onChange={(e) => updateLesson(moduleIndex, lessonIndex, "contentUrl", e.target.value)} placeholder="URL materi / video" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700 md:col-span-2" />
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
                                                    <button type="button" onClick={() => clearLessonMaterial(moduleIndex, lessonIndex)} className="inline-flex items-center rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20">
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
                                                        void uploadLessonMaterial(moduleIndex, lessonIndex, file);
                                                        e.currentTarget.value = "";
                                                    }
                                                }}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-200"
                                            />
                                            {uploadingKey === `${moduleIndex}-${lessonIndex}` ? <p className="text-xs text-primary">Mengunggah file materi...</p> : null}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => addLesson(moduleIndex)} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:text-gray-200"><Plus className="h-4 w-4" /> Tambah lesson</button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addModule} className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:text-gray-200"><Plus className="h-4 w-4" /> Tambah modul</button>
            </div>

            {enrollments.length > 0 ? (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Peserta Terdaftar</h2>
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-[#1a242f]">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-gray-100 text-left text-gray-500 dark:border-gray-800"><th className="p-4 font-semibold">Nama</th><th className="p-4 font-semibold">Email</th><th className="p-4 font-semibold">Progress</th><th className="p-4 font-semibold">Status</th></tr></thead>
                            <tbody>
                                {enrollments.map((enrollment: NonNullable<ApiAdminCourseDetail["enrollments"]>[number]) => (
                                    <tr key={enrollment.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800/50">
                                        <td className="p-4 font-medium">{enrollment.user.fullName}</td>
                                        <td className="p-4 text-gray-500">{enrollment.user.email}</td>
                                        <td className="p-4"><div className="flex items-center gap-2"><div className="h-2 w-24 rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-primary" style={{ width: `${enrollment.completionPercentage}%` }} /></div><span className="text-xs">{enrollment.completionPercentage}%</span></div></td>
                                        <td className="p-4">{enrollment.status === "COMPLETED" ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3.5 w-3.5" /> Selesai</span> : <span className="text-xs text-amber-600">Aktif</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
