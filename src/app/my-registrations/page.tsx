"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, ChevronRight, FileWarning, Loader2 } from "lucide-react";
import { RouteGuard } from "@/components/auth/route-guard";
import { SiteHeader } from "@/components/ui/site-header";
import { createRegistrationPaymentCheckout, fetchMyRegistrations } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/lib/context/user-context";
import { formatRupiah } from "@/lib/events";
import { getPaymentStatusLabel, getRegistrationStatusLabel } from "@/lib/registration-status";

function MyRegistrationsContent() {
    const searchParams = useSearchParams();
    const toast = useToast();
    const { isAuthenticated, isLoading: authLoading } = useUser();
    const { data, isLoading } = useQuery({
        queryKey: ["my-registrations"],
        queryFn: fetchMyRegistrations,
        enabled: isAuthenticated,
    });

    const registrations = data?.registrations ?? [];
    const submitted = searchParams.get("submitted") === "1";
    const submittedEventSlug = searchParams.get("event");
    const submittedRegistration = submittedEventSlug
        ? registrations.find((registration) => registration.event.slug === submittedEventSlug)
        : null;
    const paymentGatewayEnabled = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === "DOKU";

    const handlePayNow = async (registrationId: string) => {
        try {
            const result = await createRegistrationPaymentCheckout(registrationId);
            if (result.payment.invoiceUrl) {
                window.open(result.payment.invoiceUrl, "_blank", "noopener,noreferrer");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal membuka invoice pembayaran");
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <SiteHeader />
            <main className="mx-auto max-w-[1200px] px-6 pb-12 pt-24 lg:px-10">
                    {authLoading || isLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : null}

                    {!authLoading && !isLoading && submitted ? (
                        <div className="mb-6 rounded-[28px] border border-emerald-200 bg-emerald-50 px-6 py-5 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                                <div>
                                    <p className="font-bold">Pendaftaran berhasil dikirim</p>
                                    <p className="mt-1 text-sm leading-6">
                                        {submittedRegistration
                                            ? paymentGatewayEnabled
                                                ? `Pendaftaran untuk ${submittedRegistration.event.title} sudah tersimpan. Lanjutkan checkout pembayaran dan pantau verifikasi berikutnya dari halaman ini.`
                                                : `Pendaftaran untuk ${submittedRegistration.event.title} sudah masuk ke tahap verifikasi admin. Pantau status pembayaran, dokumen, dan tindak lanjut berikutnya dari halaman ini.`
                                            : paymentGatewayEnabled
                                                ? "Pendaftaran Anda sudah tersimpan. Lanjutkan checkout pembayaran dan pantau verifikasi berikutnya dari halaman ini."
                                                : "Pendaftaran Anda sudah masuk ke tahap verifikasi admin. Pantau status pembayaran, dokumen, dan tindak lanjut berikutnya dari halaman ini."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

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
                                {(() => {
                                    const latestPayment = registration.payments?.[0];
                                    const canPayNow = paymentGatewayEnabled && ["PENDING", "REJECTED"].includes(registration.paymentStatus);
                                    return (
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{registration.event.category}</p>
                                        <h2 className="text-2xl font-bold">{registration.event.title}</h2>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{getRegistrationStatusLabel(registration.status)}</span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Pembayaran: {getPaymentStatusLabel(registration.paymentStatus)}</span>
                                            <span>{registration.participantMode}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {canPayNow ? (
                                            <button onClick={() => handlePayNow(registration.id)} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
                                                Bayar sekarang <ChevronRight className="h-4 w-4" />
                                            </button>
                                        ) : null}
                                        {latestPayment?.invoiceUrl && registration.paymentStatus === "PENDING" ? (
                                            <a href={latestPayment.invoiceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                                                Buka invoice <ChevronRight className="h-4 w-4" />
                                            </a>
                                        ) : null}
                                        <Link href={`/events/${registration.event.slug}/register`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                                            {registrationActionLabel(registration.status)} <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                                    );
                                })()}
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
    );
}

export default function MyRegistrationsPage() {
    return (
        <RouteGuard allowedRoles={["LEARNER"]}>
            <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                <MyRegistrationsContent />
            </React.Suspense>
        </RouteGuard>
    );
}

function registrationActionLabel(status: string) {
    if (status === "SUBMITTED") return "Lihat status pendaftaran";
    if (status === "APPROVED" || status === "ACTIVE") return "Kelola pendaftaran";
    if (status === "COMPLETED") return "Lihat ringkasan";
    return "Lanjutkan";
}
