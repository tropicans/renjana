import Link from "next/link";
import { ArrowLeft, Scale, BookOpen, Trophy, Clock } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side: Branding */}
            <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#101922] text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-primary/10" />

                {/* Logo */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
                            <Scale className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="text-2xl font-extrabold tracking-tight">Renjana</span>
                            <p className="text-xs text-gray-400">Elite Legal Training</p>
                        </div>
                    </Link>
                </div>

                {/* Benefits */}
                <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl font-extrabold tracking-tight">
                        Start Your Journey<br />to Excellence
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-semibold">50+ Programs</p>
                                <p className="text-sm text-gray-400">Comprehensive legal curriculum</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Trophy className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="font-semibold">98% Success Rate</p>
                                <p className="text-sm text-gray-400">Certification exam pass rate</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">Flexible Learning</p>
                                <p className="text-sm text-gray-400">Learn at your own pace</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quote */}
                <div className="relative z-10">
                    <blockquote className="border-l-2 border-emerald-400 pl-4">
                        <p className="text-lg font-light italic text-gray-300">
                            &ldquo;Invest in yourself. Your career is the engine of your wealth.&rdquo;
                        </p>
                        <footer className="mt-2 text-sm text-gray-500">— Paul Clitheroe</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-col bg-[#f6f7f8] dark:bg-[#0d1117]">
                {/* Mobile Header */}
                <div className="lg:hidden p-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                {/* Desktop Back Button */}
                <div className="hidden lg:block p-8">
                    <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 text-sm font-medium hover:border-primary/50 transition-all">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                {/* Form Container */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="inline-flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
                                    <Scale className="h-6 w-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <span className="text-2xl font-extrabold tracking-tight">Renjana</span>
                                    <p className="text-xs text-gray-500">Elite Legal Training</p>
                                </div>
                            </div>
                        </div>

                        <RegisterForm />

                        <p className="mt-8 text-center text-xs text-gray-500">
                            By creating an account, you agree to our{" "}
                            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                            {" "}and{" "}
                            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
