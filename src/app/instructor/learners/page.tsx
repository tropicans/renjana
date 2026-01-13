"use client";

import React from "react";
import Link from "next/link";
import { Search, Filter, Download, Mail, ChevronRight } from "lucide-react";

// Mock data
const mockLearners = [
    { id: "learner-1", name: "Andi Wijaya", email: "andi.wijaya@email.com", cohort: "Batch 2026-A", progress: 85, status: "on-track" as const, lastActivity: "2 hours ago" },
    { id: "learner-2", name: "Budi Santoso", email: "budi.santoso@email.com", cohort: "Batch 2026-A", progress: 45, status: "at-risk" as const, lastActivity: "5 days ago" },
    { id: "learner-3", name: "Citra Dewi", email: "citra.dewi@email.com", cohort: "Batch 2025-D", progress: 100, status: "completed" as const, lastActivity: "1 day ago" },
    { id: "learner-4", name: "Dian Pratama", email: "dian.pratama@email.com", cohort: "Batch 2026-A", progress: 72, status: "on-track" as const, lastActivity: "3 hours ago" },
    { id: "learner-5", name: "Eka Putra", email: "eka.putra@email.com", cohort: "Corporate Training - PT ABC", progress: 30, status: "at-risk" as const, lastActivity: "1 week ago" },
];

const statusStyles = {
    "on-track": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "at-risk": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "completed": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function LearnersPage() {
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredLearners = mockLearners.filter(
        (learner) =>
            learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            learner.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Learners</h1>
                    <p className="text-gray-500 dark:text-gray-400">View and manage learner progress</p>
                </div>
                <button className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-emerald-500/50 transition-all flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search learners..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] focus:border-emerald-500 outline-none transition-all"
                    />
                </div>
                <button className="h-12 w-12 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-emerald-500/50 transition-all">
                    <Filter className="h-4 w-4" />
                </button>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="font-semibold">{mockLearners.filter((l) => l.status === "on-track").length}</span>
                    <span className="text-gray-500">On Track</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="font-semibold">{mockLearners.filter((l) => l.status === "at-risk").length}</span>
                    <span className="text-gray-500">At Risk</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="font-semibold">{mockLearners.filter((l) => l.status === "completed").length}</span>
                    <span className="text-gray-500">Completed</span>
                </div>
            </div>

            {/* Learner List */}
            <div className="space-y-3">
                {filteredLearners.map((learner) => (
                    <Link
                        key={learner.id}
                        href={`/instructor/learners/${learner.id}`}
                        className="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5 hover:border-emerald-500/50 transition-all group"
                    >
                        {/* Avatar */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-lg">
                            {learner.name.charAt(0)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold group-hover:text-emerald-500 transition-colors">{learner.name}</h3>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${statusStyles[learner.status]}`}>
                                    {learner.status.replace("-", " ")}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {learner.email}
                                </span>
                                <span>•</span>
                                <span>{learner.cohort}</span>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="text-right hidden sm:block">
                            <p className="text-2xl font-bold">{learner.progress}%</p>
                            <p className="text-xs text-gray-400">Progress</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-24 hidden md:block">
                            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${learner.status === "completed" ? "bg-blue-500" :
                                            learner.status === "at-risk" ? "bg-red-500" : "bg-emerald-500"
                                        }`}
                                    style={{ width: `${learner.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                    </Link>
                ))}
            </div>

            {filteredLearners.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500">No learners found</p>
                </div>
            )}
        </div>
    );
}
