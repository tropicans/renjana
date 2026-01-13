import React from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Clock,
    PlayCircle,
    FileText,
    Upload,
    CheckCircle,
} from "lucide-react";

// Mock activity data
const mockActivity = {
    id: "act-1",
    title: "Complete Module 3: Legal Framework Basics",
    program: "Mediator Certification Program",
    description:
        "This module covers the fundamental legal principles that govern mediation practice. You will learn about confidentiality requirements, enforceability of mediation agreements, and the legal framework surrounding alternative dispute resolution.",
    type: "Video Lesson",
    duration: "45 minutes",
    status: "pending",
    dueDate: "Jan 8, 2026",
    objectives: [
        "Understand the legal basis of mediation in Indonesia",
        "Learn about confidentiality and privilege in mediation",
        "Recognize the enforceability of settlement agreements",
        "Apply ethical standards in mediation practice",
    ],
    evidenceRequired: [
        { type: "completion", label: "Watch full video", completed: false },
        { type: "quiz", label: "Pass module quiz (min. 70%)", completed: false },
    ],
};

export default function ActivityPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return (
        <div className="space-y-8">
            {/* Back button */}
            <Link
                href="/dashboard/actions"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-primary font-medium transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Action Queue
            </Link>

            {/* Activity Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-bold">
                        {mockActivity.type}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        {mockActivity.duration}
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    {mockActivity.title}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">{mockActivity.program}</p>
            </div>

            {/* Content Area */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Video/Content Placeholder */}
                    <div className="aspect-video rounded-2xl bg-zinc-900 flex items-center justify-center overflow-hidden">
                        <button className="bg-white/90 hover:bg-white text-black px-8 py-4 rounded-full font-bold flex items-center gap-3 transition-all">
                            <PlayCircle className="h-6 w-6" />
                            Start Video
                        </button>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">About this Activity</h2>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                            {mockActivity.description}
                        </p>
                    </div>

                    {/* Learning Objectives */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Learning Objectives</h2>
                        <ul className="space-y-3">
                            {mockActivity.objectives.map((objective, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <FileText className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <span className="text-gray-500 dark:text-gray-400">{objective}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Evidence Requirements */}
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-4">
                        <h3 className="font-bold">Evidence Requirements</h3>
                        <div className="space-y-3">
                            {mockActivity.evidenceRequired.map((evidence, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <div
                                        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${evidence.completed
                                            ? "border-green-500 bg-green-500"
                                            : "border-gray-300 dark:border-gray-600"
                                            }`}
                                    >
                                        {evidence.completed && (
                                            <CheckCircle className="h-3 w-3 text-white" />
                                        )}
                                    </div>
                                    <span
                                        className={
                                            evidence.completed
                                                ? "text-gray-400 line-through"
                                                : "text-gray-600 dark:text-gray-300"
                                        }
                                    >
                                        {evidence.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button className="w-full bg-primary text-white py-4 rounded-full font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Mark as Complete
                        </button>
                        <Link
                            href="/dashboard/evidence"
                            className="w-full bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 py-4 rounded-full font-bold hover:border-primary/50 transition-all flex items-center justify-center gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Upload Evidence
                        </Link>
                    </div>

                    {/* Due Date */}
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-5">
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
                            Due: {mockActivity.dueDate}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
