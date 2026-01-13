"use client";

import React from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    Video,
    FileText,
    Users,
    ClipboardCheck,
    HelpCircle,
} from "lucide-react";

// Mock data
const activityTypes = [
    { id: "video", label: "Video", icon: Video, color: "bg-blue-500" },
    { id: "document", label: "Reading", icon: FileText, color: "bg-green-500" },
    { id: "live", label: "Live Session", icon: Users, color: "bg-purple-500" },
    { id: "quiz", label: "Quiz", icon: HelpCircle, color: "bg-orange-500" },
    { id: "assignment", label: "Assignment", icon: ClipboardCheck, color: "bg-red-500" },
];

const mockActivities = [
    { id: "act-1", name: "Introduction to Mediation", type: "video", duration: "15 min", usedIn: 3 },
    { id: "act-2", name: "Legal Framework Overview", type: "document", duration: "20 min", usedIn: 2 },
    { id: "act-3", name: "Case Study Workshop", type: "live", duration: "2 hours", usedIn: 1 },
    { id: "act-4", name: "Module 1 Assessment", type: "quiz", duration: "30 min", usedIn: 4 },
    { id: "act-5", name: "Conflict Analysis Report", type: "assignment", duration: "1 week", usedIn: 2 },
];

export default function ActivitiesPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedType, setSelectedType] = React.useState<string | null>(null);

    const filteredActivities = mockActivities.filter((a) => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !selectedType || a.type === selectedType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Activity Templates</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Define reusable activity templates for programs
                    </p>
                </div>
                <Link href="/admin/activities/new" className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20">
                    <Plus className="h-4 w-4" />
                    New Template
                </Link>
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedType(null)}
                    className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${selectedType === null
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                        : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-red-500/50"
                        }`}
                >
                    All
                </button>
                {activityTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${selectedType === type.id
                                ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-red-500/50"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {type.label}
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] focus:border-red-500 outline-none transition-all"
                />
            </div>

            {/* Activities Table */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <th className="text-left p-5 font-bold text-sm">Name</th>
                            <th className="text-center p-5 font-bold text-sm w-28">Type</th>
                            <th className="text-center p-5 font-bold text-sm w-28">Duration</th>
                            <th className="text-center p-5 font-bold text-sm w-28">Used In</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredActivities.map((activity, index) => {
                            const typeInfo = activityTypes.find((t) => t.id === activity.type);
                            const Icon = typeInfo?.icon || FileText;

                            return (
                                <tr
                                    key={activity.id}
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all ${index !== filteredActivities.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""
                                        }`}
                                >
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`rounded-xl p-3 ${typeInfo?.color} text-white`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <span className="font-semibold">{activity.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-semibold">
                                            {typeInfo?.label}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center text-sm text-gray-500">
                                        {activity.duration}
                                    </td>
                                    <td className="p-5 text-center text-sm text-gray-500">
                                        {activity.usedIn} programs
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredActivities.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500">No activities found</p>
                </div>
            )}
        </div>
    );
}
