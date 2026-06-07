"use client";

import React from "react";
import { Star, Clock, Send, Loader2, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEvidences, gradeEvidence } from "@/lib/api";

export default function InstructorFeedbackPage() {
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [rating, setRating] = React.useState(0);
    const [comment, setComment] = React.useState("");

    const queryClient = useQueryClient();

    const { data: evidenceData, isLoading, error } = useQuery({
        queryKey: ["evidences-pending"],
        queryFn: () => fetchEvidences(),
    });

    const mutation = useMutation({
        mutationFn: ({ id, ratingVal, commentVal }: { id: string; ratingVal: number; commentVal: string }) =>
            gradeEvidence(id, ratingVal, commentVal),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["evidences-pending"] });
            setSelectedId(null);
            setRating(0);
            setComment("");
        },
    });

    const pendingFeedback = evidenceData?.evidences ?? [];
    const selectedItem = pendingFeedback.find((item) => item.id === selectedId);

    const handleSubmitFeedback = () => {
        if (!selectedId || rating === 0) return;
        mutation.mutate({ id: selectedId, ratingVal: rating, commentVal: comment });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500 rounded-2xl border border-dashed border-red-200">
                Gagal memuat data evidence. Silakan coba lagi.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Feedback</h1>
                <p className="text-gray-500 dark:text-gray-400">Review submissions and provide feedback to learners</p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold">{pendingFeedback.length}</span>
                    <span className="text-gray-500">Pending Review</span>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Pending List */}
                <div className="space-y-4">
                    <h2 className="font-bold text-lg">Pending Feedback</h2>
                    {pendingFeedback.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f]">
                            Semua tugas telah dinilai. Tidak ada feedback pending!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingFeedback.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        setSelectedId(item.id);
                                        setRating(0);
                                        setComment("");
                                    }}
                                    className={`cursor-pointer rounded-2xl border bg-white dark:bg-[#1a242f] p-5 transition-all hover:border-emerald-500/50 ${selectedId === item.id ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-100 dark:border-gray-800"
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-bold">{item.title}</h3>
                                            <p className="text-sm text-gray-500">{item.user?.fullName ?? item.user?.email ?? "Unknown"}</p>
                                        </div>
                                        <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-semibold uppercase">
                                            {item.fileType}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>Submitted: {new Date(item.uploadedAt).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Feedback Form */}
                <div className="space-y-4">
                    <h2 className="font-bold text-lg">Give Feedback</h2>
                    {selectedItem ? (
                        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{selectedItem.title}</h3>
                                    <p className="text-sm text-gray-500">{selectedItem.user?.fullName ?? selectedItem.user?.email}</p>
                                </div>
                                <a
                                    href={`/api/evidence/${selectedItem.id}/file`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-emerald-100 dark:border-emerald-900/30"
                                >
                                    Lihat Dokumen
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">Rating</p>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="p-1 hover:scale-110 transition-transform"
                                        >
                                            <Star
                                                className={`h-8 w-8 transition-colors ${star <= rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-gray-300 dark:text-gray-600 hover:text-amber-400"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-3">Comments</p>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Provide constructive feedback..."
                                    className="min-h-[150px] w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-sm resize-none focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="flex-1 px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 font-bold text-sm hover:border-emerald-500/50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitFeedback}
                                    disabled={rating === 0 || mutation.isPending}
                                    className="flex-1 bg-emerald-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {mutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    Submit Feedback
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f]">
                            <p className="text-gray-500">Select a submission to provide feedback</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
