"use client";

import React from "react";
import { Search, Download } from "lucide-react";

// Mock skills data
const mockSkills = [
    { name: "Mediation Basics", category: "Core", coverage: 92, employees: 228 },
    { name: "Legal Framework", category: "Core", coverage: 78, employees: 194 },
    { name: "Negotiation", category: "Advanced", coverage: 65, employees: 161 },
    { name: "Conflict Resolution", category: "Advanced", coverage: 58, employees: 144 },
    { name: "Ethics & Compliance", category: "Core", coverage: 85, employees: 211 },
    { name: "Communication", category: "Soft Skills", coverage: 72, employees: 179 },
    { name: "Documentation", category: "Technical", coverage: 68, employees: 169 },
    { name: "Case Management", category: "Technical", coverage: 45, employees: 112 },
];

const mockEmployeeSkills = [
    { name: "Andi Wijaya", department: "Legal", skills: ["Mediation Basics", "Legal Framework", "Ethics"], coverage: 85 },
    { name: "Budi Santoso", department: "Operations", skills: ["Mediation Basics", "Communication"], coverage: 55 },
    { name: "Citra Dewi", department: "HR", skills: ["Mediation Basics", "Legal Framework", "Negotiation", "Ethics"], coverage: 95 },
    { name: "Dian Pratama", department: "Finance", skills: ["Legal Framework", "Documentation"], coverage: 60 },
];

export default function SkillsCoveragePage() {
    const [view, setView] = React.useState<"skills" | "employees">("skills");

    const getCoverageColor = (coverage: number) => {
        if (coverage >= 80) return "text-green-500";
        if (coverage >= 60) return "text-amber-500";
        return "text-red-500";
    };

    const getCoverageBg = (coverage: number) => {
        if (coverage >= 80) return "bg-green-500";
        if (coverage >= 60) return "bg-amber-500";
        return "bg-red-500";
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Skill Coverage</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track skill development across your organization</p>
                </div>
                <button className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-orange-500/50 transition-all flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                </button>
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
                <button
                    onClick={() => setView("skills")}
                    className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${view === "skills"
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                            : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-orange-500/50"
                        }`}
                >
                    By Skill
                </button>
                <button
                    onClick={() => setView("employees")}
                    className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${view === "employees"
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                            : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-orange-500/50"
                        }`}
                >
                    By Employee
                </button>
            </div>

            {view === "skills" ? (
                <div className="space-y-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search skills..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] focus:border-orange-500 outline-none transition-all"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {mockSkills.map((skill) => (
                            <div key={skill.name} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-4 hover:border-orange-500/50 transition-all">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-lg">{skill.name}</h3>
                                        <span className="text-xs text-gray-400">{skill.category}</span>
                                    </div>
                                    <span className={`text-3xl font-extrabold ${getCoverageColor(skill.coverage)}`}>{skill.coverage}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                    <div className={`h-full rounded-full ${getCoverageBg(skill.coverage)}`} style={{ width: `${skill.coverage}%` }} />
                                </div>
                                <p className="text-sm text-gray-400">{skill.employees} employees trained</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] focus:border-orange-500 outline-none transition-all"
                        />
                    </div>

                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                        {mockEmployeeSkills.map((employee, index) => (
                            <div key={employee.name} className={`p-5 flex items-center justify-between ${index !== mockEmployeeSkills.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center font-bold text-orange-500">
                                            {employee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{employee.name}</p>
                                            <p className="text-xs text-gray-400">{employee.department}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {employee.skills.map((skill) => (
                                            <span key={skill} className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-extrabold ${getCoverageColor(employee.coverage)}`}>{employee.coverage}%</p>
                                    <p className="text-xs text-gray-400">Coverage</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
