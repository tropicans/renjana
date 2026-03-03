"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEvaluations } from "@/lib/api";
import {
    MessageSquare,
    Star,
    Loader2,
    ClipboardCheck,
} from "lucide-react";

export default function FeedbackPage() {
    // Fetch all user's evaluations (uses the learner path — returns own evaluations)
    const { data, isLoading } = useQuery({
        queryKey: ["my-evaluations"],
        queryFn: () => fetchEvaluations(),
    });

    const evaluations = data?.evaluations ?? [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Feedback</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Riwayat feedback dan evaluasi yang telah Anda berikan
                </p>
            </div>

            {/* Summary */}
            {evaluations.length > 0 && (
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{evaluations.length}</p>
                            <p className="text-xs text-gray-500">Total Evaluasi Diberikan</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-bold">
                                {(evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length).toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">rata-rata</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback List */}
            {evaluations.length > 0 ? (
                <div className="grid gap-4">
                    {evaluations.map((evaluation) => (
                        <div
                            key={evaluation.id}
                            className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] space-y-3"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="font-bold text-lg">{evaluation.course?.title ?? "Course"}</h3>
                                <div className="flex gap-0.5 shrink-0">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-4 w-4 ${star <= evaluation.rating
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-gray-300 dark:text-gray-600"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            {evaluation.comment ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                    &ldquo;{evaluation.comment}&rdquo;
                                </p>
                            ) : (
                                <p className="text-gray-400 dark:text-gray-600 text-sm italic">
                                    Tidak ada komentar
                                </p>
                            )}
                            <p className="text-xs text-gray-400">
                                {new Date(evaluation.createdAt).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>Belum ada evaluasi yang diberikan.</p>
                    <p className="text-sm mt-1">
                        Selesaikan course dan berikan evaluasi melalui halaman{" "}
                        <a href="/dashboard/evaluations" className="text-primary hover:underline">
                            Evaluasi
                        </a>.
                    </p>
                </div>
            )}
        </div>
    );
}
