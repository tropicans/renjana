"use client";

import React from "react";
import Link from "next/link";
import {
    Search,
    UserPlus,
    Clock,
    CheckCircle,
    XCircle,
    Download,
} from "lucide-react";

// Mock data
const mockEnrollments = [
    { id: "enr-1", learnerName: "Andi Wijaya", email: "andi.wijaya@email.com", program: "Mediator Certification", cohort: "Batch 2026-A", enrolledAt: "Dec 1, 2025", status: "active" },
    { id: "enr-2", learnerName: "Budi Santoso", email: "budi.santoso@email.com", program: "Mediator Certification", cohort: "Batch 2026-A", enrolledAt: "Dec 1, 2025", status: "active" },
    { id: "enr-3", learnerName: "Citra Dewi", email: "citra.dewi@email.com", program: "Advanced Mediation", cohort: "Batch 2025-D", enrolledAt: "Nov 15, 2025", status: "completed" },
    { id: "enr-4", learnerName: "Dian Pratama", email: "dian.pratama@email.com", program: "Legal Framework", cohort: "Corporate PT ABC", enrolledAt: "Jan 2, 2026", status: "pending" },
    { id: "enr-5", learnerName: "Eka Putra", email: "eka.putra@email.com", program: "Mediator Certification", cohort: "Batch 2025-C", enrolledAt: "Oct 1, 2025", status: "dropped" },
];

const statusConfig = {
    active: { label: "Active", icon: CheckCircle, class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    pending: { label: "Pending", icon: Clock, class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    completed: { label: "Completed", icon: CheckCircle, class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    dropped: { label: "Dropped", icon: XCircle, class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function EnrollmentsPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

    const filteredEnrollments = mockEnrollments.filter((e) => {
        const matchesSearch = e.learnerName.toLowerCase().includes(searchQuery.toLowerCase()) || e.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleExport = () => {
        // Create CSV content
        const headers = ["Learner Name", "Email", "Program", "Cohort", "Enrolled At", "Status"];
        const csvContent = [
            headers.join(","),
            ...mockEnrollments.map(e => `"${e.learnerName}","${e.email}","${e.program}","${e.cohort}","${e.enrolledAt}","${e.status}"`)
        ].join("\n");

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "enrollments_export.csv";
        link.click();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Enrollments</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage learner enrollments and cohorts</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-red-500/50 transition-all flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                    <Link href="/admin/enrollments/new" className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20">
                        <UserPlus className="h-4 w-4" />
                        Add Enrollment
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] focus:border-red-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {Object.entries(statusConfig).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(statusFilter === key ? null : key)}
                            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${statusFilter === key
                                ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-red-500/50"
                                }`}
                        >
                            {config.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
                <span className="font-semibold">{mockEnrollments.filter((e) => e.status === "active").length} <span className="font-normal text-gray-500">Active</span></span>
                <span className="font-semibold">{mockEnrollments.filter((e) => e.status === "pending").length} <span className="font-normal text-gray-500">Pending</span></span>
                <span className="font-semibold">{mockEnrollments.filter((e) => e.status === "completed").length} <span className="font-normal text-gray-500">Completed</span></span>
            </div>

            {/* Enrollments Table */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <th className="text-left p-5 font-bold text-sm">Learner</th>
                            <th className="text-left p-5 font-bold text-sm">Program</th>
                            <th className="text-left p-5 font-bold text-sm">Cohort</th>
                            <th className="text-left p-5 font-bold text-sm">Enrolled</th>
                            <th className="text-left p-5 font-bold text-sm">Status</th>
                            <th className="p-5"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEnrollments.map((enrollment, index) => {
                            const status = statusConfig[enrollment.status as keyof typeof statusConfig];
                            const StatusIcon = status.icon;

                            return (
                                <tr key={enrollment.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all ${index !== filteredEnrollments.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                                    <td className="p-5">
                                        <p className="font-semibold">{enrollment.learnerName}</p>
                                        <p className="text-sm text-gray-400">{enrollment.email}</p>
                                    </td>
                                    <td className="p-5 text-sm">{enrollment.program}</td>
                                    <td className="p-5 text-sm text-gray-500">{enrollment.cohort}</td>
                                    <td className="p-5 text-sm text-gray-500">{enrollment.enrolledAt}</td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.class}`}>
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {status.label}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <Link href={`/admin/enrollments/${enrollment.id}`} className="text-red-500 font-semibold text-sm hover:underline">Manage</Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredEnrollments.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500">No enrollments found</p>
                </div>
            )}
        </div>
    );
}
