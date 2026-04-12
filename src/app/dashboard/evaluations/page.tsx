"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEvaluations, fetchMyRegistrations, submitEvaluation } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
    ClipboardCheck,
    Star,
    CheckCircle,
    Loader2,
    MessageSquare,
    Send,
} from "lucide-react";

export default function EvaluationsPage() {
    const toast = useToast();
    const queryClient = useQueryClient();
    const [activeEvaluation, setActiveEvaluation] = useState<string | null>(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    const { data: registrationData, isLoading: registrationsLoading } = useQuery({
        queryKey: ["my-registrations"],
        queryFn: fetchMyRegistrations,
    });

    // Fetch user's evaluations
    const { data: evalData, isLoading: evalsLoading } = useQuery({
        queryKey: ["my-evaluations"],
        queryFn: () => fetchEvaluations(),
    });

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: (data: { registrationId: string; courseId: string; rating: number; comment?: string }) =>
            submitEvaluation(data),
        onSuccess: () => {
            toast.success("Evaluasi berhasil dikirim! Terima kasih atas feedback Anda.");
            queryClient.invalidateQueries({ queryKey: ["my-evaluations"] });
            setActiveEvaluation(null);
            setRating(0);
            setComment("");
        },
        onError: (err: Error) => {
            toast.error(err.message || "Gagal mengirim evaluasi");
        },
    });

    const registrations = registrationData?.registrations ?? [];
    const evaluations = evalData?.evaluations ?? [];
    const evaluatedRegistrationIds = new Set(evaluations.map((e) => e.registrationId).filter(Boolean));

    const isLoading = registrationsLoading || evalsLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const evaluationReadyRegistrations = registrations.filter((registration) =>
        registration.event.courseId && ["APPROVED", "ACTIVE", "COMPLETED"].includes(registration.status)
    );
    const activeRegistrations = registrations.filter((registration) => ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUIRED", "APPROVED", "ACTIVE"].includes(registration.status));
    const evaluatedCount = evaluations.length;
    const pendingCount = evaluationReadyRegistrations.filter((registration) => !evaluatedRegistrationIds.has(registration.id)).length;

    const handleSubmit = (registrationId: string, courseId: string) => {
        if (rating === 0) {
            toast.error("Silakan beri rating terlebih dahulu");
            return;
        }
        submitMutation.mutate({ registrationId, courseId, rating, comment: comment || undefined });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Evaluasi</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Berikan penilaian untuk course yang telah Anda ikuti
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{evaluatedCount}</p>
                            <p className="text-xs text-gray-500">Sudah Dievaluasi</p>
                        </div>
                    </div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <ClipboardCheck className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{pendingCount}</p>
                            <p className="text-xs text-gray-500">Belum Dievaluasi</p>
                        </div>
                    </div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{activeRegistrations.length}</p>
                            <p className="text-xs text-gray-500">Sedang Berlangsung</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Evaluations */}
            {pendingCount > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-amber-600 flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5" /> Menunggu Evaluasi
                    </h2>
                    <div className="grid gap-4">
                        {evaluationReadyRegistrations
                            .filter((registration) => !evaluatedRegistrationIds.has(registration.id))
                            .map((registration) => (
                                <div
                                    key={registration.id}
                                    className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] space-y-4"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{registration.event.title}</h3>
                                            <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                                <CheckCircle className="h-3.5 w-3.5" /> Registrasi terverifikasi
                                            </p>
                                        </div>
                                        {activeEvaluation !== registration.id ? (
                                            <button
                                                onClick={() => {
                                                    setActiveEvaluation(registration.id);
                                                    setRating(0);
                                                    setComment("");
                                                }}
                                                className="px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-all"
                                            >
                                                Isi Evaluasi
                                            </button>
                                        ) : null}
                                    </div>

                                    {/* Evaluation Form */}
                                    {activeEvaluation === registration.id && (
                                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                            {/* Rating */}
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                                                    Rating Keseluruhan
                                                </label>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => setRating(star)}
                                                            onMouseEnter={() => setHoverRating(star)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            className="p-1 transition-transform hover:scale-110"
                                                        >
                                                            <Star
                                                                className={`h-8 w-8 transition-colors ${star <= (hoverRating || rating)
                                                                    ? "fill-amber-400 text-amber-400"
                                                                    : "text-gray-300 dark:text-gray-600"
                                                                    }`}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                                {rating > 0 && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {rating === 1 && "Kurang"}
                                                        {rating === 2 && "Cukup"}
                                                        {rating === 3 && "Baik"}
                                                        {rating === 4 && "Sangat Baik"}
                                                        {rating === 5 && "Luar Biasa"}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Comment */}
                                            <div>
                                                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-2">
                                                    Komentar (Opsional)
                                                </label>
                                                <textarea
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    placeholder="Bagikan pengalaman Anda mengikuti course ini..."
                                                    rows={3}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                                />
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleSubmit(registration.id, registration.event.courseId!)}
                                                    disabled={submitMutation.isPending}
                                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                                                >
                                                    {submitMutation.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Send className="h-4 w-4" />
                                                    )}
                                                    Kirim Evaluasi
                                                </button>
                                                <button
                                                    onClick={() => setActiveEvaluation(null)}
                                                    className="px-5 py-2.5 text-gray-500 text-sm hover:text-gray-700 transition-colors"
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Completed Evaluations */}
            {evaluations.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-green-600 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" /> Sudah Dievaluasi
                    </h2>
                    <div className="grid gap-4">
                        {evaluations.map((evaluation) => (
                            <div
                                key={evaluation.id}
                                className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] space-y-3"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="font-bold text-lg">{evaluation.course?.title}</h3>
                                    <div className="flex gap-0.5">
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
                                {evaluation.comment && (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                        {evaluation.comment}
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
                </div>
            )}

            {/* Empty State */}
             {registrations.length === 0 && (
                <div className="text-center py-12 text-gray-500 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>Belum ada course yang diikuti.</p>
                    <p className="text-sm mt-1">Daftarkan diri ke course untuk mulai belajar.</p>
                </div>
            )}
        </div>
    );
}
