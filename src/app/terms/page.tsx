import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#f6f7f8] px-6 py-16 text-[#111418] dark:bg-[#0d1117] dark:text-white">
            <div className="mx-auto max-w-3xl space-y-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
                </Link>

                <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Terms of Service</p>
                            <h1 className="text-3xl font-extrabold tracking-tight">Syarat dan Ketentuan Renjana</h1>
                        </div>
                    </div>

                    <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        <p>Setiap akun hanya boleh digunakan oleh pemilik data yang sah. Peserta bertanggung jawab atas keakuratan data pendaftaran, dokumen, dan aktivitas yang dilakukan melalui akun masing-masing.</p>
                        <p>Pengiriman pendaftaran dianggap final setelah seluruh field wajib, persetujuan kebijakan, dan dokumen pendukung dipenuhi. Admin dapat meminta revisi jika ada data yang tidak valid atau tidak lengkap.</p>
                        <p>Sertifikat hanya dapat diterbitkan jika seluruh prasyarat event terpenuhi, termasuk penyelesaian pembelajaran, kelulusan post-test, dan evaluasi bila diwajibkan oleh penyelenggara.</p>
                    </div>
                </section>
            </div>
        </main>
    );
}
