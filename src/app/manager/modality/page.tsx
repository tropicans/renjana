"use client";

import React from "react";
import { MapPin, Wifi, Shuffle, Users, TrendingUp, CheckCircle } from "lucide-react";

// Mock modality data
const mockModalityStats = {
    luring: { sessions: 24, attendance: 92, completion: 88 },
    daring: { sessions: 45, attendance: 78, completion: 82 },
    hybrid: { sessions: 12, attendance: 85, completion: 79 },
};

const mockDepartmentModality = [
    { name: "Legal", luring: 85, daring: 72, hybrid: 78 },
    { name: "Operations", luring: 68, daring: 80, hybrid: 70 },
    { name: "Finance", luring: 75, daring: 85, hybrid: 82 },
    { name: "HR", luring: 90, daring: 70, hybrid: 75 },
    { name: "IT", luring: 55, daring: 92, hybrid: 80 },
];

const mockTrends = [
    { month: "Oct", luring: 20, daring: 35, hybrid: 8 },
    { month: "Nov", luring: 22, daring: 40, hybrid: 10 },
    { month: "Dec", luring: 24, daring: 45, hybrid: 12 },
    { month: "Jan", luring: 28, daring: 50, hybrid: 15 },
];

export default function ModalityReportPage() {
    const [selectedView, setSelectedView] = React.useState<"overview" | "department" | "trends">("overview");

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Modality Report</h1>
                <p className="text-gray-500 dark:text-gray-400">Compare training effectiveness across Luring, Daring, and Hybrid modes</p>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2">
                {["overview", "department", "trends"].map((view) => (
                    <button
                        key={view}
                        onClick={() => setSelectedView(view as typeof selectedView)}
                        className={`px-5 py-2.5 rounded-full font-semibold text-sm capitalize transition-all ${selectedView === view
                                ? "bg-orange-500 text-white"
                                : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-orange-500/50"
                            }`}
                    >
                        {view}
                    </button>
                ))}
            </div>

            {selectedView === "overview" && (
                <>
                    {/* Modality Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Luring Card */}
                        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Luring</h3>
                                    <p className="text-sm text-amber-700 dark:text-amber-300">Tatap Muka</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Sessions</span>
                                    <span className="font-bold">{mockModalityStats.luring.sessions}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Avg Attendance</span>
                                    <span className="font-bold text-green-600">{mockModalityStats.luring.attendance}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Completion Rate</span>
                                    <span className="font-bold">{mockModalityStats.luring.completion}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Daring Card */}
                        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
                                    <Wifi className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Daring</h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">Online</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Sessions</span>
                                    <span className="font-bold">{mockModalityStats.daring.sessions}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Avg Attendance</span>
                                    <span className="font-bold text-yellow-600">{mockModalityStats.daring.attendance}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Completion Rate</span>
                                    <span className="font-bold">{mockModalityStats.daring.completion}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Hybrid Card */}
                        <div className="rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/20 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center">
                                    <Shuffle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Hybrid</h3>
                                    <p className="text-sm text-purple-700 dark:text-purple-300">Kombinasi</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Sessions</span>
                                    <span className="font-bold">{mockModalityStats.hybrid.sessions}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Avg Attendance</span>
                                    <span className="font-bold text-green-600">{mockModalityStats.hybrid.attendance}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Completion Rate</span>
                                    <span className="font-bold">{mockModalityStats.hybrid.completion}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Insights */}
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6">
                        <h3 className="font-bold text-lg mb-4">Key Insights</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                <p className="text-sm"><strong>Luring</strong> has the highest attendance rate (92%) - physical presence drives engagement</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                                <TrendingUp className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-sm"><strong>Daring</strong> sessions are growing 15% month-over-month - preferred for scalability</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                                <Users className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-sm"><strong>Hybrid</strong> mode shows balanced engagement - good for flexible programs</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {selectedView === "department" && (
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <th className="text-left p-5 font-bold text-sm">Department</th>
                                <th className="text-center p-5 font-bold text-sm">
                                    <div className="flex items-center justify-center gap-2">
                                        <MapPin className="h-4 w-4 text-amber-500" />
                                        Luring
                                    </div>
                                </th>
                                <th className="text-center p-5 font-bold text-sm">
                                    <div className="flex items-center justify-center gap-2">
                                        <Wifi className="h-4 w-4 text-blue-500" />
                                        Daring
                                    </div>
                                </th>
                                <th className="text-center p-5 font-bold text-sm">
                                    <div className="flex items-center justify-center gap-2">
                                        <Shuffle className="h-4 w-4 text-purple-500" />
                                        Hybrid
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockDepartmentModality.map((dept, index) => (
                                <tr key={dept.name} className={index !== mockDepartmentModality.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}>
                                    <td className="p-5 font-semibold">{dept.name}</td>
                                    <td className="p-5 text-center">
                                        <span className={`font-bold ${dept.luring >= 80 ? "text-green-600" : dept.luring >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                                            {dept.luring}%
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`font-bold ${dept.daring >= 80 ? "text-green-600" : dept.daring >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                                            {dept.daring}%
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`font-bold ${dept.hybrid >= 80 ? "text-green-600" : dept.hybrid >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                                            {dept.hybrid}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedView === "trends" && (
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6">
                    <h3 className="font-bold text-lg mb-6">Session Trends by Modality</h3>
                    <div className="space-y-4">
                        {mockTrends.map((month) => (
                            <div key={month.month} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold w-12">{month.month}</span>
                                    <div className="flex-1 flex gap-2 mx-4">
                                        <div className="h-6 bg-amber-500 rounded" style={{ width: `${month.luring * 2}px` }} title={`Luring: ${month.luring}`} />
                                        <div className="h-6 bg-blue-500 rounded" style={{ width: `${month.daring * 2}px` }} title={`Daring: ${month.daring}`} />
                                        <div className="h-6 bg-purple-500 rounded" style={{ width: `${month.hybrid * 2}px` }} title={`Hybrid: ${month.hybrid}`} />
                                    </div>
                                    <span className="text-sm text-gray-500">{month.luring + month.daring + month.hybrid} total</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-6 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded bg-amber-500" />
                            <span className="text-sm text-gray-500">Luring</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded bg-blue-500" />
                            <span className="text-sm text-gray-500">Daring</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded bg-purple-500" />
                            <span className="text-sm text-gray-500">Hybrid</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
