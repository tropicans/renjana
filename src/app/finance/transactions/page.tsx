"use client";

import React from "react";
import { Search, Download, ArrowUpRight, ArrowDownLeft } from "lucide-react";

// Mock transactions data
const mockTransactions = [
    { id: "tx-1", description: "Program Enrollment - Batch 2026-A", learner: "15 learners", amount: 127500000, type: "credit", category: "enrollment", date: "Jan 6, 2026", status: "completed" },
    { id: "tx-2", description: "Refund - Eka Putra", learner: "Eka Putra", amount: -8500000, type: "debit", category: "refund", date: "Jan 5, 2026", status: "completed" },
    { id: "tx-3", description: "Corporate Training - PT ABC", learner: "PT ABC", amount: 75000000, type: "credit", category: "corporate", date: "Jan 4, 2026", status: "completed" },
    { id: "tx-4", description: "Program Upgrade", learner: "Citra Dewi", amount: 3500000, type: "credit", category: "upgrade", date: "Jan 3, 2026", status: "completed" },
    { id: "tx-5", description: "Individual Enrollment", learner: "Galih Pratama", amount: 8500000, type: "credit", category: "enrollment", date: "Jan 2, 2026", status: "pending" },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.abs(value));
};

export default function TransactionsPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [typeFilter, setTypeFilter] = React.useState<string | null>(null);

    const filteredTransactions = mockTransactions.filter((tx) => {
        const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || tx.learner.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !typeFilter || tx.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const totalCredit = mockTransactions.filter((tx) => tx.type === "credit").reduce((sum, tx) => sum + tx.amount, 0);
    const totalDebit = mockTransactions.filter((tx) => tx.type === "debit").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Transactions</h1>
                    <p className="text-gray-500 dark:text-gray-400">View and manage all financial transactions</p>
                </div>
                <button className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-violet-500/50 transition-all flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                </button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 p-5">
                    <div className="flex items-center gap-2">
                        <ArrowDownLeft className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">Total Income</span>
                    </div>
                    <p className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-2">{formatCurrency(totalCredit)}</p>
                </div>
                <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-5">
                    <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-semibold text-red-700 dark:text-red-400">Total Outgoing</span>
                    </div>
                    <p className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-2">{formatCurrency(totalDebit)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] focus:border-violet-500 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {[{ key: null, label: "All" }, { key: "credit", label: "Income" }, { key: "debit", label: "Outgoing" }].map((filter) => (
                        <button
                            key={filter.label}
                            onClick={() => setTypeFilter(filter.key)}
                            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${typeFilter === filter.key
                                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                                    : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-violet-500/50"
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <th className="text-left p-5 font-bold text-sm">Description</th>
                            <th className="text-left p-5 font-bold text-sm">Learner/Entity</th>
                            <th className="text-left p-5 font-bold text-sm">Date</th>
                            <th className="text-left p-5 font-bold text-sm">Status</th>
                            <th className="text-right p-5 font-bold text-sm">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((tx, index) => (
                            <tr key={tx.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all ${index !== filteredTransactions.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tx.type === "credit" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                                            {tx.type === "credit" ? <ArrowDownLeft className="h-5 w-5 text-green-500" /> : <ArrowUpRight className="h-5 w-5 text-red-500" />}
                                        </div>
                                        <span className="font-semibold">{tx.description}</span>
                                    </div>
                                </td>
                                <td className="p-5 text-gray-500">{tx.learner}</td>
                                <td className="p-5 text-gray-500">{tx.date}</td>
                                <td className="p-5">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${tx.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className={`p-5 text-right font-bold ${tx.type === "credit" ? "text-green-500" : "text-red-500"}`}>
                                    {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
