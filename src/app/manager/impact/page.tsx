"use client";

import React from "react";
import { Download, TrendingUp, TrendingDown, DollarSign, Users, Clock, Award } from "lucide-react";

// Mock impact data
const mockMetrics = [
    { name: "Training ROI", value: "156%", change: 12, positive: true, icon: DollarSign, description: "Return on training investment" },
    { name: "Completion Rate", value: "78%", change: 5, positive: true, icon: Award, description: "Programs completed" },
    { name: "Time to Competency", value: "45 days", change: 8, positive: true, icon: Clock, description: "Avg. time to proficiency" },
    { name: "Employee Retention", value: "94%", change: 3, positive: true, icon: Users, description: "Trained employees retained" },
];

const mockProgramImpact = [
    { program: "Mediator Certification", enrolled: 89, completed: 65, avgScore: 82, satisfaction: 4.5, productivityGain: "+18%" },
    { program: "Advanced Mediation", enrolled: 45, completed: 38, avgScore: 88, satisfaction: 4.7, productivityGain: "+24%" },
    { program: "Legal Framework", enrolled: 124, completed: 98, avgScore: 75, satisfaction: 4.2, productivityGain: "+12%" },
];

const mockTrends = [
    { month: "Sep", completions: 45 },
    { month: "Oct", completions: 52 },
    { month: "Nov", completions: 68 },
    { month: "Dec", completions: 75 },
    { month: "Jan", completions: 82 },
];

export default function TrainingImpactPage() {
    const maxCompletions = Math.max(...mockTrends.map((t) => t.completions));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Training Impact</h1>
                    <p className="text-gray-500 dark:text-gray-400">Measure the effectiveness of training programs</p>
                </div>
                <button className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-orange-500/50 transition-all flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {mockMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <div key={metric.name} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{metric.name}</p>
                                    <p className="text-3xl font-extrabold mt-1">{metric.value}</p>
                                    <div className={`flex items-center gap-1.5 mt-2 text-sm ${metric.positive ? "text-green-500" : "text-red-500"}`}>
                                        {metric.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        <span>{metric.positive ? "+" : "-"}{metric.change}% vs last quarter</span>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-orange-500/10 p-3">
                                    <Icon className="h-5 w-5 text-orange-500" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Completion Trend Chart */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-4">
                <h2 className="text-lg font-bold">Completion Trend</h2>
                <div className="flex items-end gap-4 h-40">
                    {mockTrends.map((trend) => (
                        <div key={trend.month} className="flex-1 flex flex-col items-center gap-2">
                            <div
                                className="w-full bg-orange-500 rounded-t-lg transition-all"
                                style={{ height: `${(trend.completions / maxCompletions) * 100}%`, minHeight: "8px" }}
                            />
                            <div className="text-center">
                                <p className="text-sm font-bold">{trend.completions}</p>
                                <p className="text-xs text-gray-400">{trend.month}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Program Impact Table */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Program Performance</h2>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <th className="text-left p-5 font-bold text-sm">Program</th>
                                <th className="text-center p-5 font-bold text-sm">Enrolled</th>
                                <th className="text-center p-5 font-bold text-sm">Completed</th>
                                <th className="text-center p-5 font-bold text-sm">Avg Score</th>
                                <th className="text-center p-5 font-bold text-sm">Rating</th>
                                <th className="text-center p-5 font-bold text-sm">Productivity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockProgramImpact.map((program, index) => (
                                <tr key={program.program} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all ${index !== mockProgramImpact.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                                    <td className="p-5 font-semibold">{program.program}</td>
                                    <td className="p-5 text-center">{program.enrolled}</td>
                                    <td className="p-5 text-center">{program.completed}</td>
                                    <td className="p-5 text-center">
                                        <span className={`font-bold ${program.avgScore >= 80 ? "text-green-500" : "text-amber-500"}`}>{program.avgScore}%</span>
                                    </td>
                                    <td className="p-5 text-center">⭐ {program.satisfaction}</td>
                                    <td className="p-5 text-center">
                                        <span className="text-green-500 font-bold">{program.productivityGain}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
