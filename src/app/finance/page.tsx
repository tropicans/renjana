import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { DollarSign, TrendingUp, FileText, RotateCcw, ArrowRight, Download } from "lucide-react";

// Mock data
const mockStats = {
    totalRevenue: 485000000,
    monthlyRevenue: 45000000,
    pendingInvoices: 12,
    pendingRefunds: 3,
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const mockRecentTransactions = [
    { id: "tx-1", description: "Program Enrollment - Batch 2026-A", amount: 15000000, type: "credit", date: "Jan 6, 2026" },
    { id: "tx-2", description: "Refund - Citra Dewi", amount: -5000000, type: "debit", date: "Jan 5, 2026" },
    { id: "tx-3", description: "Corporate Training - PT ABC", amount: 75000000, type: "credit", date: "Jan 4, 2026" },
    { id: "tx-4", description: "Program Enrollment - Individual", amount: 8500000, type: "credit", date: "Jan 3, 2026" },
];

export default function FinanceDashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Finance Console</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage transactions, invoices, and refunds</p>
                </div>
                <button className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-violet-500/50 transition-all flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Revenue" value={formatCurrency(mockStats.totalRevenue)} icon={DollarSign} description="All time" />
                <StatCard title="This Month" value={formatCurrency(mockStats.monthlyRevenue)} icon={TrendingUp} trend={{ value: 18, positive: true }} />
                <StatCard title="Pending Invoices" value={mockStats.pendingInvoices} icon={FileText} description="Awaiting payment" />
                <StatCard title="Pending Refunds" value={mockStats.pendingRefunds} icon={RotateCcw} description="To process" />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Link href="/finance/transactions" className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-violet-500/50 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                        <DollarSign className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-violet-500 transition-colors">Transactions</h3>
                    <p className="text-sm text-gray-500 mt-1">View all transactions</p>
                </Link>
                <Link href="/finance/invoices" className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-violet-500/50 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-violet-500 transition-colors">Invoices</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage invoices</p>
                </Link>
                <Link href="/finance/refunds" className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-violet-500/50 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                        <RotateCcw className="h-6 w-6 text-orange-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-violet-500 transition-colors">Refunds</h3>
                    <p className="text-sm text-gray-500 mt-1">Process refunds</p>
                </Link>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Recent Transactions</h2>
                    <Link href="/finance/transactions" className="text-violet-500 font-semibold hover:underline flex items-center gap-1">
                        View All
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    {mockRecentTransactions.map((tx, index) => (
                        <div key={tx.id} className={`flex items-center justify-between p-5 ${index !== mockRecentTransactions.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                            <div className="space-y-1">
                                <p className="font-semibold">{tx.description}</p>
                                <p className="text-sm text-gray-400">{tx.date}</p>
                            </div>
                            <p className={`text-lg font-bold ${tx.type === "credit" ? "text-green-500" : "text-red-500"}`}>
                                {tx.type === "credit" ? "+" : ""}{formatCurrency(tx.amount)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
