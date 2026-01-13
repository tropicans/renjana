import React from "react";
import { Star, MessageSquare, Calendar, User } from "lucide-react";

// Mock feedback data
const mockFeedback = [
    {
        id: "fb-1",
        activityTitle: "Submit Assignment: Conflict Analysis",
        program: "Mediator Certification Program",
        instructor: "Dr. Sarah Wijaya",
        date: "Jan 4, 2026",
        rating: 4,
        comment:
            "Excellent analysis of the conflict dynamics. Your identification of underlying interests was particularly insightful. Consider expanding on the power imbalance section in future assignments.",
    },
    {
        id: "fb-2",
        activityTitle: "Complete Module 2: Introduction to Mediation",
        program: "Mediator Certification Program",
        instructor: "Prof. Ahmad Rahman",
        date: "Jan 2, 2026",
        rating: 5,
        comment:
            "Outstanding performance on the module quiz. You demonstrated a strong understanding of mediation fundamentals. Keep up the excellent work!",
    },
    {
        id: "fb-3",
        activityTitle: "Attend Live Session: Case Study Workshop",
        program: "Advanced Mediation Skills",
        instructor: "Dr. Sarah Wijaya",
        date: "Dec 28, 2025",
        rating: 4,
        comment:
            "Good participation during the workshop. Your role-play as the mediator showed promising skills. Practice active listening techniques to further improve.",
    },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 dark:text-gray-600"
                        }`}
                />
            ))}
        </div>
    );
}

export default function FeedbackPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Feedback</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Review feedback from your instructors
                </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-gray-500 font-medium">
                        {mockFeedback.length} Total Feedback
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-gray-500 font-medium">
                        {(
                            mockFeedback.reduce((acc, f) => acc + f.rating, 0) /
                            mockFeedback.length
                        ).toFixed(1)}{" "}
                        Average Rating
                    </span>
                </div>
            </div>

            {/* Feedback List */}
            <div className="grid gap-4">
                {mockFeedback.map((feedback) => (
                    <div
                        key={feedback.id}
                        className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-4 hover:border-primary/50 transition-all"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg">{feedback.activityTitle}</h3>
                                <p className="text-sm text-gray-500">
                                    {feedback.program}
                                </p>
                            </div>
                            <StarRating rating={feedback.rating} />
                        </div>

                        {/* Comment */}
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                            {feedback.comment}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                <span>{feedback.instructor}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{feedback.date}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {mockFeedback.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-2xl bg-primary/10 p-6 mb-4">
                        <MessageSquare className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">No feedback yet</h3>
                    <p className="text-gray-500">
                        Complete activities to receive feedback from instructors.
                    </p>
                </div>
            )}
        </div>
    );
}
