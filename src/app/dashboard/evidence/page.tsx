"use client";

import React from "react";
import {
    Upload,
    FileCheck,
    Clock,
    CheckCircle,
    XCircle,
    Camera,
    File,
    Plus,
} from "lucide-react";

// Mock evidence data
const mockEvidence = [
    {
        id: "ev-1",
        activityTitle: "Complete Module 2: Introduction to Mediation",
        type: "Photo",
        submittedAt: "Jan 3, 2026",
        status: "approved",
        fileName: "certificate-module2.jpg",
    },
    {
        id: "ev-2",
        activityTitle: "Attend Live Session: Case Study Workshop",
        type: "Attendance",
        submittedAt: "Jan 2, 2026",
        status: "approved",
        fileName: "attendance-qr-scan.png",
    },
    {
        id: "ev-3",
        activityTitle: "Submit Assignment: Conflict Analysis",
        type: "Document",
        submittedAt: "Jan 5, 2026",
        status: "pending",
        fileName: "conflict-analysis-john.pdf",
    },
];

const statusStyles = {
    approved: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        icon: CheckCircle,
    },
    pending: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-400",
        icon: Clock,
    },
    rejected: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: XCircle,
    },
};

export default function EvidencePage() {
    const [showUploadModal, setShowUploadModal] = React.useState(false);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Evidence</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Track and manage your submitted evidence
                    </p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Upload Evidence
                </button>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-gray-500 font-medium">
                        {mockEvidence.filter((e) => e.status === "approved").length} Approved
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-gray-500 font-medium">
                        {mockEvidence.filter((e) => e.status === "pending").length} Pending Review
                    </span>
                </div>
            </div>

            {/* Evidence List */}
            <div className="grid gap-4">
                {mockEvidence.map((evidence) => {
                    const statusConfig = statusStyles[evidence.status as keyof typeof statusStyles];
                    const StatusIcon = statusConfig.icon;

                    return (
                        <div
                            key={evidence.id}
                            className="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5 hover:border-primary/50 transition-all"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                                {evidence.type === "Photo" ? (
                                    <Camera className="h-6 w-6 text-primary" />
                                ) : (
                                    <File className="h-6 w-6 text-primary" />
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="font-bold">{evidence.activityTitle}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <span>{evidence.fileName}</span>
                                    <span>•</span>
                                    <span>{evidence.submittedAt}</span>
                                </div>
                            </div>
                            <div
                                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}
                            >
                                <StatusIcon className="h-3.5 w-3.5" />
                                <span className="capitalize">{evidence.status}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowUploadModal(false)}
                    />
                    <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-8 shadow-xl">
                        <h2 className="text-xl font-bold mb-6">Upload Evidence</h2>

                        <div className="space-y-5">
                            {/* Activity Select */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Activity</label>
                                <select className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:border-primary outline-none">
                                    <option>Complete Module 3: Legal Framework Basics</option>
                                    <option>Submit Case Study Analysis</option>
                                    <option>Read: Ethics in Mediation Practice</option>
                                </select>
                            </div>

                            {/* Evidence Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Evidence Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all">
                                        <Camera className="h-6 w-6 text-primary" />
                                        <span className="text-xs font-semibold">Photo</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all">
                                        <File className="h-6 w-6 text-primary" />
                                        <span className="text-xs font-semibold">Document</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all">
                                        <FileCheck className="h-6 w-6 text-primary" />
                                        <span className="text-xs font-semibold">QR Scan</span>
                                    </button>
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Upload File</label>
                                <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-10 hover:border-primary/50 transition-all cursor-pointer">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-500">
                                            Drag & drop or click to upload
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    className="flex-1 px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 font-bold text-sm hover:border-primary/50 transition-all"
                                    onClick={() => setShowUploadModal(false)}
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primary/90 transition-all">
                                    Submit Evidence
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
