"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CheckCircle2, Loader2, Save, Sparkles, Users, XCircle } from "lucide-react";
import { fetchAdminCourses, fetchAdminEvent, fetchAdminQuizzes, updateAdminEvent } from "@/lib/api";
import { validateEventPayload } from "@/lib/event-validation";
import { formatRupiah } from "@/lib/events";
import { useToast } from "@/components/ui/toast";

const lifecycleOptions = [
    "DRAFT",
    "PUBLISHED",
    "REGISTRATION_OPEN",
    "REGISTRATION_CLOSED",
    "LEARNING_ACTIVE",
    "EVALUATION_OPEN",
    "COMPLETED",
    "ARCHIVED",
] as const;

type EventFormState = {
    courseId: string;
    title: string;
    category: string;
    slug: string;
    modality: string;
    status: string;
    summary: string;
    description: string;
    location: string;
    platform: string;
    scheduleSummary: string;
    contactName: string;
    contactPhone: string;
    termsSummary: string;
    refundPolicySummary: string;
    registrationStart: string;
    registrationEnd: string;
    eventStart: string;
    eventEnd: string;
    registrationFee: string;
    onlineTuitionFee: string;
    offlineTuitionFee: string;
    alumniRegistrationFee: string;
    learningEnabled: boolean;
    preTestEnabled: boolean;
    postTestEnabled: boolean;
    evaluationEnabled: boolean;
    certificateEnabled: boolean;
    isFeatured: boolean;
};

function toInputDate(value: string | null) {
    return value ? value.slice(0, 16) : "";
}

function toNumberOrNull(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
}

export default function AdminEventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [form, setForm] = React.useState<EventFormState | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-event", id],
        queryFn: () => fetchAdminEvent(id),
        enabled: !!id,
    });

    const { data: coursesData, isLoading: coursesLoading } = useQuery({
        queryKey: ["admin-courses"],
        queryFn: fetchAdminCourses,
        enabled: !!id,
    });

    const { data: quizzesData, isLoading: quizzesLoading } = useQuery({
        queryKey: ["admin-quizzes", form?.courseId || ""],
        queryFn: () => fetchAdminQuizzes(form?.courseId || undefined),
        enabled: !!form?.courseId,
    });

    const event = data?.event;

    React.useEffect(() => {
        if (!event) return;
        setForm({
            courseId: event.courseId || "",
            title: event.title,
            category: event.category,
            slug: event.slug,
            modality: event.modality,
            status: event.status,
            summary: event.summary || "",
            description: event.description || "",
            location: event.location || "",
            platform: event.platform || "",
            scheduleSummary: event.scheduleSummary || "",
            contactName: event.contactName || "",
            contactPhone: event.contactPhone || "",
            termsSummary: event.termsSummary || "",
            refundPolicySummary: event.refundPolicySummary || "",
            registrationStart: toInputDate(event.registrationStart),
            registrationEnd: toInputDate(event.registrationEnd),
            eventStart: toInputDate(event.eventStart),
            eventEnd: toInputDate(event.eventEnd),
            registrationFee: event.registrationFee?.toString() || "",
            onlineTuitionFee: event.onlineTuitionFee?.toString() || "",
            offlineTuitionFee: event.offlineTuitionFee?.toString() || "",
            alumniRegistrationFee: event.alumniRegistrationFee?.toString() || "",
            learningEnabled: event.learningEnabled,
            preTestEnabled: event.preTestEnabled,
            postTestEnabled: event.postTestEnabled,
            evaluationEnabled: event.evaluationEnabled,
            certificateEnabled: event.certificateEnabled,
            isFeatured: event.isFeatured,
        });
    }, [event]);

    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!form) throw new Error("Form not ready");
            const validation = validateEventPayload({
                ...form,
                registrationFee: toNumberOrNull(form.registrationFee),
                onlineTuitionFee: toNumberOrNull(form.onlineTuitionFee),
                offlineTuitionFee: toNumberOrNull(form.offlineTuitionFee),
                alumniRegistrationFee: toNumberOrNull(form.alumniRegistrationFee),
                registrationStart: form.registrationStart || null,
                registrationEnd: form.registrationEnd || null,
                eventStart: form.eventStart || null,
                eventEnd: form.eventEnd || null,
                courseId: form.courseId || null,
            });
            if (!validation.ok) {
                throw new Error(validation.errors[0]);
            }
            if (form.preTestEnabled && !quizTypes.has("PRE_TEST")) {
                throw new Error("Pelatihan tertaut harus punya quiz PRE_TEST sebelum fitur pre-test bisa diaktifkan");
            }
            if (form.postTestEnabled && !quizTypes.has("POST_TEST")) {
                throw new Error("Pelatihan tertaut harus punya quiz POST_TEST sebelum fitur post-test bisa diaktifkan");
            }
            return updateAdminEvent(id, {
                ...form,
                courseId: form.courseId || null,
                registrationFee: toNumberOrNull(form.registrationFee),
                onlineTuitionFee: toNumberOrNull(form.onlineTuitionFee),
                offlineTuitionFee: toNumberOrNull(form.offlineTuitionFee),
                alumniRegistrationFee: toNumberOrNull(form.alumniRegistrationFee),
                registrationStart: form.registrationStart || null,
                registrationEnd: form.registrationEnd || null,
                eventStart: form.eventStart || null,
                eventEnd: form.eventEnd || null,
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-event", id] });
            await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
            toast.success("Event berhasil diperbarui.");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const courses = coursesData?.courses ?? [];

    if (isLoading || coursesLoading || !form || !event) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const onlineTotal = (toNumberOrNull(form.registrationFee) ?? 0) + (toNumberOrNull(form.onlineTuitionFee) ?? 0);
    const offlineTotal = (toNumberOrNull(form.registrationFee) ?? 0) + (toNumberOrNull(form.offlineTuitionFee) ?? 0);
    const validation = validateEventPayload({
        ...form,
        registrationFee: toNumberOrNull(form.registrationFee),
        onlineTuitionFee: toNumberOrNull(form.onlineTuitionFee),
        offlineTuitionFee: toNumberOrNull(form.offlineTuitionFee),
        alumniRegistrationFee: toNumberOrNull(form.alumniRegistrationFee),
        registrationStart: form.registrationStart || null,
        registrationEnd: form.registrationEnd || null,
        eventStart: form.eventStart || null,
        eventEnd: form.eventEnd || null,
        courseId: form.courseId || null,
    });
    const quizTypes = new Set((quizzesData?.quizzes ?? []).map((quiz) => quiz.type));
    const readiness = {
        hasPreTest: quizTypes.has("PRE_TEST"),
        hasPostTest: quizTypes.has("POST_TEST"),
        certificateDependenciesMet: form.postTestEnabled && form.evaluationEnabled,
    };
    const isHybrid = form.modality === "HYBRID";

    return (
        <div className="space-y-8">
            <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
                <ArrowLeft className="h-4 w-4" /> Kembali ke events
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{form.category}</p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{form.title}</h1>
                    <p className="mt-1 text-gray-500">Kelola lifecycle, jadwal, biaya, narahubung, dan fitur pembelajaran event.</p>
                    {isHybrid ? (
                        <p className="mt-2 text-sm text-gray-500">Mode hybrid berarti satu event dibuka untuk dua jalur hadir sekaligus: webinar online dan seminar offline pada jadwal yang sama.</p>
                    ) : null}
                </div>
                <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-60">
                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan perubahan
                </button>
            </div>

            {!validation.ok ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                    {validation.errors[0]}
                </div>
            ) : null}

            {isHybrid ? (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-300">
                    Event ini sedang disiapkan sebagai format hybrid. Pastikan `Platform online`, `Lokasi offline`, biaya online/offline, dan class group webinar/seminar semuanya terisi agar pengalaman peserta konsisten.
                </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary" /><div><p className="text-2xl font-bold">{event._count.registrations}</p><p className="text-xs text-gray-500">Registrasi</p></div></div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-primary" /><div><p className="text-2xl font-bold">{form.eventStart ? new Date(form.eventStart).toLocaleDateString("id-ID") : "TBA"}</p><p className="text-xs text-gray-500">Mulai event</p></div></div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-primary" /><div><p className="text-2xl font-bold">{form.status}</p><p className="text-xs text-gray-500">Siklus</p></div></div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Informasi Dasar</h2>
                        <p className="mt-2 text-sm text-gray-500">Gunakan modality `HYBRID` bila event yang sama dibuka untuk peserta webinar online dan seminar offline.</p>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <input value={form.title} onChange={(e) => setForm((prev) => prev ? { ...prev, title: e.target.value } : prev)} placeholder="Judul event" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <input value={form.slug} onChange={(e) => setForm((prev) => prev ? { ...prev, slug: e.target.value } : prev)} placeholder="Slug" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <input value={form.category} onChange={(e) => setForm((prev) => prev ? { ...prev, category: e.target.value } : prev)} placeholder="Kategori" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <select value={form.modality} onChange={(e) => setForm((prev) => prev ? { ...prev, modality: e.target.value } : prev)} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700">
                                <option value="HYBRID">HYBRID</option>
                                <option value="ONLINE">ONLINE</option>
                                <option value="OFFLINE">OFFLINE</option>
                            </select>
                            <select value={form.status} onChange={(e) => setForm((prev) => prev ? { ...prev, status: e.target.value } : prev)} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700 md:col-span-2">
                                {lifecycleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                            </select>
                            <textarea value={form.summary} onChange={(e) => setForm((prev) => prev ? { ...prev, summary: e.target.value } : prev)} placeholder="Summary singkat" rows={3} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700 md:col-span-2" />
                            <textarea value={form.description} onChange={(e) => setForm((prev) => prev ? { ...prev, description: e.target.value } : prev)} placeholder="Deskripsi lengkap" rows={6} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700 md:col-span-2" />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Jadwal & Kontak</h2>
                        <p className="mt-2 text-sm text-gray-500">Untuk event hybrid, isi platform webinar dan lokasi seminar. Jadwal utama event dipakai sebagai acuan umum, lalu detail sesi bisa dipertegas di class group.</p>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <input type="datetime-local" value={form.registrationStart} onChange={(e) => setForm((prev) => prev ? { ...prev, registrationStart: e.target.value } : prev)} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <input type="datetime-local" value={form.registrationEnd} onChange={(e) => setForm((prev) => prev ? { ...prev, registrationEnd: e.target.value } : prev)} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <input type="datetime-local" value={form.eventStart} onChange={(e) => setForm((prev) => prev ? { ...prev, eventStart: e.target.value } : prev)} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <input type="datetime-local" value={form.eventEnd} onChange={(e) => setForm((prev) => prev ? { ...prev, eventEnd: e.target.value } : prev)} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <input value={form.location} onChange={(e) => setForm((prev) => prev ? { ...prev, location: e.target.value } : prev)} placeholder="Lokasi offline" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <input value={form.platform} onChange={(e) => setForm((prev) => prev ? { ...prev, platform: e.target.value } : prev)} placeholder="Platform online" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <input value={form.contactName} onChange={(e) => setForm((prev) => prev ? { ...prev, contactName: e.target.value } : prev)} placeholder="Nama kontak" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <input value={form.contactPhone} onChange={(e) => setForm((prev) => prev ? { ...prev, contactPhone: e.target.value } : prev)} placeholder="Nomor kontak" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <textarea value={form.scheduleSummary} onChange={(e) => setForm((prev) => prev ? { ...prev, scheduleSummary: e.target.value } : prev)} placeholder="Ringkasan jadwal" rows={3} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700 md:col-span-2" />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Konten Kebijakan</h2>
                        <div className="mt-5 grid gap-4">
                            <textarea value={form.termsSummary} onChange={(e) => setForm((prev) => prev ? { ...prev, termsSummary: e.target.value } : prev)} placeholder="Tata tertib / terms summary" rows={4} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <textarea value={form.refundPolicySummary} onChange={(e) => setForm((prev) => prev ? { ...prev, refundPolicySummary: e.target.value } : prev)} placeholder="Kebijakan refund / pembatalan" rows={4} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Biaya</h2>
                        <p className="mt-2 text-sm text-gray-500">Biaya online mewakili jalur webinar, sedangkan biaya offline mewakili jalur seminar pada event yang sama.</p>
                        <div className="mt-5 grid gap-4">
                            <input value={form.registrationFee} onChange={(e) => setForm((prev) => prev ? { ...prev, registrationFee: e.target.value } : prev)} placeholder="Biaya pendaftaran" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <input value={form.onlineTuitionFee} onChange={(e) => setForm((prev) => prev ? { ...prev, onlineTuitionFee: e.target.value } : prev)} placeholder="Biaya tuition online" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <input value={form.offlineTuitionFee} onChange={(e) => setForm((prev) => prev ? { ...prev, offlineTuitionFee: e.target.value } : prev)} placeholder="Biaya tuition offline" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                            <input value={form.alumniRegistrationFee} onChange={(e) => setForm((prev) => prev ? { ...prev, alumniRegistrationFee: e.target.value } : prev)} placeholder="Biaya alumni / waiver" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                        </div>
                        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
                            <div className="flex items-center justify-between"><span>Total webinar</span><strong>{formatRupiah(onlineTotal)}</strong></div>
                            <div className="mt-2 flex items-center justify-between"><span>Total seminar</span><strong>{formatRupiah(offlineTotal)}</strong></div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Pengaturan Fitur</h2>
                        <div className="mt-5 space-y-3 text-sm">
                            {[
                                ["learningEnabled", "Aktifkan akses pembelajaran"],
                                ["preTestEnabled", "Aktifkan pre-test"],
                                ["postTestEnabled", "Aktifkan post-test"],
                                ["evaluationEnabled", "Aktifkan evaluasi event"],
                                ["certificateEnabled", "Aktifkan penerbitan sertifikat"],
                                ["isFeatured", "Tampilkan di katalog publik"],
                            ].map(([key, label]) => (
                                <label key={key} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-800">
                                    <span>{label}</span>
                                    <input
                                        type="checkbox"
                                        checked={Boolean(form[key as keyof EventFormState])}
                                        onChange={(e) => setForm((prev) => prev ? { ...prev, [key]: e.target.checked } : prev)}
                                    />
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Pelatihan Tertaut</h2>
                        <div className="mt-5 space-y-4 text-sm text-gray-500">
                            <select
                                value={form.courseId}
                                onChange={(e) => setForm((prev) => prev ? { ...prev, courseId: e.target.value } : prev)}
                                className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700"
                            >
                                <option value="">Tanpa pelatihan tertaut</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>

                            {form.courseId ? (
                                <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {courses.find((course) => course.id === form.courseId)?.title || "Pelatihan terpilih"}
                                    </p>
                                    <p className="mt-1 text-xs">Materi, progress, quiz, evaluasi, dan sertifikat event akan mengikuti pelatihan ini.</p>
                                    {isHybrid ? <p className="mt-2 text-xs">Peserta webinar dan seminar tetap berbagi alur akademik yang sama; perbedaan utamanya ada pada jalur hadir dan operasional class group.</p> : null}
                                    <Link href={`/admin/events/${event.id}/quizzes`} className="mt-3 inline-flex text-xs font-semibold text-primary hover:underline">
                                        Kelola quiz pelatihan dari event ini
                                    </Link>
                                    <Link href={`/admin/events/${event.id}/class-groups`} className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">
                                        Kelola class groups event ini
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p>Event tanpa pelatihan tertaut hanya mendukung registrasi dan operasional tanpa penyampaian pembelajaran.</p>
                                    {isHybrid ? <p className="text-xs">Cocok untuk webinar + seminar yang fokus ke kehadiran live tanpa LMS, selama info platform, venue, dan class group sudah lengkap.</p> : null}
                                    <Link href={`/admin/events/${event.id}/class-groups`} className="inline-flex text-xs font-semibold text-primary hover:underline">
                                        Kelola class groups event ini
                                    </Link>
                                </div>
                            )}

                            {form.courseId ? (
                                <div className="rounded-xl border border-gray-100 px-4 py-4 dark:border-gray-800">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-gray-900 dark:text-white">Kesiapan Quiz</p>
                                        {quizzesLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
                                    </div>
                                     <div className="mt-3 space-y-2 text-xs">
                                         <div className="flex items-center gap-2">
                                             {readiness.hasPreTest ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                             <span>PRE_TEST {readiness.hasPreTest ? "tersedia" : "belum ada"}</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             {readiness.hasPostTest ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                             <span>POST_TEST {readiness.hasPostTest ? "tersedia" : "belum ada"}</span>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             {form.evaluationEnabled ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                              <span>Evaluasi {form.evaluationEnabled ? "aktif" : "wajib untuk sertifikat"}</span>
                                         </div>
                                     </div>
                                     {(form.preTestEnabled && !readiness.hasPreTest) || (form.postTestEnabled && !readiness.hasPostTest) ? (
                                         <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                                              Tambahkan quiz PRE_TEST / POST_TEST pada pelatihan tertaut sebelum mengaktifkan fitur test di event.
                                         </div>
                                     ) : null}
                                     <div className={`mt-3 rounded-lg px-3 py-2 text-xs ${readiness.certificateDependenciesMet ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"}`}>
                                         {readiness.certificateDependenciesMet
                                              ? "Kesiapan sertifikat: dependensi dasar sudah siap. Peserta tetap harus lulus POST_TEST dan mengirim evaluasi sebelum sertifikat bisa terbit."
                                              : "Kesiapan sertifikat: event harus mengaktifkan POST_TEST dan evaluasi. Sertifikat baru bisa terbit setelah peserta lulus POST_TEST dan mengirim evaluasi."}
                                     </div>
                                 </div>
                             ) : null}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
