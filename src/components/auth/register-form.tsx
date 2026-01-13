"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

export function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");

    const passwordRequirements = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "Contains uppercase", met: /[A-Z]/.test(password) },
        { label: "Contains number", met: /[0-9]/.test(password) },
    ];

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Redirect to login on success
            window.location.href = "/login";
        }, 1500);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center lg:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
                <p className="mt-2 text-gray-500">Start your learning journey today</p>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                    <label htmlFor="fullname" className="text-sm font-semibold">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="fullname"
                            type="text"
                            placeholder="John Doe"
                            required
                            disabled={isLoading}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            disabled={isLoading}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
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
                    {/* Password Requirements */}
                    {password.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {passwordRequirements.map((req, i) => (
                                <span
                                    key={i}
                                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${req.met
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                        }`}
                                >
                                    {req.met && <CheckCircle className="h-3 w-3" />}
                                    {req.label}
                                </span>
                            ))}
                        </div>
                    )}
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
                            Creating account...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#f6f7f8] dark:bg-[#0d1117] px-4 text-gray-500">Or sign up with</span>
                </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-semibold text-sm hover:border-primary/50 transition-all disabled:opacity-50"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                    Google
                </button>
                <button
                    type="button"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-semibold text-sm hover:border-primary/50 transition-all disabled:opacity-50"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M17.791,1.198c-0.391-0.391-1.023-0.391-1.414,0L12,5.575L7.623,1.198c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l4.377,4.377v7.037c0,0.552,0.448,1,1,1s1-0.448,1-1V7.039l4.377-4.377l-0.172-0.241V2.612C17.963,2.123,17.963,1.369,17.791,1.198z M12,16.026c-3.86,0-7,3.14-7,7c0,0.552,0.448,1,1,1s1-0.448,1-1c0-2.757,2.243-5,5-5s5,2.243,5,5c0,0.552,0.448,1,1,1s1-0.448,1-1C19,19.166,15.86,16.026,12,16.026z" />
                    </svg>
                    Microsoft
                </button>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
