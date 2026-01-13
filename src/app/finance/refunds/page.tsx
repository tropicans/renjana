"use client";

import React from "react";
import { Search, Download, RotateCcw, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// Mock refunds data
const mockRefunds = [
    { id: "REF-2026-001", learner: "Eka Putra", email: "eka.putra@email.com", program: "Mediator Certification Program", amount: 8500000, requestDate: "Jan 5, 2026", reason: "Scheduling conflict", status: "pending" },
    { id: "REF-2025-015", learner: "Fani Rahma", email: "fani.rahma@email.com", program: "Advanced Mediation Skills", amount: 5000000, requestDate: "Dec 28, 2025", reason: "Personal reasons", status: "approved" },
    { id: "REF-2025-014", learner: "Galih Pratama", email: "galih.pratama@email.com", program: "Legal Framework Fundamentals", amount: 8500000, requestDate: "Dec 20, 2025", reason: "Course not as expected", status: "completed" },
    { id: "REF-2025-013", learner: "Hana Sari", email: "hana.sari@email.com", program: "Mediator Certification Program", amount: 8500000, requestDate: "Dec 15, 2025", reason: "Medical emergency", status: "rejected" },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const statusConfig = {
    pending: { label: "Pending", icon: Clock, class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    approved: { label: "Approved", icon: CheckCircle, class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    completed: { label: "Completed", icon: CheckCircle, class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    rejected: { label: "Rejected", icon: XCircle, class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function RefundsPage() {
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredRefunds = mockRefunds.filter((ref) =>
        ref.learner.toLowerCase().includes(searchQuery.toLowerCase()) || ref.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingAmount = mockRefunds.filter((r) => r.status === "pending" || r.status === "approved").reduce((sum, r) => sum + r.amount, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Refunds</h1>
                    <p className="text-gray-500 dark:text-gray-400">Process and track refund requests</p>
                </div>
                <button className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-violet-500/50 transition-all flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                </button>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-900/20 p-5">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span className="font-bold text-orange-700 dark:text-orange-400">
                        {mockRefunds.filter((r) => r.status === "pending").length} pending refund requests
                    </span>
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                    Total pending amount: {formatCurrency(pendingAmount)}
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by learner or refund ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] focus:border-violet-500 outline-none transition-all"
                />
            </div>

            {/* Refunds List */}
            <div className="space-y-4">
                {filteredRefunds.map((refund) => {
                    const status = statusConfig[refund.status as keyof typeof statusConfig];
                    const StatusIcon = status.icon;

                    return (
                        <div key={refund.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 hover:border-violet-500/50 transition-all">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center font-bold text-violet-500 text-lg">
                                            {refund.learner.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{refund.learner}</h3>
                                            <p className="text-sm text-gray-400">{refund.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="text-gray-400">Program:</span> {refund.program}</p>
                                        <p><span className="text-gray-400">Reason:</span> {refund.reason}</p>
                                        <p><span className="text-gray-400">Requested:</span> {refund.requestDate}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.class}`}>
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {status.label}
                                    </span>
                                    <p className="text-2xl font-extrabold">{formatCurrency(refund.amount)}</p>
                                    <p className="text-xs text-gray-400">{refund.id}</p>
                                </div>
                            </div>

                            {refund.status === "pending" && (
                                <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                                    <button className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-sm hover:border-red-500/50 transition-all flex items-center justify-center gap-2">
                                        <XCircle className="h-4 w-4" />
                                        Reject
                                    </button>
                                    <button className="flex-1 bg-violet-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-violet-600 transition-all flex items-center justify-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                    </button>
                                </div>
                            )}

                            {refund.status === "approved" && (
                                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                                    <button className="w-full bg-violet-500 text-white py-3 rounded-xl font-bold hover:bg-violet-600 transition-all flex items-center justify-center gap-2">
                                        <RotateCcw className="h-4 w-4" />
                                        Process Refund
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
