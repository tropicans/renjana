import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { CohortCard } from "@/components/instructor/cohort-card";
import {
    Users,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
} from "lucide-react";

// Mock data
const mockStats = {
    totalLearners: 127,
    avgCompletionRate: 68,
    atRiskLearners: 12,
    pendingFeedback: 8,
};

const mockCohorts = [
    {
        id: "cohort-1",
        name: "Batch 2026-A",
        program: "Mediator Certification Program",
        totalLearners: 45,
        completionRate: 72,
        atRiskCount: 3,
    },
    {
        id: "cohort-2",
        name: "Batch 2025-D",
        program: "Advanced Mediation Skills",
        totalLearners: 32,
        completionRate: 85,
        atRiskCount: 1,
    },
    {
        id: "cohort-3",
        name: "Corporate Training - PT ABC",
        program: "Legal Framework Fundamentals",
        totalLearners: 50,
        completionRate: 45,
        atRiskCount: 8,
    },
];

export default function InstructorDashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        Instructor Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Monitor cohort health and learner progress
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/instructor/feedback"
                        className="bg-emerald-500 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        Give Feedback
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/instructor/attendance"
                        className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-full font-bold hover:border-emerald-500/50 transition-all"
                    >
                        Manage Attendance
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Learners"
                    value={mockStats.totalLearners}
                    icon={Users}
                    description="Across all cohorts"
                />
                <StatCard
                    title="Avg. Completion"
                    value={`${mockStats.avgCompletionRate}%`}
                    icon={TrendingUp}
                    trend={{ value: 5, positive: true }}
                />
                <StatCard
                    title="At-Risk Learners"
                    value={mockStats.atRiskLearners}
                    icon={AlertTriangle}
                    description="Need attention"
                />
                <StatCard
                    title="Pending Feedback"
                    value={mockStats.pendingFeedback}
                    icon={CheckCircle}
                    description="Awaiting your review"
                />
            </div>

            {/* Cohorts */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Your Cohorts</h2>
                    <Link
                        href="/instructor/learners"
                        className="text-emerald-500 font-semibold hover:underline flex items-center gap-1"
                    >
                        View All
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mockCohorts.map((cohort) => (
                        <CohortCard key={cohort.id} {...cohort} />
                    ))}
                </div>
            </div>
        </div>
    );
}
