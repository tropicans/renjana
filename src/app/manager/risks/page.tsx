"use client";

import React from "react";
import { Download, AlertTriangle, User } from "lucide-react";

// Mock risk data
const mockRiskMatrix = [
    { department: "Legal", low: 35, medium: 8, high: 2 },
    { department: "Operations", low: 45, medium: 25, high: 8 },
    { department: "Finance", low: 22, medium: 7, high: 3 },
    { department: "HR", low: 18, medium: 5, high: 2 },
    { department: "IT", low: 38, medium: 22, high: 8 },
];

const mockHighRiskEmployees = [
    { name: "Eka Putra", department: "Operations", risk: "No activity for 14 days", daysInactive: 14 },
    { name: "Fani Rahma", department: "IT", risk: "Failed 3 assessments", failedCount: 3 },
    { name: "Galih Pratama", department: "Operations", risk: "20% progress in 30 days", progress: 20 },
    { name: "Hana Sari", department: "IT", risk: "No activity for 10 days", daysInactive: 10 },
];

const riskCategories = [
    { name: "Inactive (7+ days)", count: 18, color: "bg-red-500" },
    { name: "Low Progress", count: 12, color: "bg-orange-500" },
    { name: "Failed Assessments", count: 8, color: "bg-amber-500" },
    { name: "Missing Evidence", count: 5, color: "bg-purple-500" },
];

export default function RiskHeatmapPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Risk Heatmap</h1>
                    <p className="text-gray-500 dark:text-gray-400">Identify and address high-risk learning gaps</p>
                </div>
                <button className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-orange-500/50 transition-all flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                </button>
            </div>

            {/* Risk Summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {riskCategories.map((category) => (
                    <div key={category.name} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5">
                        <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full ${category.color}`} />
                            <span className="text-sm text-gray-500">{category.name}</span>
                        </div>
                        <p className="text-3xl font-extrabold mt-2">{category.count}</p>
                    </div>
                ))}
            </div>

            {/* Department Heatmap */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Department Risk Matrix</h2>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <th className="text-left p-5 font-bold text-sm">Department</th>
                                <th className="text-center p-5 font-bold text-sm">
                                    <span className="inline-flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-green-500" />
                                        Low Risk
                                    </span>
                                </th>
                                <th className="text-center p-5 font-bold text-sm">
                                    <span className="inline-flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-amber-500" />
                                        Medium
                                    </span>
                                </th>
                                <th className="text-center p-5 font-bold text-sm">
                                    <span className="inline-flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-red-500" />
                                        High Risk
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockRiskMatrix.map((row, index) => (
                                <tr key={row.department} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all ${index !== mockRiskMatrix.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                                    <td className="p-5 font-semibold">{row.department}</td>
                                    <td className="p-5 text-center">
                                        <span className="inline-block min-w-[40px] rounded-full bg-green-100 px-4 py-1.5 text-green-700 font-bold dark:bg-green-900/30 dark:text-green-400">
                                            {row.low}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="inline-block min-w-[40px] rounded-full bg-amber-100 px-4 py-1.5 text-amber-700 font-bold dark:bg-amber-900/30 dark:text-amber-400">
                                            {row.medium}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="inline-block min-w-[40px] rounded-full bg-red-100 px-4 py-1.5 text-red-700 font-bold dark:bg-red-900/30 dark:text-red-400">
                                            {row.high}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* High Risk Employees */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h2 className="text-xl font-bold">High Risk Employees</h2>
                </div>
                <div className="grid gap-3">
                    {mockHighRiskEmployees.map((employee) => (
                        <div
                            key={employee.name}
                            className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-900/20"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center dark:bg-red-900/50">
                                    <User className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <p className="font-bold">{employee.name}</p>
                                    <p className="text-sm text-gray-500">{employee.department}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-red-600 dark:text-red-400">{employee.risk}</p>
                                <button className="mt-2 px-4 py-1.5 rounded-full border border-red-300 dark:border-red-700 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
                                    Take Action
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
