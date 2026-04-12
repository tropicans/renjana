import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#f6f7f8] px-6 py-16 text-[#111418] dark:bg-[#0d1117] dark:text-white">
            <div className="mx-auto max-w-3xl space-y-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
                </Link>

                <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Privacy Policy</p>
                            <h1 className="text-3xl font-extrabold tracking-tight">Kebijakan Privasi Renjana</h1>
                        </div>
                    </div>

                    <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        <p>Kami menggunakan data akun, pendaftaran, dokumen, dan progres belajar hanya untuk operasional program, verifikasi peserta, penerbitan sertifikat, serta komunikasi resmi terkait kegiatan Renjana.</p>
                        <p>Dokumen yang Anda unggah disimpan untuk kebutuhan administrasi dan tidak dibagikan ke pihak lain di luar kebutuhan penyelenggaraan program, mitra akademik, atau kewajiban hukum yang relevan.</p>
                        <p>Anda dapat meminta pembaruan data peserta melalui admin program. Untuk data yang berdampak pada sertifikat atau histori pembelajaran, perubahan akan mengikuti proses verifikasi internal.</p>
                    </div>
                </section>
            </div>
        </main>
    );
}
