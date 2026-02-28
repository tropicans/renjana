"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/lib/i18n";

const ROLE_DASHBOARD: Record<string, string> = {
    ADMIN: "/admin",
    INSTRUCTOR: "/instructor",
    MANAGER: "/manager",
    FINANCE: "/finance",
    LEARNER: "/dashboard",
};

export function LoginForm() {
    const router = useRouter();
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.ok) {
            // Fetch session to get role then redirect
            const sessionRes = await fetch("/api/auth/session");
            const session = await sessionRes.json();
            const role = (session?.user?.role as string) ?? "LEARNER";
            const dashboardUrl = ROLE_DASHBOARD[role] ?? "/dashboard";
            router.push(dashboardUrl);
            router.refresh();
        } else {
            setError(t.auth.invalidCredentials);
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center lg:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight">{t.auth.welcomeBack}</h1>
                <p className="mt-2 text-gray-500">{t.auth.enterCredentials}</p>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Demo Credentials */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm">
                <p className="font-semibold text-primary mb-2">🔐 {t.auth.demoLogin}</p>
                <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400 text-xs">
                    <div>
                        <span className="font-medium">Learner:</span>
                        <br />ahmad@example.com
                    </div>
                    <div>
                        <span className="font-medium">Admin:</span>
                        <br />admin@renjana.com
                    </div>
                    <div>
                        <span className="font-medium">Instructor:</span>
                        <br />budi@example.com
                    </div>
                    <div>
                        <span className="font-medium">Manager:</span>
                        <br />diana@example.com
                    </div>
                    <div>
                        <span className="font-medium">Finance:</span>
                        <br />eko@example.com
                    </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">Password: password123 (atau admin123 untuk admin)</p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold">{t.auth.email}</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            disabled={isLoading}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-sm font-semibold">{t.auth.password}</label>
                        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                            {t.auth.forgotPassword}
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-4 rounded-full font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {t.auth.signingIn}
                        </>
                    ) : (
                        t.auth.signIn
                    )}
                </button>
            </form>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#f6f7f8] dark:bg-[#0d1117] px-4 text-gray-500">{t.auth.orContinueWith}</span>
                </div>
            </div>

            {/* Social Login (placeholder — no credentials yet) */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    disabled
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-semibold text-sm opacity-50 cursor-not-allowed"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                    Google
                </button>
                <button
                    type="button"
                    disabled
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-semibold text-sm opacity-50 cursor-not-allowed"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                    </svg>
                    Microsoft
                </button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-500">
                {t.auth.noAccount}{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                    {t.auth.signUpFree}
                </Link>
            </p>
        </div>
    );
}
