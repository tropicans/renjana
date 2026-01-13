"use client";

import React from "react";
import { Star, Clock, Send } from "lucide-react";

// Mock pending feedback data
const mockPendingFeedback = [
    { id: "fb-1", learnerName: "Budi Santoso", activityTitle: "Submit Case Study Analysis", program: "Mediator Certification Program", submittedAt: "Jan 4, 2026", evidenceType: "Document" },
    { id: "fb-2", learnerName: "Eka Putra", activityTitle: "Complete Module 2 Quiz", program: "Legal Framework Fundamentals", submittedAt: "Jan 5, 2026", evidenceType: "Quiz" },
    { id: "fb-3", learnerName: "Dian Pratama", activityTitle: "Role Play Recording", program: "Advanced Mediation Skills", submittedAt: "Jan 6, 2026", evidenceType: "Video" },
];

export default function InstructorFeedbackPage() {
    const [selectedFeedback, setSelectedFeedback] = React.useState<string | null>(null);
    const [rating, setRating] = React.useState(0);
    const [comment, setComment] = React.useState("");

    const handleSubmitFeedback = () => {
        alert(`Feedback submitted for ${selectedFeedback}: ${rating} stars`);
        setSelectedFeedback(null);
        setRating(0);
        setComment("");
    };

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
                    <span className="font-semibold">{mockPendingFeedback.length}</span>
                    <span className="text-gray-500">Pending Review</span>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Pending List */}
                <div className="space-y-4">
                    <h2 className="font-bold text-lg">Pending Feedback</h2>
                    <div className="space-y-3">
                        {mockPendingFeedback.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedFeedback(item.id)}
                                className={`cursor-pointer rounded-2xl border bg-white dark:bg-[#1a242f] p-5 transition-all hover:border-emerald-500/50 ${selectedFeedback === item.id ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-100 dark:border-gray-800"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-bold">{item.activityTitle}</h3>
                                        <p className="text-sm text-gray-500">{item.learnerName}</p>
                                        <p className="text-xs text-gray-400">{item.program}</p>
                                    </div>
                                    <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-semibold">
                                        {item.evidenceType}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Submitted: {item.submittedAt}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback Form */}
                <div className="space-y-4">
                    <h2 className="font-bold text-lg">Give Feedback</h2>
                    {selectedFeedback ? (
                        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
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
                                    onClick={() => setSelectedFeedback(null)}
                                    className="flex-1 px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 font-bold text-sm hover:border-emerald-500/50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitFeedback}
                                    disabled={rating === 0}
                                    className="flex-1 bg-emerald-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    Submit Feedback
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500">Select a submission to provide feedback</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
