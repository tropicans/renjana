"use client";

import Link from "next/link";
import React from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Loader2, ShieldAlert, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatRupiah } from "@/lib/events";

type AdminRegistrationDetail = {
    id: string;
    participantMode: string;
    status: string;
    paymentStatus: string;
    fullName: string | null;
    birthPlace: string | null;
    birthDate: string | null;
    gender: string | null;
    domicileAddress: string | null;
    whatsapp: string | null;
    institution: string | null;
    titlePrefix: string | null;
    titleSuffix: string | null;
    agreedTerms: boolean;
    agreedRefundPolicy: boolean;
    sourceChannel: string | null;
    sourceOtherText: string | null;
    referralName: string | null;
    adminNote: string | null;
    totalFee: number | null;
    user: { id: string; fullName: string; email: string; phone: string | null };
    event: { id: string; slug: string; title: string; category: string; courseId: string | null; course: { id: string; title: string } | null };
    documents: Array<{ id: string; type: string; fileUrl: string; fileName: string; fileType: string; reviewStatus: string; adminNote: string | null }>;
};

async function fetchAdminRegistration(id: string) {
    const res = await fetch(`/api/admin/registrations/${id}`);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `API error ${res.status}`);
    }
    return res.json() as Promise<{ registration: AdminRegistrationDetail }>;
}

async function updateAdminRegistration(id: string, payload: Record<string, unknown>) {
    const res = await fetch(`/api/admin/registrations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `API error ${res.status}`);
    }
    return res.json() as Promise<{ registration: AdminRegistrationDetail }>;
}

export default function AdminRegistrationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [adminNote, setAdminNote] = React.useState("");
    const [documentNotes, setDocumentNotes] = React.useState<Record<string, string>>({});

    const { data, isLoading } = useQuery({
        queryKey: ["admin-registration", id],
        queryFn: () => fetchAdminRegistration(id),
        enabled: !!id,
    });

    const registration = data?.registration;

    React.useEffect(() => {
        if (!registration) return;
        setAdminNote(registration.adminNote || "");
        setDocumentNotes(Object.fromEntries(registration.documents.map((document) => [document.id, document.adminNote || ""])));
    }, [registration]);

    const mutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) => updateAdminRegistration(id, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-registration", id] });
            await queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
            toast.success("Registration updated.");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    if (isLoading || !registration) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const reviewDocument = (documentId: string, reviewStatus: string) => {
        mutation.mutate({
            documentUpdates: [{ id: documentId, reviewStatus, adminNote: documentNotes[documentId] || null }],
            adminNote,
        });
    };

    return (
        <div className="space-y-8">
            <Link href="/admin/registrations" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
                <ArrowLeft className="h-4 w-4" /> Kembali ke registrations
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{registration.event.category}</p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{registration.fullName || registration.user.fullName}</h1>
                    <p className="mt-1 text-gray-500">{registration.event.title}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => mutation.mutate({ status: "REVISION_REQUIRED", adminNote })} className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700">Minta revisi</button>
                    <button onClick={() => mutation.mutate({ status: "APPROVED", paymentStatus: "VERIFIED", adminNote })} className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white">Approve</button>
                    <button onClick={() => mutation.mutate({ status: "REJECTED", paymentStatus: "REJECTED", adminNote })} className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">Reject</button>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Profil Pendaftar</h2>
                        <div className="mt-5 grid gap-4 md:grid-cols-2 text-sm">
                            <div><p className="text-gray-400">Email</p><p className="font-medium">{registration.user.email}</p></div>
                            <div><p className="text-gray-400">WhatsApp</p><p className="font-medium">{registration.whatsapp || registration.user.phone || "-"}</p></div>
                            <div><p className="text-gray-400">Tempat / tanggal lahir</p><p className="font-medium">{registration.birthPlace || "-"}{registration.birthDate ? ` / ${new Date(registration.birthDate).toLocaleDateString("id-ID")}` : ""}</p></div>
                            <div><p className="text-gray-400">Jenis kelamin</p><p className="font-medium">{registration.gender || "-"}</p></div>
                            <div><p className="text-gray-400">Instansi / Universitas</p><p className="font-medium">{registration.institution || "-"}</p></div>
                            <div><p className="text-gray-400">Mode peserta</p><p className="font-medium">{registration.participantMode}</p></div>
                            <div className="md:col-span-2"><p className="text-gray-400">Alamat</p><p className="font-medium">{registration.domicileAddress || "-"}</p></div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Dokumen Registrasi</h2>
                        <div className="mt-5 space-y-4">
                            {registration.documents.map((document) => (
                                <div key={document.id} className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <p className="font-semibold">{document.type}</p>
                                            <p className="text-xs text-gray-500">{document.fileName}</p>
                                            <a href={document.fileUrl} target="_blank" className="mt-2 inline-flex text-sm font-medium text-primary hover:underline">Buka file</a>
                                        </div>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{document.reviewStatus}</span>
                                    </div>
                                    <textarea value={documentNotes[document.id] || ""} onChange={(e) => setDocumentNotes((prev) => ({ ...prev, [document.id]: e.target.value }))} placeholder="Catatan dokumen" rows={2} className="mt-4 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                                    <div className="mt-3 flex gap-3">
                                        <button onClick={() => reviewDocument(document.id, "APPROVED")} className="rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-300">Approve file</button>
                                        <button onClick={() => reviewDocument(document.id, "REJECTED")} className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 dark:bg-red-900/20 dark:text-red-300">Reject file</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Status Operasional</h2>
                        <div className="mt-5 grid gap-4 text-sm">
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900"><span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-primary" /> Registration</span><strong>{registration.status}</strong></div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900"><span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" /> Payment</span><strong>{registration.paymentStatus}</strong></div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Total fee</span><strong>{formatRupiah(registration.totalFee)}</strong></div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Source & Agreement</h2>
                        <div className="mt-5 space-y-3 text-sm">
                            <div><p className="text-gray-400">Source channel</p><p className="font-medium">{registration.sourceChannel || "-"}{registration.sourceChannel === "OTHER" && registration.sourceOtherText ? ` - ${registration.sourceOtherText}` : ""}</p></div>
                            <div><p className="text-gray-400">Referral</p><p className="font-medium">{registration.referralName || "-"}</p></div>
                            <div><p className="text-gray-400">Agreement</p><p className="font-medium">Terms: {registration.agreedTerms ? "Yes" : "No"} · Refund policy: {registration.agreedRefundPolicy ? "Yes" : "No"}</p></div>
                            <div><p className="text-gray-400">Linked course</p><p className="font-medium">{registration.event.course?.title || "Belum terhubung"}</p></div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <h2 className="text-xl font-bold">Catatan Admin</h2>
                        <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Tambahkan catatan verifikasi atau revisi" rows={6} className="mt-4 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                        <button onClick={() => mutation.mutate({ adminNote })} disabled={mutation.isPending} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">Simpan catatan</button>
                    </section>
                </div>
            </div>
        </div>
    );
}
