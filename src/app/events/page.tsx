"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, Loader2, MapPin, Sparkles, Users } from "lucide-react";
import { SiteHeader } from "@/components/ui/site-header";
import { fetchEvents } from "@/lib/api";
import { formatRupiah } from "@/lib/events";

export default function EventsPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["events"],
        queryFn: () => fetchEvents(),
    });

    const events = data?.events ?? [];
    const featured = events.find((event) => event.isFeatured) ?? events[0];
    const restEvents = events.filter((event) => event.id !== featured?.id);

    return (
        <div className="min-h-screen bg-background-light text-[#111418] transition-colors duration-300 dark:bg-background-dark dark:text-white">
            <SiteHeader />

            <main className="mx-auto max-w-[1200px] px-6 pb-20 pt-24">
                <section className="mb-14 grid gap-8 rounded-[32px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-8 shadow-sm dark:border-sky-900/40 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950 lg:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-6">
                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                            <Sparkles className="h-3.5 w-3.5" /> Featured Event
                        </span>
                        <div className="space-y-4">
                            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
                                Kelola pendaftaran, pembelajaran, pre/post test, dan evaluasi dalam satu alur.
                            </h1>
                            <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                                Temukan kegiatan profesional Renjana, daftar secara online, lengkapi dokumen, lalu lanjut ke pembelajaran dan evaluasi saat event sudah aktif.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                            <span className="rounded-full border border-slate-200 px-4 py-2 dark:border-slate-800">Multi-event catalog</span>
                            <span className="rounded-full border border-slate-200 px-4 py-2 dark:border-slate-800">Hybrid delivery</span>
                            <span className="rounded-full border border-slate-200 px-4 py-2 dark:border-slate-800">Pre/Post test</span>
                            <span className="rounded-full border border-slate-200 px-4 py-2 dark:border-slate-800">Evaluasi penyelenggaraan</span>
                        </div>
                    </div>

                    {featured && (
                        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Sedang Dibuka</p>
                            <h2 className="mt-3 text-2xl font-bold leading-tight">{featured.title}</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{featured.summary || featured.description}</p>
                            <div className="mt-6 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-sky-500" /> {featured.eventStart ? new Date(featured.eventStart).toLocaleDateString("id-ID") : "Tanggal menyusul"}</div>
                                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-sky-500" /> {featured.location || featured.platform || featured.modality}</div>
                                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-sky-500" /> {featured._count.registrations} pendaftar</div>
                            </div>
                            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-900">
                                <p className="font-semibold">Biaya mulai</p>
                                <p className="mt-1 text-slate-500 dark:text-slate-400">
                                    Online {formatRupiah((featured.onlineTuitionFee ?? 0) + (featured.registrationFee ?? 0))}
                                </p>
                            </div>
                            <Link href={`/events/${featured.slug}`} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">
                                Lihat detail kegiatan
                            </Link>
                        </div>
                    )}
                </section>

                {isLoading && <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-600 dark:border-red-900/40 dark:bg-red-950/20">Gagal memuat daftar kegiatan.</div>}

                {!isLoading && !error && (
                    <div className="space-y-12">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold tracking-tight">Daftar Kegiatan</h2>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Pilih event yang sedang dibuka untuk pendaftaran atau pembelajaran.</p>
                            </div>
                            <div className="text-sm text-slate-400">{events.length} event</div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {(featured ? [featured, ...restEvents] : restEvents).map((event) => (
                                <article key={event.id} className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/70">
                                    <div className="mb-5 flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{event.category}</p>
                                            <h3 className="mt-2 text-xl font-bold leading-tight">{event.title}</h3>
                                        </div>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{event.modality}</span>
                                    </div>
                                    <p className="flex-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{event.summary || event.description || "Detail kegiatan akan diumumkan segera."}</p>
                                    <div className="mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Pendaftaran sampai {event.registrationEnd ? new Date(event.registrationEnd).toLocaleDateString("id-ID") : "TBA"}</div>
                                        <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /> {event.scheduleSummary || "Jadwal detail menyusul"}</div>
                                        <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> {event._count.registrations} pendaftar</div>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-xs text-slate-400">Biaya online mulai</p>
                                            <p className="font-bold text-slate-900 dark:text-white">{formatRupiah((event.onlineTuitionFee ?? 0) + (event.registrationFee ?? 0))}</p>
                                        </div>
                                        <Link href={`/events/${event.slug}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/50 hover:text-primary dark:border-slate-700 dark:text-slate-200">
                                            Detail
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
