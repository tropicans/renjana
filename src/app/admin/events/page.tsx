"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Loader2, Plus, Sparkles, Users } from "lucide-react";
import { createAdminEvent, fetchAdminEvents, updateAdminEvent } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/lib/context/user-context";
import { validateEventPayload } from "@/lib/event-validation";
import { slugifyEventTitle } from "@/lib/events";

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

export default function AdminEventsPage() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const searchParams = useSearchParams();
    const { user, isLoading: authLoading } = useUser();
    const [showForm, setShowForm] = React.useState(false);
    const [readinessFilter, setReadinessFilter] = React.useState<"all" | "certificate-ready" | "certificate-blocked" | "foundation-ready">("all");
    const [title, setTitle] = React.useState("");
    const [category, setCategory] = React.useState("PKPA");
    const [modality, setModality] = React.useState("HYBRID");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-events"],
        queryFn: fetchAdminEvents,
        enabled: user?.role === "ADMIN",
    });

    const createMutation = useMutation({
        mutationFn: () => {
            const slug = slugifyEventTitle(title);
            const validation = validateEventPayload({
                title,
                slug,
                learningEnabled: false,
                preTestEnabled: false,
                postTestEnabled: false,
                evaluationEnabled: false,
                certificateEnabled: false,
                courseId: null,
            });
            if (!validation.ok) {
                throw new Error(validation.errors[0]);
            }
            return createAdminEvent({ title, slug, category, modality });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
            setTitle("");
            setShowForm(false);
            toast.success("Event berhasil dibuat.");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateAdminEvent(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-events"] });
            toast.success("Lifecycle event diperbarui.");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const events = data?.events ?? [];
    const legacySource = searchParams.get("fromLegacy");
    const filteredEvents = events.filter((event) => {
        const certificateReady = event.certificateEnabled && event.postTestEnabled && event.evaluationEnabled;
        const certificateBlocked = event.certificateEnabled && (!event.postTestEnabled || !event.evaluationEnabled);
        const foundationReady = !event.certificateEnabled && (event.postTestEnabled || event.evaluationEnabled);

        if (readinessFilter === "certificate-ready") return certificateReady;
        if (readinessFilter === "certificate-blocked") return certificateBlocked;
        if (readinessFilter === "foundation-ready") return foundationReady;
        return true;
    });
    const createValidation = validateEventPayload({
        title,
        slug: slugifyEventTitle(title),
        learningEnabled: false,
        preTestEnabled: false,
        postTestEnabled: false,
        evaluationEnabled: false,
        certificateEnabled: false,
        courseId: null,
    });

    if (authLoading || isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Events</h1>
                    <p className="mt-1 text-gray-500">Kelola kegiatan publik, lifecycle, dan kesiapan pembelajaran.</p>
                </div>
                <button onClick={() => setShowForm((value) => !value)} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">
                    <Plus className="h-4 w-4" /> Tambah Event
                </button>
            </div>

            {legacySource ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-300 md:flex-row md:items-center md:justify-between">
                    <p>
                        Flow admin untuk <span className="font-semibold">{legacySource}</span> sudah dipusatkan ke Events agar pengelolaan lifecycle, lokasi, dan aktivitas event tetap dalam satu panel.
                    </p>
                    <button onClick={() => setShowForm(true)} className="inline-flex items-center justify-center rounded-full bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                        Buat event baru
                    </button>
                </div>
            ) : null}

            {showForm ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="grid gap-4 md:grid-cols-3">
                        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul event" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Kategori" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                        <select value={modality} onChange={(e) => setModality(e.target.value)} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700">
                            <option value="HYBRID">HYBRID</option>
                            <option value="ONLINE">ONLINE</option>
                            <option value="OFFLINE">OFFLINE</option>
                        </select>
                    </div>
                    {!createValidation.ok ? (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                            {createValidation.errors[0]}
                        </div>
                    ) : null}
                    <button onClick={() => createMutation.mutate()} disabled={!title || createMutation.isPending} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                        {createMutation.isPending ? "Menyimpan..." : "Simpan event"}
                    </button>
                </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
                {[
                    { key: "all", label: `All (${events.length})` },
                    {
                        key: "certificate-ready",
                        label: `Certificate Ready (${events.filter((event) => event.certificateEnabled && event.postTestEnabled && event.evaluationEnabled).length})`,
                    },
                    {
                        key: "certificate-blocked",
                        label: `Blocked (${events.filter((event) => event.certificateEnabled && (!event.postTestEnabled || !event.evaluationEnabled)).length})`,
                    },
                    {
                        key: "foundation-ready",
                        label: `Foundation (${events.filter((event) => !event.certificateEnabled && (event.postTestEnabled || event.evaluationEnabled)).length})`,
                    },
                ].map((filter) => (
                    <button
                        key={filter.key}
                        type="button"
                        onClick={() => setReadinessFilter(filter.key as typeof readinessFilter)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${readinessFilter === filter.key ? "bg-primary text-white" : "border border-gray-200 text-gray-600 hover:border-primary/30 hover:text-primary dark:border-gray-700 dark:text-gray-300"}`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            <div className="grid gap-4">
                {filteredEvents.map((event) => (
                    <article key={event.id} className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        {(() => {
                            const certificateReady = event.certificateEnabled && event.postTestEnabled && event.evaluationEnabled;

                            return (
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                                    <span>{event.category}</span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">{event.modality}</span>
                                    {event.isFeatured ? <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">Featured</span> : null}
                                </div>
                                <h2 className="text-2xl font-bold">{event.title}</h2>
                                <div className="flex flex-wrap gap-5 text-sm text-gray-500">
                                    <span className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {event._count.registrations} registrations</span>
                                    <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {event.eventStart ? new Date(event.eventStart).toLocaleDateString("id-ID") : "Tanggal belum diatur"}</span>
                                    <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> {event.status}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2 text-xs">
                                    {event.learningEnabled ? <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">Learning</span> : null}
                                    {event.preTestEnabled ? <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">Pre-test</span> : null}
                                    {event.postTestEnabled ? <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">Post-test</span> : null}
                                    {event.evaluationEnabled ? <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">Evaluation</span> : null}
                                    {event.certificateEnabled ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Certificate</span> : null}
                                </div>
                                {event.certificateEnabled ? (
                                    <div className={`inline-flex rounded-xl px-3 py-2 text-xs font-medium ${certificateReady ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"}`}>
                                        {certificateReady
                                            ? "Certificate path ready: event sudah mengaktifkan POST_TEST dan evaluation."
                                            : "Certificate belum siap: aktifkan POST_TEST dan evaluation agar penerbitan sertifikat valid."}
                                    </div>
                                ) : null}
                                {!event.certificateEnabled && (event.postTestEnabled || event.evaluationEnabled) ? (
                                    <div className="inline-flex rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                        Foundation ready: POST_TEST / evaluation sudah aktif, certificate bisa dinyalakan saat siap.
                                    </div>
                                ) : null}
                            </div>
                            <div className="flex flex-col gap-3 lg:items-end">
                                <select
                                    value={event.status}
                                    onChange={(e) => updateMutation.mutate({ id: event.id, data: { status: e.target.value } })}
                                    className="rounded-xl border border-gray-200 bg-transparent px-4 py-2 text-sm dark:border-gray-700"
                                >
                                    {lifecycleOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <div className="flex flex-wrap justify-end gap-2">
                                    <button onClick={() => updateMutation.mutate({ id: event.id, data: { learningEnabled: !event.learningEnabled } })} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold dark:border-gray-700">{event.learningEnabled ? "Disable" : "Enable"} learning</button>
                                    <button onClick={() => updateMutation.mutate({ id: event.id, data: { evaluationEnabled: !event.evaluationEnabled } })} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold dark:border-gray-700">{event.evaluationEnabled ? "Disable" : "Enable"} evaluation</button>
                                    <button onClick={() => updateMutation.mutate({ id: event.id, data: { isFeatured: !event.isFeatured } })} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold dark:border-gray-700">{event.isFeatured ? "Unfeature" : "Feature"}</button>
                                    <Link href={`/admin/events/${event.id}`} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:text-gray-200">
                                        Kelola
                                    </Link>
                                    <Link href={`/admin/events/${event.id}/quizzes`} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:text-gray-200">
                                        Kelola quiz
                                    </Link>
                                    <Link href={`/events/${event.slug}`} className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:text-gray-200">
                                        Lihat publik
                                    </Link>
                                </div>
                            </div>
                        </div>
                            );
                        })()}
                    </article>
                ))}
                {filteredEvents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-[#1a242f] dark:text-gray-400">
                        Tidak ada event yang cocok dengan filter readiness saat ini.
                    </div>
                ) : null}
            </div>
        </div>
    );
}
