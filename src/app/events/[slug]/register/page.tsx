"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ChevronDown, FileText, Loader2, UploadCloud } from "lucide-react";
import { RouteGuard } from "@/components/auth/route-guard";
import { SiteHeader } from "@/components/ui/site-header";
import { useToast } from "@/components/ui/toast";
import { createRegistrationPaymentCheckout, fetchEventBySlug, fetchMyRegistrations, saveRegistration, uploadRegistrationDocument } from "@/lib/api";
import { useUser } from "@/lib/context/user-context";
import { formatRupiah } from "@/lib/events";

type FormState = {
    participantMode: "ONLINE" | "OFFLINE";
    agreedTerms: boolean;
    agreedRefundPolicy: boolean;
    fullName: string;
    birthPlace: string;
    birthDate: string;
    gender: string;
    domicileAddress: string;
    whatsapp: string;
    institution: string;
    titlePrefix: string;
    titleSuffix: string;
    sourceChannel: "INSTAGRAM" | "TIKTOK" | "OTHER" | "";
    sourceOtherText: string;
    referralName: string;
};

const documentDefinitions = [
    { type: "PAYMENT_PROOF", label: "Bukti pembayaran" },
    { type: "PHOTO_4X6", label: "Pas foto 4x6 background merah" },
    { type: "KTP", label: "Scan KTP" },
    { type: "DIPLOMA_OR_SKL", label: "Scan ijazah / SKL" },
] as const;

function toChecklistItems(value: string | null | undefined, fallback: string[]) {
    const raw = value?.trim();
    if (!raw) return fallback;

    return raw
        .split(/\r?\n+/)
        .map((item) => item.replace(/^[-*\d.)\s]+/, "").trim())
        .filter(Boolean);
}

function isPkpaEvent(event: { title: string; category: string }) {
    const haystack = `${event.title} ${event.category}`.toLowerCase();
    return haystack.includes("pkpa") || haystack.includes("advokat");
}

function formatEventDateRange(start: string | null | undefined, end: string | null | undefined) {
    if (!start) return null;

    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    const formatter = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    if (!endDate) return formatter.format(startDate);
    return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

const fieldLabels: Record<string, string> = {
    fullName: "Nama lengkap",
    birthPlace: "Tempat lahir",
    birthDate: "Tanggal lahir",
    gender: "Jenis kelamin",
    domicileAddress: "Alamat domisili",
    whatsapp: "Nomor WhatsApp",
    institution: "Instansi / Universitas",
};

const initialState: FormState = {
    participantMode: "ONLINE",
    agreedTerms: false,
    agreedRefundPolicy: false,
    fullName: "",
    birthPlace: "",
    birthDate: "",
    gender: "",
    domicileAddress: "",
    whatsapp: "",
    institution: "",
    titlePrefix: "",
    titleSuffix: "",
    sourceChannel: "",
    sourceOtherText: "",
    referralName: "",
};

function normalizeFormForCompare(form: FormState) {
    return {
        participantMode: form.participantMode,
        agreedTerms: form.agreedTerms,
        agreedRefundPolicy: form.agreedRefundPolicy,
        fullName: form.fullName.trim(),
        birthPlace: form.birthPlace.trim(),
        birthDate: form.birthDate,
        gender: form.gender,
        domicileAddress: form.domicileAddress.trim(),
        whatsapp: form.whatsapp.trim(),
        institution: form.institution.trim(),
        titlePrefix: form.titlePrefix.trim(),
        titleSuffix: form.titleSuffix.trim(),
        sourceChannel: form.sourceChannel,
        sourceOtherText: form.sourceOtherText.trim(),
        referralName: form.referralName.trim(),
    };
}

export default function EventRegistrationPage() {
    const params = useParams<{ slug: string }>();
    const router = useRouter();
    const slug = params.slug;
    const queryClient = useQueryClient();
    const toast = useToast();
    const { isAuthenticated, isLoading: authLoading } = useUser();
    const [form, setForm] = React.useState<FormState>(initialState);
    const [files, setFiles] = React.useState<Partial<Record<(typeof documentDefinitions)[number]["type"], File>>>({});
    const [expandedPolicies, setExpandedPolicies] = React.useState<{ terms: boolean; refund: boolean }>({
        terms: false,
        refund: false,
    });

    const { data: eventData, isLoading: eventLoading } = useQuery({
        queryKey: ["event", slug],
        queryFn: () => fetchEventBySlug(slug),
        enabled: !!slug,
    });

    const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
        queryKey: ["my-registrations"],
        queryFn: fetchMyRegistrations,
        enabled: isAuthenticated,
    });

    const event = eventData?.event;
    const existingRegistration = registrationsData?.registrations.find((registration) => registration.event.slug === slug);
    const paymentGatewayEnabled = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === "DOKU";
    const activeDocumentDefinitions = paymentGatewayEnabled
        ? documentDefinitions.filter((definition) => definition.type !== "PAYMENT_PROOF")
        : documentDefinitions;

    const validateBeforeSubmit = React.useCallback(() => {
        const missingFields = Object.entries({
            fullName: form.fullName,
            birthPlace: form.birthPlace,
            birthDate: form.birthDate,
            gender: form.gender,
            domicileAddress: form.domicileAddress,
            whatsapp: form.whatsapp,
            institution: form.institution,
        })
            .filter(([, value]) => !value.trim())
            .map(([key]) => fieldLabels[key]);

        const uploadedTypes = new Set(existingRegistration?.documents.map((document) => document.type) ?? []);
        for (const definition of activeDocumentDefinitions) {
            if (files[definition.type]) {
                uploadedTypes.add(definition.type);
            }
        }

        const missingDocuments = activeDocumentDefinitions
            .filter((definition) => !uploadedTypes.has(definition.type))
            .map((definition) => definition.label);

        if (!form.agreedTerms || !form.agreedRefundPolicy || missingFields.length > 0 || missingDocuments.length > 0) {
            const parts = [
                !form.agreedTerms ? "setujui tata tertib" : null,
                !form.agreedRefundPolicy ? "setujui kebijakan refund" : null,
                missingFields.length > 0 ? `lengkapi: ${missingFields.join(", ")}` : null,
                missingDocuments.length > 0 ? `upload: ${missingDocuments.join(", ")}` : null,
            ].filter(Boolean);

            toast.error(`Pendaftaran belum bisa dikirim, ${parts.join("; ")}.`);
            return false;
        }

        return true;
    }, [activeDocumentDefinitions, existingRegistration?.documents, files, form, toast]);

    React.useEffect(() => {
        if (!existingRegistration) return;
        setForm({
            participantMode: (existingRegistration.participantMode as FormState["participantMode"]) || "ONLINE",
            agreedTerms: existingRegistration.agreedTerms,
            agreedRefundPolicy: existingRegistration.agreedRefundPolicy,
            fullName: existingRegistration.fullName || "",
            birthPlace: existingRegistration.birthPlace || "",
            birthDate: existingRegistration.birthDate ? existingRegistration.birthDate.slice(0, 10) : "",
            gender: existingRegistration.gender || "",
            domicileAddress: existingRegistration.domicileAddress || "",
            whatsapp: existingRegistration.whatsapp || "",
            institution: existingRegistration.institution || "",
            titlePrefix: existingRegistration.titlePrefix || "",
            titleSuffix: existingRegistration.titleSuffix || "",
            sourceChannel: (existingRegistration.sourceChannel as FormState["sourceChannel"]) || "",
            sourceOtherText: existingRegistration.sourceOtherText || "",
            referralName: existingRegistration.referralName || "",
        });
    }, [existingRegistration]);

    const saveMutation = useMutation({
        mutationFn: async (submit: boolean) => {
            if (!event) throw new Error("Event not found");
            if (submit && !validateBeforeSubmit()) {
                throw new Error("Lengkapi form dan dokumen sebelum submit.");
            }

            const draft = await saveRegistration({
                eventId: event.id,
                ...form,
                submit: false,
            });

            for (const definition of activeDocumentDefinitions) {
                const file = files[definition.type];
                if (file) {
                    await uploadRegistrationDocument(draft.registration.id, definition.type, file);
                }
            }

            if (!submit) {
                return draft;
            }

            return saveRegistration({
                eventId: event.id,
                ...form,
                submit: true,
            });
        },
        onSuccess: async (result, submit) => {
            await queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
            if (event) {
                await queryClient.invalidateQueries({ queryKey: ["event", event.slug] });
            }
            toast.success(submit ? (paymentGatewayEnabled ? "Pendaftaran berhasil dikirim. Checkout pembayaran sedang disiapkan." : "Pendaftaran berhasil dikirim untuk verifikasi.") : "Draft pendaftaran tersimpan.");
            if (submit) {
                if (paymentGatewayEnabled) {
                    try {
                        const paymentResult = await createRegistrationPaymentCheckout(result.registration.id);
                        if (paymentResult.payment.invoiceUrl) {
                            window.open(paymentResult.payment.invoiceUrl, "_blank", "noopener,noreferrer");
                        }
                    } catch (paymentError) {
                        const message = paymentError instanceof Error ? paymentError.message : "Gagal membuat invoice pembayaran";
                        toast.warning(message);
                    }
                }
                router.push(`/my-registrations?submitted=1&event=${event?.slug ?? slug}`);
            }
        },
        onError: (error: Error) => {
            if (error.message !== "Lengkapi form dan dokumen sebelum submit.") {
                toast.error(error.message);
            }
        },
    });

    if (authLoading || eventLoading || (isAuthenticated && registrationsLoading)) {
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!event) {
        return <div className="flex min-h-screen items-center justify-center text-slate-500">Event tidak ditemukan.</div>;
    }

    const onlineTotal = (event.onlineTuitionFee ?? 0) + (event.registrationFee ?? 0);
    const offlineTotal = (event.offlineTuitionFee ?? 0) + (event.registrationFee ?? 0);
    const pkpaLike = isPkpaEvent(event);
    const termsItems = toChecklistItems(event.termsSummary, pkpaLike ? [
        "Peserta diwajibkan mengikuti seluruh sesi pelatihan PKPA secara tertib sesuai jadwal yang berlaku.",
        "Materi yang dibagikan penyelenggara dipakai untuk belajar pribadi dan tidak untuk diperjualbelikan atau disebarluaskan tanpa izin.",
        "Selama sesi berlangsung, peserta wajib menjaga nama akun, identitas, dan ketertiban kelas sesuai arahan panitia maupun pengajar.",
        "Kehadiran, keterlibatan, tugas, dan evaluasi menjadi bagian dari penilaian kelulusan program dan penerbitan sertifikat.",
        "Peserta online wajib menggunakan identitas yang jelas saat masuk sesi dan menjaga partisipasi aktif selama pembelajaran.",
        "Pelanggaran tata tertib dapat menjadi dasar evaluasi admin atau penghentian hak peserta pada program berjalan.",
    ] : [
        "Peserta wajib mengikuti alur registrasi dan verifikasi sesuai jadwal yang ditentukan.",
        "Data peserta harus valid karena dipakai untuk administrasi, evaluasi, dan sertifikat.",
        "Akses pembelajaran, quiz, dan sertifikat mengikuti aturan event dan course yang terhubung.",
    ]);
    const refundItems = toChecklistItems(event.refundPolicySummary, pkpaLike ? [
        "Dengan mengirim formulir ini, peserta menyatakan memahami bahwa pendaftaran yang sudah diajukan tidak dapat dibatalkan sepihak setelah diverifikasi panitia.",
        "Biaya pendaftaran yang sudah dibayarkan tidak dapat dikembalikan kecuali ada kebijakan resmi dari penyelenggara atau kegiatan dibatalkan oleh pihak penyelenggara.",
        "Pembayaran yang sudah tercatat tidak dapat dialihkan atas nama peserta lain tanpa persetujuan admin.",
        "Manfaat biaya hanya berlaku untuk periode program berjalan dan tidak otomatis dipindahkan ke tahun berikutnya.",
    ] : [
        "Biaya yang sudah dibayarkan diverifikasi lebih dulu sebelum status registrasi diproses admin.",
        "Pembatalan atau perubahan keikutsertaan mengikuti evaluasi admin dan kebijakan penyelenggara event.",
        "Jika ada revisi dokumen atau pembayaran, peserta harus melengkapi ulang sebelum pendaftaran dinyatakan final.",
    ]);
    const feeLines = [
        { label: "Biaya pendidikan online", value: event.onlineTuitionFee ?? 0 },
        { label: "Biaya pendaftaran online", value: event.registrationFee ?? 0 },
        { label: "Total online", value: onlineTotal, emphasis: true },
        { label: "Biaya pendidikan offline", value: event.offlineTuitionFee ?? 0 },
        { label: "Biaya pendaftaran offline", value: event.registrationFee ?? 0 },
        { label: "Total offline", value: offlineTotal, emphasis: true },
    ];
    const termsPreview = termsItems.slice(0, 2);
    const refundPreview = refundItems.slice(0, 2);
    const registrationPeriod = formatEventDateRange(event.registrationStart, event.registrationEnd);
    const eventPeriod = formatEventDateRange(event.eventStart, event.eventEnd);
    const uploadedTypes = new Set(existingRegistration?.documents.map((document) => document.type) ?? []);
    for (const definition of activeDocumentDefinitions) {
        if (files[definition.type]) {
            uploadedTypes.add(definition.type);
        }
    }
    const agreementsComplete = form.agreedTerms && form.agreedRefundPolicy && !!form.participantMode;
    const identityComplete = [
        form.fullName,
        form.birthPlace,
        form.birthDate,
        form.gender,
        form.domicileAddress,
        form.whatsapp,
        form.institution,
    ].every((value) => value.trim());
    const documentsComplete = activeDocumentDefinitions.every((definition) => uploadedTypes.has(definition.type));
    const flowSections = [
        { label: "1. Persetujuan & mode", complete: agreementsComplete },
        { label: "2. Data diri", complete: identityComplete },
        { label: "3. Dokumen & sumber info", complete: documentsComplete },
    ];
    const hasNewFiles = Object.values(files).some(Boolean);
    const isFormDirty = existingRegistration
        ? JSON.stringify(normalizeFormForCompare(form)) !== JSON.stringify(normalizeFormForCompare({
            participantMode: (existingRegistration.participantMode as FormState["participantMode"]) || "ONLINE",
            agreedTerms: existingRegistration.agreedTerms,
            agreedRefundPolicy: existingRegistration.agreedRefundPolicy,
            fullName: existingRegistration.fullName || "",
            birthPlace: existingRegistration.birthPlace || "",
            birthDate: existingRegistration.birthDate ? existingRegistration.birthDate.slice(0, 10) : "",
            gender: existingRegistration.gender || "",
            domicileAddress: existingRegistration.domicileAddress || "",
            whatsapp: existingRegistration.whatsapp || "",
            institution: existingRegistration.institution || "",
            titlePrefix: existingRegistration.titlePrefix || "",
            titleSuffix: existingRegistration.titleSuffix || "",
            sourceChannel: (existingRegistration.sourceChannel as FormState["sourceChannel"]) || "",
            sourceOtherText: existingRegistration.sourceOtherText || "",
            referralName: existingRegistration.referralName || "",
        })) || hasNewFiles
        : true;
    const submitButtonLabel = existingRegistration?.status === "SUBMITTED"
        ? (isFormDirty ? "Kirim pembaruan" : "Sudah terkirim")
        : existingRegistration?.status === "APPROVED" || existingRegistration?.status === "ACTIVE"
            ? (isFormDirty ? "Kirim pembaruan" : "Status sedang diproses")
            : existingRegistration?.status === "COMPLETED"
                ? (isFormDirty ? "Kirim pembaruan" : "Pendaftaran selesai")
                : "Submit pendaftaran";

    const handleSubmit = () => {
        if (saveMutation.isPending) return;

        if (existingRegistration && !isFormDirty) {
            if (existingRegistration.status === "SUBMITTED") {
                toast.info("Pendaftaran Anda sudah terkirim dan belum ada perubahan baru untuk dikirim ulang.");
                return;
            }

            if (existingRegistration.status === "APPROVED" || existingRegistration.status === "ACTIVE") {
                toast.info("Pendaftaran Anda sedang diproses. Tidak ada perubahan baru untuk dikirim saat ini.");
                return;
            }

            if (existingRegistration.status === "COMPLETED") {
                toast.info("Pendaftaran ini sudah selesai dan tidak memiliki perubahan baru untuk dikirim ulang.");
                return;
            }
        }

        saveMutation.mutate(true);
    };

    return (
        <RouteGuard allowedRoles={["LEARNER"]}>
            <div className="min-h-screen bg-background-light text-[#111418] dark:bg-background-dark dark:text-white">
                <SiteHeader />
                <main className="mx-auto max-w-[1200px] px-6 pb-20 pt-24">
                    <Link href={`/events/${slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary">
                        <ArrowLeft className="h-4 w-4" /> Kembali ke detail kegiatan
                    </Link>

                    <div className="mt-8 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
                        <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
                            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Registration Flow</p>
                                <h1 className="mt-3 text-2xl font-bold">{event.title}</h1>
                                <div className="mt-6 space-y-3 text-sm">
                                    {flowSections.map((section) => (
                                        <div key={section.label} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${section.complete ? "border-primary bg-primary/5 text-primary" : "border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400"}`}>
                                            <span className={section.complete ? "font-bold" : "font-medium"}>{section.label}</span>
                                            <span className={`rounded-full px-2 py-0.5 text-[11px] ${section.complete ? "bg-primary/10 font-bold text-primary" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                                                {section.complete ? "Selesai" : "Pending"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                                <h2 className="text-lg font-bold">Ringkasan biaya</h2>
                                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center justify-between"><span>Online</span><span className="font-semibold">{formatRupiah(onlineTotal)}</span></div>
                                    <div className="flex items-center justify-between"><span>Offline</span><span className="font-semibold">{formatRupiah(offlineTotal)}</span></div>
                                    <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3 dark:border-slate-800"><span>Mode dipilih</span><span className="font-semibold">{form.participantMode === "OFFLINE" ? formatRupiah(offlineTotal) : formatRupiah(onlineTotal)}</span></div>
                                </div>
                            </div>
                        </aside>

                        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                            <div className="space-y-10">
                                <div className="space-y-8 border-b border-slate-200 pb-10 dark:border-slate-800">
                                    <div>
                                        <h2 className="text-2xl font-bold">Persetujuan dan pilihan mode</h2>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Bagian ini langsung menjadi pembuka form. Setelah memahami persetujuan, pendaftar bisa lanjut isi data pada halaman yang sama tanpa tombol next.</p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {(["ONLINE", "OFFLINE"] as const).map((mode) => (
                                            <button key={mode} type="button" onClick={() => setForm((prev) => ({ ...prev, participantMode: mode }))} className={`rounded-[24px] border p-5 text-left transition ${form.participantMode === mode ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/40 dark:border-slate-800"}`}>
                                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{mode}</p>
                                                <p className="mt-3 text-lg font-bold">{mode === "ONLINE" ? "Kelas online" : "Kelas offline"}</p>
                                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{mode === "ONLINE" ? formatRupiah(onlineTotal) : formatRupiah(offlineTotal)}</p>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/60">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedPolicies((prev) => ({ ...prev, terms: !prev.terms }))}
                                            className="flex w-full items-start justify-between gap-4 text-left"
                                        >
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Applicant Agreement</p>
                                                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                                                    {pkpaLike ? "Tata tertib PKPA dan alur pelaksanaan" : "Tata tertib dan alur pelaksanaan"}
                                                </p>
                                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                    Ringkasan aturan utama tetap terlihat. Buka detail lengkap bila ingin membaca seluruh poin sebelum menyetujui.
                                                </p>
                                            </div>
                                            <span className={`mt-1 rounded-full border border-slate-200 p-2 transition dark:border-slate-700 ${expandedPolicies.terms ? "rotate-180" : ""}`}>
                                                <ChevronDown className="h-4 w-4" />
                                            </span>
                                        </button>

                                        {pkpaLike ? (
                                            <div className="mt-4 rounded-[24px] border border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950/70">
                                                <p className="text-center text-sm font-bold uppercase tracking-[0.08em] text-slate-900 dark:text-white">
                                                    Pendidikan Khusus Profesi Advokat
                                                </p>
                                                <p className="mt-1 text-center text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                                                    Tata Tertib dan Ketentuan Peserta
                                                </p>
                                                <div className="mt-4 grid gap-2 text-xs text-slate-500 dark:text-slate-400 md:grid-cols-2">
                                                    <p><span className="font-semibold text-slate-700 dark:text-slate-200">Periode pendaftaran:</span> {registrationPeriod || "Mengikuti jadwal admin"}</p>
                                                    <p><span className="font-semibold text-slate-700 dark:text-slate-200">Jadwal pendidikan:</span> {eventPeriod || event.scheduleSummary || "Mengikuti jadwal yang diumumkan"}</p>
                                                    <p className="md:col-span-2"><span className="font-semibold text-slate-700 dark:text-slate-200">Narahubung:</span> {event.contactName || "Admin Renjana"}{event.contactPhone ? ` (${event.contactPhone})` : ""}</p>
                                                </div>
                                            </div>
                                        ) : null}

                                        {pkpaLike ? (
                                            <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-primary/20 dark:bg-primary/10 dark:text-slate-200">
                                                Dengan mengisi formulir ini, saya menyepakati dan siap menjalankan PKPA sesuai dengan tata tertib PKPA FH UNDIP 2026 yang berlaku.
                                            </div>
                                        ) : null}

                                        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                            {termsPreview.map((item, index) => (
                                                <li key={item} className="flex gap-3 rounded-2xl bg-white px-4 py-3 dark:bg-slate-950/70">
                                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{index + 1}</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {expandedPolicies.terms ? (
                                            <ul className="mt-3 space-y-3 border-t border-dashed border-slate-200 pt-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:text-slate-300">
                                                {termsItems.slice(termsPreview.length).map((item, index) => (
                                                    <li key={item} className="flex gap-3 rounded-2xl bg-white px-4 py-3 dark:bg-slate-950/70">
                                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{termsPreview.length + index + 1}</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null}

                                        <button
                                            type="button"
                                            onClick={() => setExpandedPolicies((prev) => ({ ...prev, terms: !prev.terms }))}
                                            className="mt-4 text-sm font-semibold text-primary hover:underline"
                                        >
                                            {expandedPolicies.terms ? "Sembunyikan detail tata tertib" : "Baca tata tertib lengkap"}
                                        </button>
                                    </div>

                                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                                        <input type="checkbox" checked={form.agreedTerms} onChange={(e) => setForm((prev) => ({ ...prev, agreedTerms: e.target.checked }))} className="mt-1" />
                                        <span>Saya telah membaca dan menyetujui tata tertib serta alur pelaksanaan kegiatan.</span>
                                    </label>

                                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/60">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedPolicies((prev) => ({ ...prev, refund: !prev.refund }))}
                                            className="flex w-full items-start justify-between gap-4 text-left"
                                        >
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Fees & Refunds</p>
                                                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">Kebijakan pembatalan dan biaya</p>
                                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                                    Ringkasan biaya tetap tampil. Detail kebijakan pembatalan bisa dibuka saat diperlukan, tetap nyaman di mobile.
                                                </p>
                                            </div>
                                            <span className={`mt-1 rounded-full border border-slate-200 p-2 transition dark:border-slate-700 ${expandedPolicies.refund ? "rotate-180" : ""}`}>
                                                <ChevronDown className="h-4 w-4" />
                                            </span>
                                        </button>

                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                            <div className="rounded-2xl bg-white p-4 dark:bg-slate-950/70">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Rincian biaya pendidikan</p>
                                                <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                                                    {feeLines.map((line) => (
                                                        <div key={line.label} className={`flex items-center justify-between gap-4 ${line.emphasis ? "border-t border-dashed border-slate-200 pt-2 font-bold text-slate-900 dark:border-slate-800 dark:text-white" : ""}`}>
                                                            <span>{line.label}</span>
                                                            <span>{formatRupiah(line.value)}</span>
                                                        </div>
                                                    ))}
                                                    {(event.alumniRegistrationFee ?? 0) > 0 ? (
                                                        <div className="rounded-xl bg-primary/5 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
                                                            Alumni / skema khusus: biaya pendaftaran dapat menyesuaikan menjadi {formatRupiah(event.alumniRegistrationFee)} sesuai kebijakan event.
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl bg-white p-4 dark:bg-slate-950/70">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Pernyataan yang perlu dipahami</p>
                                                <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                    {refundPreview.map((item, index) => (
                                                        <li key={item} className="flex gap-3">
                                                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{index + 1}</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {expandedPolicies.refund ? (
                                                    <ul className="mt-3 space-y-3 border-t border-dashed border-slate-200 pt-3 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:text-slate-300">
                                                        {refundItems.slice(refundPreview.length).map((item, index) => (
                                                            <li key={item} className="flex gap-3">
                                                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{refundPreview.length + index + 1}</span>
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : null}
                                                {(event.contactName || event.contactPhone) ? (
                                                    <div className="mt-4 rounded-xl border border-slate-200 px-3 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                                        Narahubung: {event.contactName || "Admin Renjana"}{event.contactPhone ? ` (${event.contactPhone})` : ""}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>

                                        {pkpaLike ? (
                                            <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-primary/20 dark:bg-primary/10 dark:text-slate-200">
                                                Dengan mengisi formulir ini, saya telah memahami bahwa pendaftaran yang saya lakukan tidak dapat dibatalkan dan biaya yang telah dibayarkan mengikuti kebijakan resmi penyelenggara.
                                            </div>
                                        ) : null}

                                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300">
                                            Mohon baca seluruh poin di atas sebelum melanjutkan pendaftaran. Centang persetujuan berarti Anda menyetujui tata tertib, skema biaya, dan kebijakan pembatalan yang berlaku.
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setExpandedPolicies((prev) => ({ ...prev, refund: !prev.refund }))}
                                            className="mt-4 text-sm font-semibold text-primary hover:underline"
                                        >
                                            {expandedPolicies.refund ? "Sembunyikan detail kebijakan" : "Baca kebijakan lengkap"}
                                        </button>
                                    </div>

                                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                                        <input type="checkbox" checked={form.agreedRefundPolicy} onChange={(e) => setForm((prev) => ({ ...prev, agreedRefundPolicy: e.target.checked }))} className="mt-1" />
                                        <span>Saya memahami kebijakan pembatalan dan biaya yang berlaku untuk pendaftaran ini.</span>
                                    </label>
                                </div>

                                <div className="space-y-6 border-b border-slate-200 pb-10 dark:border-slate-800">
                                    <div>
                                        <h2 className="text-2xl font-bold">Data diri peserta</h2>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Data ini dipakai untuk administrasi, verifikasi, dan sertifikat.</p>
                                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Gelar depan dan gelar belakang sebaiknya opsional. Isi hanya jika ingin dicantumkan pada administrasi atau sertifikat.</p>
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <input value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Nama lengkap" className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                        <input value={form.birthPlace} onChange={(e) => setForm((prev) => ({ ...prev, birthPlace: e.target.value }))} placeholder="Tempat lahir" className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                        <input value={form.birthDate} onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))} type="date" className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                        <select value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))} className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                                            <option value="">Pilih jenis kelamin</option>
                                            <option value="Laki-Laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                        <input value={form.whatsapp} onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))} placeholder="Nomor WhatsApp" className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                        <input value={form.institution} onChange={(e) => setForm((prev) => ({ ...prev, institution: e.target.value }))} placeholder="Instansi / Universitas" className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                        <input value={form.titlePrefix} onChange={(e) => setForm((prev) => ({ ...prev, titlePrefix: e.target.value }))} placeholder="Gelar depan (opsional)" className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                        <input value={form.titleSuffix} onChange={(e) => setForm((prev) => ({ ...prev, titleSuffix: e.target.value }))} placeholder="Gelar belakang (opsional)" className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                    </div>

                                    <textarea value={form.domicileAddress} onChange={(e) => setForm((prev) => ({ ...prev, domicileAddress: e.target.value }))} placeholder="Alamat domisili" rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Dokumen dan sumber informasi</h2>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Upload dokumen wajib dan bantu kami mengetahui kanal promosi yang efektif.</p>
                                        {paymentGatewayEnabled ? <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-300">Pembayaran menggunakan checkout DOKU. Bukti pembayaran manual tidak wajib diunggah.</p> : null}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {activeDocumentDefinitions.map((definition) => {
                                            const uploaded = existingRegistration?.documents.find((document) => document.type === definition.type);
                                            return (
                                                <label key={definition.type} className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm dark:border-slate-700">
                                                    <div className="flex items-center gap-2 font-semibold"><UploadCloud className="h-4 w-4 text-primary" /> {definition.label}</div>
                                                    <input type="file" accept="image/*,.pdf" onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setFiles((prev) => ({ ...prev, [definition.type]: file }));
                                                    }} className="mt-4 block w-full text-xs" />
                                                    <p className="mt-3 text-xs text-slate-400">{files[definition.type]?.name || uploaded?.fileName || "Belum ada file dipilih"}</p>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <select value={form.sourceChannel} onChange={(e) => setForm((prev) => ({ ...prev, sourceChannel: e.target.value as FormState["sourceChannel"] }))} className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                                            <option value="">Mengetahui info dari mana?</option>
                                            <option value="INSTAGRAM">Instagram</option>
                                            <option value="TIKTOK">TikTok</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                        <input value={form.referralName} onChange={(e) => setForm((prev) => ({ ...prev, referralName: e.target.value }))} placeholder="Nama pemberi referral" className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                    </div>
                                    {form.sourceChannel === "OTHER" && (
                                        <input value={form.sourceOtherText} onChange={(e) => setForm((prev) => ({ ...prev, sourceOtherText: e.target.value }))} placeholder="Sebutkan sumber lainnya" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                    )}

                                    {existingRegistration?.documents?.length ? (
                                        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                            <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4" /> Dokumen tersimpan</div>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                {existingRegistration.documents.map((document) => (
                                                    <span key={document.id} className="rounded-full bg-white px-3 py-1 dark:bg-slate-900">{document.type}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between dark:border-slate-800">
                                <div className="max-w-md text-sm text-slate-500 dark:text-slate-400">
                                    Setelah persetujuan dicentang, pendaftar bisa langsung melengkapi seluruh data di halaman ini lalu submit tanpa perpindahan step.
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => saveMutation.mutate(false)} disabled={saveMutation.isPending} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300">
                                        {saveMutation.isPending ? "Menyimpan..." : "Simpan draft"}
                                    </button>
                                    <button type="button" onClick={handleSubmit} disabled={saveMutation.isPending} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                                        {saveMutation.isPending ? "Memproses..." : submitButtonLabel}
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                                <FileText className="h-3.5 w-3.5" /> Draft bisa diperbarui kembali sebelum diverifikasi admin.
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </RouteGuard>
    );
}
