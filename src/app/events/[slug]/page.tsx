"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CheckCircle2, FileCheck2, Loader2, MapPin, ScrollText, Users } from "lucide-react";
import { SiteHeader } from "@/components/ui/site-header";
import { fetchEventBySlug } from "@/lib/api";
import { formatRupiah } from "@/lib/events";

function formatEventDateTime(value: string | null | undefined) {
    if (!value) return "TBA";

    return new Date(value).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function EventDetailPage() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug;

    const { data, isLoading, error } = useQuery({
        queryKey: ["event", slug],
        queryFn: () => fetchEventBySlug(slug),
        enabled: !!slug,
    });

    const event = data?.event;

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (error || !event) {
        return <div className="flex min-h-screen items-center justify-center text-center text-slate-500">Event tidak ditemukan.</div>;
    }

    const onlineTotal = (event.onlineTuitionFee ?? 0) + (event.registrationFee ?? 0);
    const offlineTotal = (event.offlineTuitionFee ?? 0) + (event.registrationFee ?? 0);
    const isHybrid = event.modality === "HYBRID";
    const learningLabel = event.learningEnabled ? "Akses materi & assessment" : "Akses live event saja";
    const featureLabel = [
        event.preTestEnabled ? "pre-test" : null,
        event.postTestEnabled ? "post-test" : null,
        event.evaluationEnabled ? "evaluasi" : null,
        event.learningEnabled ? "pembelajaran" : null,
    ].filter(Boolean).join(", ") || "registrasi dan kehadiran";

    return (
        <div className="min-h-screen bg-background-light text-[#111418] dark:bg-background-dark dark:text-white">
            <SiteHeader />

            <main className="mx-auto max-w-[1200px] px-6 pb-20 pt-24">
                <Link href="/events" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke kegiatan
                </Link>

                <section className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
                    <div className="space-y-8">
                        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                            <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                <span>{event.category}</span>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] dark:bg-slate-800">{event.modality}</span>
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{event.status}</span>
                            </div>
                            <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">{event.title}</h1>
                            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">{event.description || event.summary}</p>
                            {isHybrid ? (
                                <div className="mt-6 rounded-[28px] border border-primary/15 bg-primary/5 p-5 text-sm text-slate-700 dark:border-primary/20 dark:bg-primary/10 dark:text-slate-200">
                                    <p className="font-bold text-slate-900 dark:text-white">Event hybrid: webinar online + seminar offline</p>
                                    <p className="mt-2 leading-6">Keduanya berlangsung pada jadwal yang sama. Pilih jalur webinar jika ingin hadir secara online, atau seminar jika ingin hadir langsung di lokasi.</p>
                                </div>
                            ) : null}

                            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                                    <p className="text-xs text-slate-400">Mulai kegiatan</p>
                                    <p className="mt-1 font-semibold">{formatEventDateTime(event.eventStart)}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                                    <p className="text-xs text-slate-400">Pendaftaran</p>
                                    <p className="mt-1 font-semibold">{event.registrationEnd ? `s.d. ${new Date(event.registrationEnd).toLocaleDateString("id-ID")}` : "TBA"}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                                    <p className="text-xs text-slate-400">Peserta</p>
                                    <p className="mt-1 font-semibold">{event._count.registrations} terdaftar</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                                    <p className="text-xs text-slate-400">Pembelajaran</p>
                                    <p className="mt-1 font-semibold">{learningLabel}</p>
                                </div>
                            </div>
                        </div>

                        {isHybrid ? (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="rounded-[28px] border border-sky-200 bg-sky-50 p-6 shadow-sm dark:border-sky-900/40 dark:bg-sky-950/20">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">Webinar</p>
                                    <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Ikut online di waktu yang sama</h2>
                                    <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-300" /> Jadwal live: {formatEventDateTime(event.eventStart)}</div>
                                        <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-300" /> Platform: {event.platform || "Akan diumumkan panitia"}</div>
                                        <div className="flex items-start gap-3"><Users className="mt-0.5 h-4 w-4 text-sky-600 dark:text-sky-300" /> Cocok untuk peserta yang ingin hadir jarak jauh dengan akses live.</div>
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">Seminar</p>
                                    <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">Ikut offline di venue yang sama</h2>
                                    <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-300" /> Jadwal hadir: {formatEventDateTime(event.eventStart)}</div>
                                        <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-300" /> Lokasi: {event.location || "Venue akan diumumkan panitia"}</div>
                                        <div className="flex items-start gap-3"><Users className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-300" /> Cocok untuk peserta yang ingin hadir langsung, check-in di venue, dan mengikuti sesi tatap muka.</div>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <h2 className="text-xl font-bold">Informasi Utama</h2>
                                <div className="mt-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 text-primary" /> {event.scheduleSummary || "Jadwal detail akan diinformasikan oleh panitia."}</div>
                                    <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> {isHybrid ? `Online via ${event.platform || "platform menyusul"} dan offline di ${event.location || "venue menyusul"}` : event.location || event.platform || "Lokasi/platform akan diumumkan"}</div>
                                    <div className="flex items-start gap-3"><Users className="mt-0.5 h-4 w-4 text-primary" /> Fitur aktif: {featureLabel}</div>
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <h2 className="text-xl font-bold">Persyaratan Alur</h2>
                                <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex items-start gap-3"><FileCheck2 className="mt-0.5 h-4 w-4 text-primary" /> Pilih jalur kehadiran webinar atau seminar sebelum melengkapi biodata.</div>
                                    <div className="flex items-start gap-3"><FileCheck2 className="mt-0.5 h-4 w-4 text-primary" /> Lengkapi dokumen dan pembayaran sesuai alur registrasi.</div>
                                    <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> Setelah diverifikasi, peserta webinar mendapat akses live online dan peserta seminar mendapat info venue/check-in.</div>
                                    <div className="flex items-start gap-3"><ScrollText className="mt-0.5 h-4 w-4 text-primary" /> Evaluasi penyelenggaraan dibuka setelah phase event aktif.</div>
                                </div>
                            </div>
                        </div>

                        {event.course?.modules?.length ? (
                            <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <h2 className="text-2xl font-bold">Rencana Pembelajaran</h2>
                                <div className="mt-6 space-y-4">
                                    {event.course.modules.map((module, index) => (
                                        <div key={module.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{index + 1}</div>
                                                <div>
                                                    <h3 className="font-bold">{module.title}</h3>
                                                    <p className="text-xs text-slate-400">{module.lessons.length} materi</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 space-y-2 pl-12 text-sm text-slate-500 dark:text-slate-400">
                                                {module.lessons.map((lesson) => (
                                                    <div key={lesson.id} className="flex items-center justify-between gap-3">
                                                        <span>{lesson.title}</span>
                                                        <span>{lesson.durationMin ? `${lesson.durationMin} min` : lesson.type}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : null}
                    </div>

                    <aside className="lg:sticky lg:top-24 lg:h-fit">
                        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                            <h2 className="text-xl font-bold">Pendaftaran</h2>
                            <div className="mt-5 space-y-4 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
                                <div>
                                    <p className="text-xs text-slate-400">Webinar online</p>
                                    <p className="mt-1 font-semibold">{formatRupiah(onlineTotal)}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Akses live via {event.platform || "platform menyusul"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Seminar offline</p>
                                    <p className="mt-1 font-semibold">{formatRupiah(offlineTotal)}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Hadir langsung di {event.location || "venue menyusul"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Narahubung</p>
                                    <p className="mt-1 font-semibold">{event.contactName || "Renjana"}{event.contactPhone ? ` (${event.contactPhone})` : ""}</p>
                                </div>
                            </div>

                            <Link href={`/events/${event.slug}/register`} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">
                                Pilih webinar atau seminar
                            </Link>

                            <div className="mt-5 text-xs leading-6 text-slate-500 dark:text-slate-400">
                                Pendaftaran dilakukan dalam beberapa langkah: pilih mode kehadiran, isi biodata, upload dokumen, selesaikan pembayaran, lalu submit untuk verifikasi admin.
                            </div>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}
