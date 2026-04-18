"use client";

import Link from "next/link";
import React from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Wallet } from "lucide-react";
import { OpsAuditTimeline, type OpsAuditLog } from "@/components/registrations/ops-audit-timeline";
import { useToast } from "@/components/ui/toast";
import { formatRupiah } from "@/lib/events";
import { getPaymentStatusLabel, getRegistrationStatusLabel } from "@/lib/registration-status";

type FinanceRegistrationDetail = {
    id: string;
    status: string;
    paymentStatus: string;
    adminNote: string | null;
    totalFee: number | null;
    participantMode: string;
    user: { fullName: string; email: string; phone: string | null };
    event: { title: string; category: string; slug: string };
    documents: Array<{ id: string; type: string; fileUrl: string; fileName: string; reviewStatus: string; adminNote: string | null }>;
    auditLogs: OpsAuditLog[];
};

async function fetchFinanceRegistration(id: string) {
    const res = await fetch(`/api/finance/registrations/${id}`);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `API error ${res.status}`);
    }
    return res.json() as Promise<{ registration: FinanceRegistrationDetail }>;
}

async function updateFinanceRegistration(id: string, payload: Record<string, unknown>) {
    const res = await fetch(`/api/finance/registrations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `API error ${res.status}`);
    }
    return res.json() as Promise<{ registration: FinanceRegistrationDetail }>;
}

export default function FinanceRegistrationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [adminNote, setAdminNote] = React.useState("");
    const [paymentProofNote, setPaymentProofNote] = React.useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["finance-registration", id],
        queryFn: () => fetchFinanceRegistration(id),
        enabled: !!id,
    });

    const registration = data?.registration;
    const paymentProof = registration?.documents.find((document) => document.type === "PAYMENT_PROOF");

    React.useEffect(() => {
        if (!registration) return;
        setAdminNote(registration.adminNote || "");
        setPaymentProofNote(paymentProof?.adminNote || "");
    }, [paymentProof?.adminNote, registration]);

    const mutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) => updateFinanceRegistration(id, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["finance-registration", id] });
            await queryClient.invalidateQueries({ queryKey: ["finance-registrations"] });
            await queryClient.invalidateQueries({ queryKey: ["admin-registration", id] });
            await queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
            toast.success("Payment verification updated.");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    if (isLoading || !registration) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8">
            <Link href="/finance/registrations" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
                <ArrowLeft className="h-4 w-4" /> Kembali ke payment verification
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{registration.event.category}</p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{registration.user.fullName}</h1>
                    <p className="mt-1 text-gray-500">{registration.event.title}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => mutation.mutate({ paymentStatus: "VERIFIED", adminNote, documentUpdates: paymentProof ? [{ id: paymentProof.id, reviewStatus: "APPROVED", adminNote: paymentProofNote || null }] : [] })} className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white">Verify payment</button>
                    <button onClick={() => mutation.mutate({ paymentStatus: "REJECTED", adminNote, documentUpdates: paymentProof ? [{ id: paymentProof.id, reviewStatus: "REJECTED", adminNote: paymentProofNote || null }] : [] })} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">Reject payment</button>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                    <h2 className="text-xl font-bold">Payment Proof</h2>
                    {paymentProof ? (
                        <div className="mt-5 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                            <p className="font-semibold">{paymentProof.fileName}</p>
                            <p className="mt-1 text-xs text-gray-500">Review status: {paymentProof.reviewStatus}</p>
                            <a href={paymentProof.fileUrl} target="_blank" className="mt-3 inline-flex text-sm font-medium text-primary hover:underline">Buka bukti pembayaran</a>
                            <textarea value={paymentProofNote} onChange={(e) => setPaymentProofNote(e.target.value)} placeholder="Catatan verifikasi pembayaran" rows={4} className="mt-4 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                        </div>
                    ) : (
                        <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">Bukti pembayaran belum diunggah peserta.</div>
                    )}
                </section>

                <div className="space-y-6">
                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Status Operasional</h2>
                        <div className="mt-5 grid gap-4 text-sm">
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900"><span>Registration</span><strong>{getRegistrationStatusLabel(registration.status)}</strong></div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900"><span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Payment</span><strong>{getPaymentStatusLabel(registration.paymentStatus)}</strong></div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900"><span>Total fee</span><strong>{formatRupiah(registration.totalFee)}</strong></div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Catatan Finance</h2>
                        <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Tambahkan catatan verifikasi pembayaran" rows={6} className="mt-4 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                        <button onClick={() => mutation.mutate({ adminNote })} disabled={mutation.isPending} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">Simpan catatan</button>
                    </section>

                    <OpsAuditTimeline
                        logs={registration.auditLogs}
                        emptyLabel="Belum ada aksi review pembayaran yang tercatat untuk registrasi ini."
                    />
                </div>
            </div>
        </div>
    );
}
