"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { formatRupiah } from "@/lib/events";

type FinanceRegistration = {
    id: string;
    participantMode: string;
    status: string;
    paymentStatus: string;
    totalFee: number | null;
    createdAt: string;
    user: { fullName: string; email: string };
    event: { id: string; slug: string; title: string; category: string };
    documents: Array<{ id: string; type: string }>;
};

async function fetchFinanceRegistrations() {
    const res = await fetch("/api/finance/registrations");
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `API error ${res.status}`);
    }
    return res.json() as Promise<{ registrations: FinanceRegistration[] }>;
}

function paymentBadge(paymentStatus: string) {
    if (paymentStatus === "VERIFIED") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300";
    if (paymentStatus === "REJECTED") return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300";
    if (paymentStatus === "UPLOADED") return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300";
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
}

export default function FinanceRegistrationsPage() {
    const { data, isLoading } = useQuery({ queryKey: ["finance-registrations"], queryFn: fetchFinanceRegistrations });
    const registrations = data?.registrations ?? [];

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Payment Verification</h1>
                <p className="mt-1 text-gray-500">Verifikasi bukti pembayaran peserta sebelum approval final oleh admin.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-[#1a242f] overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-left text-gray-500 dark:border-gray-800">
                            <th className="p-4 font-semibold">Peserta</th>
                            <th className="p-4 font-semibold">Event</th>
                            <th className="p-4 font-semibold">Registration</th>
                            <th className="p-4 font-semibold">Payment</th>
                            <th className="p-4 font-semibold">Dokumen</th>
                            <th className="p-4 font-semibold text-right">Total</th>
                            <th className="p-4 font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registrations.map((registration) => (
                            <tr key={registration.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800/60">
                                <td className="p-4"><p className="font-medium">{registration.user.fullName}</p><p className="text-xs text-gray-500">{registration.user.email}</p></td>
                                <td className="p-4"><p className="font-medium">{registration.event.title}</p><p className="text-xs text-gray-500">{registration.event.category}</p></td>
                                <td className="p-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{registration.status}</span></td>
                                <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge(registration.paymentStatus)}`}>{registration.paymentStatus}</span></td>
                                <td className="p-4 text-gray-500">{registration.documents.length} file</td>
                                <td className="p-4 text-right font-semibold">{formatRupiah(registration.totalFee)}</td>
                                <td className="p-4"><Link href={`/finance/registrations/${registration.id}`} className="inline-flex rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-primary/40 hover:text-primary dark:border-gray-700 dark:text-gray-200">Review payment</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
