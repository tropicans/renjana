"use client";

import React from "react";
import { Search, Download, Plus, FileText, Clock, CheckCircle, XCircle, Send } from "lucide-react";

// Mock invoices data
const mockInvoices = [
    { id: "INV-2026-001", client: "PT ABC Indonesia", program: "Corporate Training Package", amount: 75000000, dueDate: "Jan 15, 2026", issuedDate: "Jan 1, 2026", status: "pending" },
    { id: "INV-2026-002", client: "Batch 2026-A", program: "Mediator Certification", amount: 127500000, dueDate: "Jan 10, 2026", issuedDate: "Dec 28, 2025", status: "paid" },
    { id: "INV-2025-045", client: "PT XYZ Corp", program: "Advanced Mediation Workshop", amount: 45000000, dueDate: "Dec 20, 2025", issuedDate: "Dec 5, 2025", status: "overdue" },
    { id: "INV-2025-044", client: "Individual - Dian Pratama", program: "Legal Framework Fundamentals", amount: 8500000, dueDate: "Dec 15, 2025", issuedDate: "Dec 1, 2025", status: "paid" },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const statusConfig = {
    pending: { label: "Pending", icon: Clock, class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    paid: { label: "Paid", icon: CheckCircle, class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    overdue: { label: "Overdue", icon: XCircle, class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function InvoicesPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

    const filteredInvoices = mockInvoices.filter((inv) => {
        const matchesSearch = inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || inv.client.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Invoices</h1>
                    <p className="text-gray-500 dark:text-gray-400">Create and manage invoices</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-violet-500/50 transition-all flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                    <button className="bg-violet-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-violet-600 transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20">
                        <Plus className="h-4 w-4" />
                        New Invoice
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm">
                <span><strong className="text-amber-500">{mockInvoices.filter((i) => i.status === "pending").length}</strong> <span className="text-gray-500">Pending</span></span>
                <span><strong className="text-green-500">{mockInvoices.filter((i) => i.status === "paid").length}</strong> <span className="text-gray-500">Paid</span></span>
                <span><strong className="text-red-500">{mockInvoices.filter((i) => i.status === "overdue").length}</strong> <span className="text-gray-500">Overdue</span></span>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by invoice ID or client..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] focus:border-violet-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {Object.entries(statusConfig).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(statusFilter === key ? null : key)}
                            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${statusFilter === key
                                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                                    : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-violet-500/50"
                                }`}
                        >
                            {config.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredInvoices.map((invoice) => {
                    const status = statusConfig[invoice.status as keyof typeof statusConfig];
                    const StatusIcon = status.icon;

                    return (
                        <div key={invoice.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-4 hover:border-violet-500/50 transition-all">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-gray-400" />
                                        <span className="font-mono text-sm text-gray-500">{invoice.id}</span>
                                    </div>
                                    <h3 className="font-bold text-lg mt-1">{invoice.client}</h3>
                                    <p className="text-sm text-gray-500">{invoice.program}</p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.class}`}>
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    {status.label}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="text-sm text-gray-500">Due: {invoice.dueDate}</div>
                                <div className="text-xl font-extrabold">{formatCurrency(invoice.amount)}</div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-sm hover:border-violet-500/50 transition-all">
                                    View
                                </button>
                                {invoice.status === "pending" && (
                                    <button className="flex-1 bg-violet-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-violet-600 transition-all flex items-center justify-center gap-2">
                                        <Send className="h-4 w-4" />
                                        Send Reminder
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
