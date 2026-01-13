import React from "react";
import { ActionCard } from "@/components/dashboard/action-card";
import { Filter, MapPin, Wifi, Shuffle } from "lucide-react";

// Mock data for action queue with modality
const mockActions = [
    {
        id: "act-1",
        title: "Complete Module 3: Legal Framework Basics",
        program: "Mediator Certification Program",
        dueDate: "Jan 8, 2026",
        status: "pending" as const,
        type: "Video Lesson",
        modality: "DARING" as const,
    },
    {
        id: "act-2",
        title: "Submit Case Study Analysis",
        program: "Mediator Certification Program",
        dueDate: "Jan 10, 2026",
        status: "pending" as const,
        type: "Assignment",
        modality: "DARING" as const,
    },
    {
        id: "act-3",
        title: "Attend Live Session: Negotiation Techniques",
        program: "Advanced Mediation Skills",
        dueDate: "Jan 12, 2026",
        status: "in-progress" as const,
        type: "Live Session",
        modality: "LURING" as const,
    },
    {
        id: "act-4",
        title: "Read: Ethics in Mediation Practice",
        program: "Mediator Certification Program",
        dueDate: "Jan 5, 2026",
        status: "overdue" as const,
        type: "Reading Material",
        modality: "HYBRID" as const,
    },
    {
        id: "act-5",
        title: "Complete Quiz: Module 2 Assessment",
        program: "Advanced Mediation Skills",
        dueDate: "Jan 15, 2026",
        status: "pending" as const,
        type: "Quiz",
        modality: "DARING" as const,
    },
];

export default function ActionsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Action Queue</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Your pending activities and assignments
                    </p>
                </div>
                <button className="flex items-center gap-2 bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-800 px-5 py-2.5 rounded-xl font-semibold text-sm hover:border-primary/50 transition-all">
                    <Filter className="h-4 w-4" />
                    Filter
                </button>
            </div>

            {/* Stats Summary */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-gray-500 font-medium">
                        {mockActions.filter((a) => a.status === "pending").length} Pending
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-gray-500 font-medium">
                        {mockActions.filter((a) => a.status === "in-progress").length} In Progress
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-gray-500 font-medium">
                        {mockActions.filter((a) => a.status === "overdue").length} Overdue
                    </span>
                </div>
                <div className="border-l border-gray-200 dark:border-gray-700 pl-4 ml-2" />
                <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-gray-500 font-medium">
                        {mockActions.filter((a) => a.modality === "LURING").length} Luring
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Wifi className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-gray-500 font-medium">
                        {mockActions.filter((a) => a.modality === "DARING").length} Daring
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Shuffle className="h-3.5 w-3.5 text-purple-500" />
                    <span className="text-gray-500 font-medium">
                        {mockActions.filter((a) => a.modality === "HYBRID").length} Hybrid
                    </span>
                </div>
            </div>

            {/* Action List */}
            <div className="grid gap-4">
                {mockActions.map((action) => (
                    <ActionCard key={action.id} {...action} />
                ))}
            </div>

            {/* Empty state (hidden when there are actions) */}
            {mockActions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-2xl bg-primary/10 p-6 mb-4">
                        <Filter className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">All caught up!</h3>
                    <p className="text-gray-500">No pending actions at the moment.</p>
                </div>
            )}
        </div>
    );
}
