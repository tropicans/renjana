import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    return (
        <main className="min-h-screen bg-[#f6f7f8] px-6 py-16 text-[#111418] dark:bg-[#0d1117] dark:text-white">
            <div className="mx-auto max-w-2xl space-y-8">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke login
                </Link>

                <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Password Help</p>
                            <h1 className="text-3xl font-extrabold tracking-tight">Reset password belum diaktifkan</h1>
                        </div>
                    </div>

                    <p className="mt-8 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        Untuk sementara, reset password dilakukan manual oleh admin. Silakan hubungi tim Renjana melalui kontak resmi agar akun Anda bisa dibantu dipulihkan.
                    </p>

                    <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        Email: admin@renjana.com<br />
                        WhatsApp: 081717777247
                    </div>
                </section>
            </div>
        </main>
    );
}
