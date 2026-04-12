"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { fetchAdminRegistrations } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useUser } from "@/lib/context/user-context";
import { formatRupiah } from "@/lib/events";
import { getPaymentStatusLabel, getRegistrationStatusLabel } from "@/lib/registration-status";

function readinessClasses(status: string) {
    if (status === "issued" || status === "ready") {
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300";
    }

    if (status === "not_enabled" || status === "not_applicable") {
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
    }

    return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300";
}

function isAttentionStatus(status: string) {
    return !["ready", "issued", "not_enabled", "not_applicable"].includes(status);
}

function readinessPriority(status: string) {
    switch (status) {
        case "ready":
            return 0;
        case "registration_pending":
        case "enrollment_missing":
        case "learning_in_progress":
        case "post_test_pending":
        case "evaluation_pending":
            return 1;
        case "issued":
            return 2;
        case "not_enabled":
        case "not_applicable":
            return 3;
        default:
            return 4;
    }
}

export default function AdminRegistrationsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const toast = useToast();
    const [eventFilter, setEventFilter] = React.useState<string>(() => searchParams.get("event") ?? "all");
    const [readinessFilter, setReadinessFilter] = React.useState<
        "all" | "ready" | "attention" | "issued" | "not-applicable"
    >(() => {
        const value = searchParams.get("readiness");
        if (value === "ready" || value === "attention" || value === "issued" || value === "not-applicable") {
            return value;
        }
        return "all";
    });
    const { user, isLoading: authLoading } = useUser();
    const { data, isLoading } = useQuery({
        queryKey: ["admin-registrations"],
        queryFn: fetchAdminRegistrations,
        enabled: user?.role === "ADMIN",
    });

    const registrations = data?.registrations ?? [];
    const legacySource = searchParams.get("fromLegacy");
    const eventOptions = Array.from(
        new Map(registrations.map((registration) => [registration.event.id, registration.event])).values()
    ).sort((a, b) => a.title.localeCompare(b.title));
    const readyCount = registrations.filter((registration) => registration.certificateReadiness.status === "ready").length;
    const issuedCount = registrations.filter((registration) => registration.certificateReadiness.status === "issued").length;
    const attentionCount = registrations.filter((registration) => isAttentionStatus(registration.certificateReadiness.status)).length;
    const notApplicableCount = registrations.filter((registration) => ["not_enabled", "not_applicable"].includes(registration.certificateReadiness.status)).length;
    const prioritizedRegistrations = [...registrations].sort((a, b) => {
        const priorityDiff = readinessPriority(a.certificateReadiness.status) - readinessPriority(b.certificateReadiness.status);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    const eventScopedRegistrations = prioritizedRegistrations.filter((registration) => {
        if (eventFilter === "all") return true;
        return registration.event.id === eventFilter;
    });
    const filteredRegistrations = eventScopedRegistrations.filter((registration) => {
        const status = registration.certificateReadiness.status;

        if (readinessFilter === "ready") return status === "ready";
        if (readinessFilter === "issued") return status === "issued";
        if (readinessFilter === "not-applicable") {
            return status === "not_enabled" || status === "not_applicable";
        }
        if (readinessFilter === "attention") {
            return isAttentionStatus(status);
        }

        return true;
    });
    const visibleReadyRegistrations = filteredRegistrations.filter(
        (registration) => registration.certificateReadiness.status === "ready" && registration.certificateReadiness.enrollmentId
    );

    React.useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (eventFilter === "all") {
            params.delete("event");
        } else {
            params.set("event", eventFilter);
        }

        if (readinessFilter === "all") {
            params.delete("readiness");
        } else {
            params.set("readiness", readinessFilter);
        }

        const currentQuery = searchParams.toString();
        const nextQuery = params.toString();

        if (currentQuery === nextQuery) {
            return;
        }

        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        router.replace(nextUrl, { scroll: false });
    }, [eventFilter, pathname, readinessFilter, router, searchParams]);

    React.useEffect(() => {
        const nextEvent = searchParams.get("event") ?? "all";
        const nextReadiness = searchParams.get("readiness");
        const normalizedReadiness = nextReadiness === "ready" || nextReadiness === "attention" || nextReadiness === "issued" || nextReadiness === "not-applicable"
            ? nextReadiness
            : "all";

        if (nextEvent !== eventFilter) {
            setEventFilter(nextEvent);
        }

        if (normalizedReadiness !== readinessFilter) {
            setReadinessFilter(normalizedReadiness);
        }
    }, [eventFilter, readinessFilter, searchParams]);

    const issueCertificateMutation = useMutation({
        mutationFn: async (enrollmentId: string) => {
            const res = await fetch(`/api/admin/certificates/${enrollmentId}`, {
                method: "POST",
            });

            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(body.error || `API error ${res.status}`);
            }

            return body as { certificate: { pdfUrl: string | null } };
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
            toast.success("Certificate berhasil diterbitkan.");
            if (data.certificate.pdfUrl) {
                window.open(data.certificate.pdfUrl, "_blank", "noopener,noreferrer");
            }
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const bulkIssueMutation = useMutation({
        mutationFn: async (enrollmentIds: string[]) => {
            const certificates: Array<{ pdfUrl: string | null }> = [];

            for (const enrollmentId of enrollmentIds) {
                const res = await fetch(`/api/admin/certificates/${enrollmentId}`, {
                    method: "POST",
                });

                const body = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(body.error || `API error ${res.status}`);
                }

                certificates.push(body.certificate as { pdfUrl: string | null });
            }

            return certificates;
        },
        onSuccess: async (certificates) => {
            await queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
            toast.success(`${certificates.length} certificate berhasil diterbitkan.`);
            certificates.slice(0, 1).forEach((certificate) => {
                if (certificate.pdfUrl) {
                    window.open(certificate.pdfUrl, "_blank", "noopener,noreferrer");
                }
            });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    if (authLoading || isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Registrations</h1>
                <p className="mt-1 text-gray-500">Daftar pendaftar lintas event, termasuk status pembayaran dan dokumen.</p>
            </div>

            {legacySource ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-300 md:flex-row md:items-center md:justify-between">
                    <p>
                        Flow admin untuk <span className="font-semibold">{legacySource}</span> sudah dipusatkan ke Registrations agar approval peserta, dokumen, dan status pembayaran tetap terkonsolidasi.
                    </p>
                    <Link href="#registrations-table" className="inline-flex items-center justify-center rounded-full bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                        Review registrations
                    </Link>
                </div>
            ) : null}

            <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 dark:border-gray-800 dark:bg-[#1a242f] md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Event scope</p>
                    <p className="mt-1 text-sm text-gray-500">Fokuskan registrations dan bulk issuance ke event tertentu.</p>
                </div>
                <select
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700"
                >
                    <option value="all">Semua event ({registrations.length})</option>
                    {eventOptions.map((event) => {
                        const count = registrations.filter((registration) => registration.event.id === event.id).length;
                        return (
                            <option key={event.id} value={event.id}>
                                {event.title} ({count})
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="flex flex-wrap gap-2">
                {[
                    { key: "all", label: `All (${registrations.length})` },
                    {
                        key: "ready",
                        label: `Ready (${readyCount})`,
                    },
                    {
                        key: "attention",
                        label: `Need attention (${attentionCount})`,
                    },
                    {
                        key: "issued",
                        label: `Issued (${issuedCount})`,
                    },
                    {
                        key: "not-applicable",
                        label: `Not applicable (${notApplicableCount})`,
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

            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <p className="text-2xl font-bold">{readyCount}</p>
                    <p className="mt-1 text-xs text-gray-500">Ready to issue</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <p className="text-2xl font-bold">{attentionCount}</p>
                    <p className="mt-1 text-xs text-gray-500">Need attention</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <p className="text-2xl font-bold">{issuedCount}</p>
                    <p className="mt-1 text-xs text-gray-500">Certificate issued</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <p className="text-2xl font-bold">{notApplicableCount}</p>
                    <p className="mt-1 text-xs text-gray-500">Not applicable</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-5 py-4 text-sm dark:border-emerald-900/30 dark:bg-emerald-950/20 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300">Bulk certificate issuance</p>
                    <p className="mt-1 text-emerald-700/80 dark:text-emerald-200/80">
                        {visibleReadyRegistrations.length > 0
                            ? `${visibleReadyRegistrations.length} registration pada scope saat ini siap diterbitkan sertifikatnya.`
                            : "Belum ada registration siap issue pada scope dan filter yang sedang aktif."}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => bulkIssueMutation.mutate(visibleReadyRegistrations.map((registration) => registration.certificateReadiness.enrollmentId!).filter(Boolean))}
                    disabled={bulkIssueMutation.isPending || visibleReadyRegistrations.length === 0 || issueCertificateMutation.isPending}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                >
                    {bulkIssueMutation.isPending ? "Issuing visible ready items..." : "Issue all visible ready"}
                </button>
            </div>

            <div id="registrations-table" className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-[#1a242f]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 text-left text-gray-500 dark:border-gray-800">
                                <th className="p-4 font-semibold">Peserta</th>
                                <th className="p-4 font-semibold">Event</th>
                                <th className="p-4 font-semibold">Mode</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Pembayaran</th>
                                <th className="p-4 font-semibold">Certificate readiness</th>
                                <th className="p-4 font-semibold">Dokumen</th>
                                <th className="p-4 font-semibold">Actions</th>
                                <th className="p-4 font-semibold text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRegistrations.map((registration) => (
                                <tr key={registration.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800/60">
                                    <td className="p-4"><Link href={`/admin/registrations/${registration.id}`} className="block hover:text-primary"><p className="font-medium">{registration.user.fullName}</p><p className="text-xs text-gray-500">{registration.user.email}</p></Link></td>
                                    <td className="p-4"><div><p className="font-medium">{registration.event.title}</p><p className="text-xs text-gray-500">{registration.event.category}</p></div></td>
                                    <td className="p-4 text-gray-500">{registration.participantMode}</td>
                                    <td className="p-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{getRegistrationStatusLabel(registration.status)}</span></td>
                                    <td className="p-4 text-gray-500">{getPaymentStatusLabel(registration.paymentStatus)}</td>
                                    <td className="p-4">
                                        <div className="space-y-2">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${readinessClasses(registration.certificateReadiness.status)}`}>
                                                {registration.certificateReadiness.label}
                                            </span>
                                            <p className="max-w-xs text-xs leading-relaxed text-gray-500">{registration.certificateReadiness.detail}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500">{registration.documents.length} file{registration.classGroup ? ` · ${registration.classGroup.name}` : " · Belum ada kelas"}</td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-2">
                                            <Link href={`/admin/registrations/${registration.id}`} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:text-gray-200">
                                                Review
                                            </Link>
                                            {registration.event.courseId ? (
                                                <Link href={`/admin/events/${registration.event.id}/quizzes`} className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:text-gray-200">
                                                    Kelola quiz
                                                </Link>
                                            ) : null}
                                            {registration.certificateReadiness.status === "ready" ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (registration.certificateReadiness.enrollmentId) {
                                                                issueCertificateMutation.mutate(registration.certificateReadiness.enrollmentId);
                                                            }
                                                        }}
                                                        disabled={issueCertificateMutation.isPending || bulkIssueMutation.isPending || !registration.certificateReadiness.enrollmentId}
                                                        className="rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-400 disabled:opacity-60 dark:border-emerald-900/50 dark:text-emerald-300"
                                                    >
                                                        {issueCertificateMutation.isPending ? "Issuing..." : "Issue certificate"}
                                                    </button>
                                                    <Link href={`/admin/events/${registration.event.id}`} className="rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-400 dark:border-emerald-900/50 dark:text-emerald-300">
                                                        Final check
                                                    </Link>
                                                </>
                                            ) : null}
                                            {registration.certificateReadiness.status === "issued" && registration.certificateReadiness.certificateUrl ? (
                                                <a
                                                    href={registration.certificateReadiness.certificateUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:border-emerald-400 dark:border-emerald-900/50 dark:text-emerald-300"
                                                >
                                                    View certificate
                                                </a>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-semibold">{formatRupiah(registration.totalFee)}</td>
                                </tr>
                            ))}
                            {filteredRegistrations.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Tidak ada registration yang cocok dengan filter readiness saat ini.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
