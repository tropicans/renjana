"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CalendarDays, CheckCircle2, ChevronRight, FileWarning, Loader2 } from "lucide-react";
import { RouteGuard } from "@/components/auth/route-guard";
import { SiteHeader } from "@/components/ui/site-header";
import { createRegistrationPaymentCheckout, fetchMyNotifications, fetchMyRegistrations, markAllNotificationsRead, markNotificationRead } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/lib/context/user-context";
import { formatRupiah } from "@/lib/events";
import { getPaymentStatusLabel, getRegistrationStatusLabel } from "@/lib/registration-status";

function getParticipantModeLabel(mode: string) {
    return mode === "OFFLINE" ? "Seminar" : "Webinar";
}

function getParticipantModeHint(mode: string) {
    return mode === "OFFLINE"
        ? "Ikut hadir langsung di venue seminar"
        : "Ikut hadir online melalui sesi webinar live";
}

function formatSessionDateTime(value: string | null | undefined) {
    if (!value) return null;

    return new Date(value).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function MyRegistrationsContent() {
    const searchParams = useSearchParams();
    const toast = useToast();
    const { isAuthenticated, isLoading: authLoading } = useUser();
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ["my-registrations"],
        queryFn: fetchMyRegistrations,
        enabled: isAuthenticated,
    });
    const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
        queryKey: ["my-notifications"],
        queryFn: fetchMyNotifications,
        enabled: isAuthenticated,
    });

    const registrations = data?.registrations ?? [];
    const notifications = notificationsData?.notifications ?? [];
    const unreadNotificationCount = notificationsData?.unreadCount ?? 0;
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

    const markAllReadMutation = useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => markNotificationRead(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

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

                    {!authLoading && !notificationsLoading ? (
                        <section id="notifications" className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                        <Bell className="h-5 w-5 text-primary" />
                                        <h1 className="text-xl font-bold">Update terbaru</h1>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Pantau status registrasi, verifikasi pembayaran, approval admin, dan penempatan kelas dari satu tempat.
                                    </p>
                                </div>
                                {unreadNotificationCount > 0 ? (
                                    <button
                                        onClick={() => markAllReadMutation.mutate()}
                                        disabled={markAllReadMutation.isPending}
                                        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200"
                                    >
                                        Tandai semua dibaca ({unreadNotificationCount})
                                    </button>
                                ) : null}
                            </div>

                            {notifications.length > 0 ? (
                                <div className="mt-5 space-y-3">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`rounded-2xl border px-4 py-4 ${notification.isRead ? "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40" : "border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10"}`}
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                                                        {!notification.isRead ? <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Baru</span> : null}
                                                    </div>
                                                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{notification.message}</p>
                                                    <p className="mt-2 text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString("id-ID")}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {notification.link ? (
                                                        <Link
                                                            href={notification.link}
                                                            onClick={() => {
                                                                if (!notification.isRead) {
                                                                    markReadMutation.mutate(notification.id);
                                                                }
                                                            }}
                                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                                                        >
                                                            Buka <ChevronRight className="h-4 w-4" />
                                                        </Link>
                                                    ) : null}
                                                    {!notification.isRead ? (
                                                        <button
                                                            onClick={() => markReadMutation.mutate(notification.id)}
                                                            disabled={markReadMutation.isPending}
                                                            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
                                                        >
                                                            Tandai dibaca
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                    Belum ada update baru. Notifikasi operasional akan muncul di sini saat registrasi diproses.
                                </div>
                            )}
                        </section>
                    ) : null}

                    <div className="grid gap-5">
                        {registrations.map((registration) => {
                            const latestPayment = registration.payments?.[0];
                            const canPayNow = paymentGatewayEnabled && ["PENDING", "REJECTED"].includes(registration.paymentStatus);
                            const classAccessReady = registration.paymentStatus === "VERIFIED" && ["APPROVED", "ACTIVE", "COMPLETED"].includes(registration.status) && !!registration.classGroup;
                            const canOpenZoom = classAccessReady && registration.classGroup?.modality === "ONLINE" && !!registration.classGroup.zoomLink;
                            const participantModeLabel = getParticipantModeLabel(registration.participantMode);
                            const sessionStartLabel = formatSessionDateTime(registration.classGroup?.startAt || registration.event.eventStart);

                            return (
                            <article key={registration.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{registration.event.category}</p>
                                        <h2 className="text-2xl font-bold">{registration.event.title}</h2>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{getRegistrationStatusLabel(registration.status)}</span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Pembayaran: {getPaymentStatusLabel(registration.paymentStatus)}</span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{participantModeLabel}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{getParticipantModeHint(registration.participantMode)}</p>
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
                                        {canOpenZoom ? (
                                            <a href={registration.classGroup!.zoomLink!} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                                                Masuk kelas live <ChevronRight className="h-4 w-4" />
                                            </a>
                                        ) : null}
                                        <Link href={`/events/${registration.event.slug}/register`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                                            {registrationActionLabel(registration.status)} <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-6 text-sm text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {sessionStartLabel || "Tanggal menyusul"}</div>
                                    <div>Total biaya: {formatRupiah(registration.totalFee)}</div>
                                    <div>{registration.documents.length} dokumen tersimpan</div>
                                    <div>Kelas: {registration.classGroup?.name || "Sedang disiapkan admin"}</div>
                                </div>
                                {registration.adminNote ? (
                                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300">
                                        <p className="font-semibold">Catatan terbaru dari tim</p>
                                        <p className="mt-1 leading-6">{registration.adminNote}</p>
                                    </div>
                                ) : null}
                                {registration.classGroup ? (
                                    <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                        <p className="font-semibold text-slate-900 dark:text-white">Informasi {registration.classGroup.modality === "ONLINE" ? "webinar" : "seminar"}</p>
                                        <div className="mt-2 space-y-1">
                                            <p>Grup: {registration.classGroup.name}</p>
                                            <p>Mode: {registration.classGroup.modality === "ONLINE" ? "Webinar online" : "Seminar offline"}</p>
                                            {registration.classGroup.location ? <p>Lokasi: {registration.classGroup.location}</p> : null}
                                            {registration.classGroup.startAt ? <p>Mulai: {formatSessionDateTime(registration.classGroup.startAt)}</p> : null}
                                            {registration.classGroup.endAt ? <p>Selesai: {formatSessionDateTime(registration.classGroup.endAt)}</p> : null}
                                            {registration.classGroup.modality === "ONLINE" ? (
                                                classAccessReady ? (
                                                    <>
                                                        {registration.classGroup.zoomLink ? <p>Link webinar live sudah tersedia untuk peserta yang lolos verifikasi.</p> : <p>Link webinar akan diisi admin sebelum sesi dimulai.</p>}
                                                        {registration.classGroup.zoomPasscode ? <p>Passcode: {registration.classGroup.zoomPasscode}</p> : null}
                                                    </>
                                                ) : (
                                                    <p>Akses webinar akan dibuka setelah pembayaran terverifikasi, pendaftaran disetujui, dan peserta ditempatkan ke kelas.</p>
                                                )
                                            ) : (
                                                <>
                                                    {registration.classGroup.location ? <p>Silakan hadir ke venue seminar sesuai jadwal yang ditetapkan panitia.</p> : <p>Lokasi seminar akan diisi admin sebelum sesi dimulai.</p>}
                                                    <p>Informasi check-in dan arahan onsite akan muncul di sini setelah penempatan seminar selesai.</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                        Penempatan {participantModeLabel.toLowerCase()} Anda sedang disiapkan admin. Informasi venue seminar atau akses webinar akan muncul setelah penempatan kelas selesai.
                                    </div>
                                )}
                            </article>
                            );
                        })}
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
