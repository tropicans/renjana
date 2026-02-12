"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Save, Users } from "lucide-react";

// Mock data for programs and cohorts
const mockPrograms = [
    { id: "prog-1", name: "Mediator Certification Program" },
    { id: "prog-2", name: "Advanced Mediation Skills" },
    { id: "prog-3", name: "Legal Framework Fundamentals" },
];

const mockCohorts = [
    { id: "cohort-1", name: "Batch 2026-A", program: "prog-1" },
    { id: "cohort-2", name: "Batch 2026-B", program: "prog-1" },
    { id: "cohort-3", name: "Corporate PT ABC", program: "prog-3" },
];

export default function NewEnrollmentPage() {
    const [enrollmentType, setEnrollmentType] = React.useState<"individual" | "bulk">("individual");
    const [selectedProgram, setSelectedProgram] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Enrollment created successfully!");
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/enrollments"
                    className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-red-500/50 transition-all"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">New Enrollment</h1>
                    <p className="text-gray-500 dark:text-gray-400">Enroll learners into a program</p>
                </div>
            </div>

            {/* Enrollment Type Toggle */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setEnrollmentType("individual")}
                    className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${enrollmentType === "individual"
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-red-500/50"
                        }`}
                >
                    Individual
                </button>
                <button
                    type="button"
                    onClick={() => setEnrollmentType("bulk")}
                    className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${enrollmentType === "bulk"
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-red-500/50"
                        }`}
                >
                    <Users className="h-4 w-4 inline mr-2" />
                    Bulk Upload
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Program & Cohort Selection */}
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                    <h2 className="text-xl font-bold">Program & Cohort</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Program *</label>
                            <select
                                required
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            >
                                <option value="">Select program</option>
                                {mockPrograms.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Cohort *</label>
                            <select
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            >
                                <option value="">Select cohort</option>
                                {mockCohorts.filter(c => !selectedProgram || c.program === selectedProgram).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {enrollmentType === "individual" ? (
                    /* Individual Learner Form */
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                        <h2 className="text-xl font-bold">Learner Information</h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter learner name"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Email *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="learner@email.com"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Phone</label>
                                <input
                                    type="tel"
                                    placeholder="+62 812 xxxx xxxx"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Organization</label>
                                <input
                                    type="text"
                                    placeholder="Company name (optional)"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="sendInvite" defaultChecked className="w-4 h-4 rounded" />
                            <label htmlFor="sendInvite" className="text-sm">Send enrollment invitation email</label>
                        </div>
                    </div>
                ) : (
                    /* Bulk Upload Form */
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                        <h2 className="text-xl font-bold">Bulk Upload</h2>

                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center">
                            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 mb-4">Upload a CSV file with learner information</p>
                            <input type="file" accept=".csv" className="hidden" id="csvUpload" />
                            <label htmlFor="csvUpload" className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-all cursor-pointer inline-block">
                                Choose File
                            </label>
                            <p className="text-sm text-gray-400 mt-4">Required columns: name, email</p>
                        </div>

                        <a href="#" className="text-red-500 font-semibold text-sm hover:underline">
                            Download CSV template
                        </a>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                    <Link
                        href="/admin/enrollments"
                        className="flex-1 px-6 py-4 rounded-full border border-gray-200 dark:border-gray-700 font-bold text-center hover:border-red-500/50 transition-all"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex-1 bg-red-500 text-white px-6 py-4 rounded-full font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                    >
                        <Save className="h-5 w-5" />
                        Create Enrollment
                    </button>
                </div>
            </form>
        </div>
    );
}
