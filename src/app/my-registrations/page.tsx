"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronRight, FileWarning, Loader2 } from "lucide-react";
import { RouteGuard } from "@/components/auth/route-guard";
import { SiteHeader } from "@/components/ui/site-header";
import { fetchMyRegistrations } from "@/lib/api";
import { useUser } from "@/lib/context/user-context";
import { formatRupiah } from "@/lib/events";

export default function MyRegistrationsPage() {
    const { isAuthenticated, isLoading: authLoading } = useUser();
    const { data, isLoading } = useQuery({
        queryKey: ["my-registrations"],
        queryFn: fetchMyRegistrations,
        enabled: isAuthenticated,
    });

    const registrations = data?.registrations ?? [];

    return (
        <RouteGuard allowedRoles={["LEARNER"]}>
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                <SiteHeader />
                <main className="mx-auto max-w-[1200px] px-6 pb-12 pt-24 lg:px-10">
                    {authLoading || isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : null}

                    {!authLoading && !isLoading && registrations.length === 0 ? (
                        <div className="rounded-[28px] border border-dashed border-slate-300 px-8 py-16 text-center text-slate-500 dark:border-slate-700">
                            <FileWarning className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Belum ada pendaftaran</h1>
                            <p className="mt-2">Mulai dari halaman kegiatan untuk mengajukan pendaftaran baru.</p>
                            <Link href="/events" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-bold text-white">Lihat kegiatan</Link>
                        </div>
                    ) : null}

                    <div className="grid gap-5">
                        {registrations.map((registration) => (
                            <article key={registration.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{registration.event.category}</p>
                                        <h2 className="text-2xl font-bold">{registration.event.title}</h2>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{registration.status}</span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Pembayaran: {registration.paymentStatus}</span>
                                            <span>{registration.participantMode}</span>
                                        </div>
                                    </div>
                                    <Link href={`/events/${registration.event.slug}/register`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                                        Lanjutkan <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-6 text-sm text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {registration.event.eventStart ? new Date(registration.event.eventStart).toLocaleDateString("id-ID") : "Tanggal menyusul"}</div>
                                    <div>Total biaya: {formatRupiah(registration.totalFee)}</div>
                                    <div>{registration.documents.length} dokumen tersimpan</div>
                                </div>
                            </article>
                        ))}
                    </div>
                </main>
            </div>
        </RouteGuard>
    );
}
