"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, FileText, Loader2, UploadCloud } from "lucide-react";
import { RouteGuard } from "@/components/auth/route-guard";
import { SiteHeader } from "@/components/ui/site-header";
import { useToast } from "@/components/ui/toast";
import { fetchEventBySlug, fetchMyRegistrations, saveRegistration, uploadRegistrationDocument } from "@/lib/api";
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

export default function EventRegistrationPage() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug;
    const queryClient = useQueryClient();
    const toast = useToast();
    const { isAuthenticated, isLoading: authLoading } = useUser();
    const [step, setStep] = React.useState(1);
    const [form, setForm] = React.useState<FormState>(initialState);
    const [files, setFiles] = React.useState<Partial<Record<(typeof documentDefinitions)[number]["type"], File>>>({});

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

            const draft = await saveRegistration({
                eventId: event.id,
                ...form,
                submit: false,
            });

            for (const definition of documentDefinitions) {
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
        onSuccess: async (_, submit) => {
            await queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
            if (event) {
                await queryClient.invalidateQueries({ queryKey: ["event", event.slug] });
            }
            toast.success(submit ? "Pendaftaran berhasil dikirim untuk verifikasi." : "Draft pendaftaran tersimpan.");
            if (submit) {
                window.location.href = "/my-registrations";
            }
        },
        onError: (error: Error) => toast.error(error.message),
    });

    if (authLoading || eventLoading || (isAuthenticated && registrationsLoading)) {
        return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!event) {
        return <div className="flex min-h-screen items-center justify-center text-slate-500">Event tidak ditemukan.</div>;
    }

    const onlineTotal = (event.onlineTuitionFee ?? 0) + (event.registrationFee ?? 0);
    const offlineTotal = (event.offlineTuitionFee ?? 0) + (event.registrationFee ?? 0);

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
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Registration Wizard</p>
                                <h1 className="mt-3 text-2xl font-bold">{event.title}</h1>
                                <div className="mt-6 space-y-3 text-sm">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className={`rounded-2xl border px-4 py-3 ${step === item ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400"}`}>
                                            {item === 1 ? "1. Persetujuan & mode" : item === 2 ? "2. Data diri" : "3. Dokumen & sumber info"}
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
                            {step === 1 && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-2xl font-bold">Persetujuan dan pilihan mode</h2>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tahap awal ini menyimpan preferensi keikutsertaan dan legal agreement utama.</p>
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

                                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                                        <input type="checkbox" checked={form.agreedTerms} onChange={(e) => setForm((prev) => ({ ...prev, agreedTerms: e.target.checked }))} className="mt-1" />
                                        <span>Saya telah membaca dan menyetujui tata tertib serta alur pelaksanaan kegiatan.</span>
                                    </label>

                                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm dark:border-slate-800">
                                        <input type="checkbox" checked={form.agreedRefundPolicy} onChange={(e) => setForm((prev) => ({ ...prev, agreedRefundPolicy: e.target.checked }))} className="mt-1" />
                                        <span>Saya memahami kebijakan pembatalan dan biaya yang berlaku untuk pendaftaran ini.</span>
                                    </label>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Data diri peserta</h2>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Data ini dipakai untuk administrasi, verifikasi, dan sertifikat.</p>
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
                                        <input value={form.titlePrefix} onChange={(e) => setForm((prev) => ({ ...prev, titlePrefix: e.target.value }))} placeholder="Gelar depan" className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                        <input value={form.titleSuffix} onChange={(e) => setForm((prev) => ({ ...prev, titleSuffix: e.target.value }))} placeholder="Gelar belakang" className="rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                    </div>

                                    <textarea value={form.domicileAddress} onChange={(e) => setForm((prev) => ({ ...prev, domicileAddress: e.target.value }))} placeholder="Alamat domisili" rows={4} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950" />
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Dokumen dan sumber informasi</h2>
                                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Upload dokumen wajib dan bantu kami mengetahui kanal promosi yang efektif.</p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        {documentDefinitions.map((definition) => {
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
                            )}

                            <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between dark:border-slate-800">
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep((prev) => Math.max(1, prev - 1))} disabled={step === 1} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300">
                                        Kembali
                                    </button>
                                    {step < 3 && (
                                        <button type="button" onClick={() => setStep((prev) => Math.min(3, prev + 1))} className="rounded-full border border-primary/30 px-5 py-2.5 text-sm font-semibold text-primary">
                                            Lanjut
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => saveMutation.mutate(false)} disabled={saveMutation.isPending} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300">
                                        {saveMutation.isPending ? "Menyimpan..." : "Simpan draft"}
                                    </button>
                                    <button type="button" onClick={() => saveMutation.mutate(true)} disabled={saveMutation.isPending} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                                        {saveMutation.isPending ? "Memproses..." : "Submit pendaftaran"}
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
