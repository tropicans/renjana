"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCcw, AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] flex flex-col items-center justify-center px-6">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <div className="relative z-10 text-center max-w-lg">
                {/* Error Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="h-24 w-24 rounded-2xl bg-red-500 flex items-center justify-center shadow-2xl shadow-red-500/30 animate-pulse">
                        <AlertTriangle className="h-12 w-12 text-white" />
                    </div>
                </div>

                {/* 500 Number */}
                <span className="text-8xl md:text-9xl font-extrabold text-gray-200 dark:text-gray-800 leading-none select-none">
                    500
                </span>

                {/* Message */}
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 mt-4">
                    Something Went Wrong
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                    We&apos;re sorry, but something unexpected happened. Our team has been notified.
                </p>

                {/* Error Details (development only) */}
                {process.env.NODE_ENV === "development" && error.message && (
                    <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-left">
                        <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={reset}
                        className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <RefreshCcw className="h-5 w-5" />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="border border-gray-200 dark:border-gray-700 px-8 py-4 rounded-full font-bold hover:border-primary/50 transition-all flex items-center gap-2"
                    >
                        <Home className="h-5 w-5" />
                        Go Home
                    </Link>
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
