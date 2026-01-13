"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone, Building, Calendar, BookOpen, Save, UserX, RefreshCw } from "lucide-react";

// Mock enrollment data
const mockEnrollments: Record<string, {
    id: string;
    learnerName: string;
    email: string;
    phone: string;
    organization: string;
    program: string;
    cohort: string;
    enrolledAt: string;
    status: string;
    progress: number;
    completedActivities: number;
    totalActivities: number;
}> = {
    "enr-1": {
        id: "enr-1",
        learnerName: "Andi Wijaya",
        email: "andi.wijaya@email.com",
        phone: "+62 812 3456 7890",
        organization: "PT Example Company",
        program: "Mediator Certification",
        cohort: "Batch 2026-A",
        enrolledAt: "Dec 1, 2025",
        status: "active",
        progress: 65,
        completedActivities: 13,
        totalActivities: 20,
    }
};

const statusConfig: Record<string, { label: string; class: string }> = {
    active: { label: "Active", class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    pending: { label: "Pending", class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    completed: { label: "Completed", class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    dropped: { label: "Dropped", class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function EnrollmentDetailPage() {
    const params = useParams();
    const enrollmentId = params.id as string;
    const enrollment = mockEnrollments[enrollmentId] || mockEnrollments["enr-1"];
    const status = statusConfig[enrollment.status];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/enrollments"
                        className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-red-500/50 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold tracking-tight">{enrollment.learnerName}</h1>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.class}`}>
                                {status.label}
                            </span>
                        </div>
                        <p className="text-gray-500">{enrollment.email}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-sm hover:border-red-500/50 transition-all flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reset Progress
                    </button>
                    <button className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2">
                        <UserX className="h-4 w-4" />
                        Drop Enrollment
                    </button>
                </div>
            </div>

            {/* Progress Card */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Progress</h2>
                    <span className="text-2xl font-extrabold">{enrollment.progress}%</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-3">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${enrollment.progress}%` }} />
                </div>
                <p className="text-sm text-gray-500">
                    {enrollment.completedActivities} of {enrollment.totalActivities} activities completed
                </p>
            </div>

            {/* Info Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Program</p>
                            <p className="font-bold">{enrollment.program}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Cohort</p>
                            <p className="font-bold">{enrollment.cohort}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <Phone className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-bold">{enrollment.phone}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Building className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Organization</p>
                            <p className="font-bold">{enrollment.organization}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                <h2 className="text-xl font-bold">Edit Enrollment</h2>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Status</label>
                        <select
                            defaultValue={enrollment.status}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                        >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="dropped">Dropped</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Cohort</label>
                        <select
                            defaultValue={enrollment.cohort}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                        >
                            <option value="Batch 2026-A">Batch 2026-A</option>
                            <option value="Batch 2026-B">Batch 2026-B</option>
                            <option value="Batch 2025-D">Batch 2025-D</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold">Notes</label>
                    <textarea
                        rows={3}
                        placeholder="Add internal notes about this enrollment..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all resize-none"
                    />
                </div>

                <button className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20">
                    <Save className="h-4 w-4" />
                    Save Changes
                </button>
            </div>
        </div>
    );
}
