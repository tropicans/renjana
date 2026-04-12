"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CheckCircle2, FileCheck2, Loader2, MapPin, ScrollText, Users } from "lucide-react";
import { SiteHeader } from "@/components/ui/site-header";
import { fetchEventBySlug } from "@/lib/api";
import { formatRupiah } from "@/lib/events";

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

                            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                                    <p className="text-xs text-slate-400">Mulai kegiatan</p>
                                    <p className="mt-1 font-semibold">{event.eventStart ? new Date(event.eventStart).toLocaleDateString("id-ID") : "TBA"}</p>
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
                                    <p className="mt-1 font-semibold">{event.learningEnabled ? "Aktif" : "Registrasi saja"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <h2 className="text-xl font-bold">Informasi Utama</h2>
                                <div className="mt-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex items-start gap-3"><CalendarDays className="mt-0.5 h-4 w-4 text-primary" /> {event.scheduleSummary || "Jadwal detail akan diinformasikan oleh panitia."}</div>
                                    <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> {event.location || event.platform || "Lokasi/platform akan diumumkan"}</div>
                                    <div className="flex items-start gap-3"><Users className="mt-0.5 h-4 w-4 text-primary" /> Feature aktif: {event.preTestEnabled ? "pre-test, " : ""}{event.postTestEnabled ? "post-test, " : ""}{event.evaluationEnabled ? "evaluasi" : "pembelajaran"}</div>
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <h2 className="text-xl font-bold">Persyaratan Alur</h2>
                                <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex items-start gap-3"><FileCheck2 className="mt-0.5 h-4 w-4 text-primary" /> Lengkapi form biodata dan dokumen.</div>
                                    <div className="flex items-start gap-3"><FileCheck2 className="mt-0.5 h-4 w-4 text-primary" /> Upload bukti pembayaran sebelum submit final.</div>
                                    <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> Setelah diverifikasi, peserta dapat mengakses materi dan assessment.</div>
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
                                    <p className="text-xs text-slate-400">Mode online</p>
                                    <p className="mt-1 font-semibold">{formatRupiah(onlineTotal)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Mode offline</p>
                                    <p className="mt-1 font-semibold">{formatRupiah(offlineTotal)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Narahubung</p>
                                    <p className="mt-1 font-semibold">{event.contactName || "Renjana"}{event.contactPhone ? ` (${event.contactPhone})` : ""}</p>
                                </div>
                            </div>

                            <Link href={`/events/${event.slug}/register`} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">
                                Daftar sekarang
                            </Link>

                            <div className="mt-5 text-xs leading-6 text-slate-500 dark:text-slate-400">
                                Pendaftaran dilakukan dalam beberapa langkah: buat akun, isi biodata, upload dokumen, upload bukti pembayaran, lalu submit untuk verifikasi admin.
                            </div>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}
