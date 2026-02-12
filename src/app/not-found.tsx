"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] flex flex-col items-center justify-center px-6">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="relative z-10 text-center max-w-lg">
                {/* 404 Number */}
                <div className="relative mb-8">
                    <span className="text-[180px] md:text-[220px] font-extrabold text-gray-100 dark:text-gray-800 leading-none select-none">
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-24 w-24 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 animate-float">
                            <Search className="h-12 w-12 text-white" />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                    Page Not Found
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                    Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Home className="h-5 w-5" />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-full font-bold hover:border-primary/50 transition-all flex items-center gap-2"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Go Back
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 text-center">
                <p className="text-sm text-gray-400">
                    Need help? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>
                </p>
            </div>
        </div>
    );
}
