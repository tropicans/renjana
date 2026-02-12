"use client";

import React from "react";
import {
    Search,
    Download,
    User,
    FileText,
    UserPlus,
    Edit,
    CheckCircle,
    Settings,
    type LucideIcon,
} from "lucide-react";

// Mock data
const mockAuditLogs = [
    { id: "log-1", action: "program.created", description: "Created new program 'Legal Framework Fundamentals'", user: "Admin", userRole: "Administrator", timestamp: "Jan 6, 2026 10:30 AM", category: "program" },
    { id: "log-2", action: "enrollment.approved", description: "Approved enrollment for Batch 2026-A (15 learners)", user: "System", userRole: "Automation", timestamp: "Jan 6, 2026 09:15 AM", category: "enrollment" },
    { id: "log-3", action: "activity.updated", description: "Updated activity 'Module 5: Conflict Resolution'", user: "Dr. Sarah Wijaya", userRole: "Instructor", timestamp: "Jan 5, 2026 04:45 PM", category: "activity" },
    { id: "log-4", action: "user.login", description: "User logged in from Jakarta, Indonesia", user: "Andi Wijaya", userRole: "Learner", timestamp: "Jan 5, 2026 02:30 PM", category: "auth" },
    { id: "log-5", action: "program.published", description: "Published program 'Advanced Mediation Skills'", user: "Admin", userRole: "Administrator", timestamp: "Jan 5, 2026 11:00 AM", category: "program" },
    { id: "log-6", action: "evidence.submitted", description: "Evidence submitted for 'Case Study Analysis'", user: "Budi Santoso", userRole: "Learner", timestamp: "Jan 4, 2026 03:20 PM", category: "evidence" },
];

const categoryConfig: Record<string, { icon: LucideIcon; color: string }> = {
    program: { icon: FileText, color: "bg-blue-500" },
    enrollment: { icon: UserPlus, color: "bg-green-500" },
    activity: { icon: Edit, color: "bg-purple-500" },
    auth: { icon: User, color: "bg-orange-500" },
    evidence: { icon: CheckCircle, color: "bg-teal-500" },
    settings: { icon: Settings, color: "bg-gray-500" },
};

export default function AuditLogPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);

    const filteredLogs = mockAuditLogs.filter((log) => {
        const matchesSearch = log.description.toLowerCase().includes(searchQuery.toLowerCase()) || log.user.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !categoryFilter || log.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(mockAuditLogs.map((l) => l.category))];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Audit Log</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track all system activity and changes</p>
                </div>
                <button className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-red-500/50 transition-all flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Logs
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] focus:border-red-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setCategoryFilter(null)}
                        className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${categoryFilter === null
                                ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-red-500/50"
                            }`}
                    >
                        All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setCategoryFilter(category)}
                            className={`px-4 py-2 rounded-full font-semibold text-sm capitalize transition-all ${categoryFilter === category
                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                    : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-red-500/50"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-4">
                {filteredLogs.map((log) => {
                    const config = categoryConfig[log.category] || categoryConfig.settings;
                    const Icon = config.icon;

                    return (
                        <div
                            key={log.id}
                            className="flex items-start gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5 hover:border-red-500/50 transition-all"
                        >
                            <div className={`rounded-xl p-3 ${config.color} text-white`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold">{log.description}</p>
                                <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                                    <span className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5" />
                                        {log.user}
                                    </span>
                                    <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-semibold">
                                        {log.userRole}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-sm text-gray-500">{log.timestamp}</p>
                                <p className="text-xs text-gray-400 capitalize mt-1">{log.category}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredLogs.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500">No logs found</p>
                </div>
            )}

            {/* Load More */}
            <div className="text-center">
                <button className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-full font-semibold hover:border-red-500/50 transition-all">
                    Load More
                </button>
            </div>
        </div>
    );
}
