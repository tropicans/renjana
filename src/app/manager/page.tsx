import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users, Target, AlertTriangle, TrendingUp, ArrowRight, Download } from "lucide-react";

// Mock data
const mockStats = {
    totalEmployees: 248,
    avgSkillCoverage: 72,
    atRiskEmployees: 18,
    trainingROI: 156,
};

const mockDepartments = [
    { name: "Legal", employees: 45, skillCoverage: 85, atRisk: 2 },
    { name: "Operations", employees: 78, skillCoverage: 68, atRisk: 8 },
    { name: "Finance", employees: 32, skillCoverage: 75, atRisk: 3 },
    { name: "HR", employees: 25, skillCoverage: 82, atRisk: 1 },
    { name: "IT", employees: 68, skillCoverage: 62, atRisk: 4 },
];

export default function ManagerDashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">HR Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Monitor workforce skill development and training effectiveness</p>
                </div>
                <button className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-orange-500/50 transition-all flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Employees" value={mockStats.totalEmployees} icon={Users} description="In training programs" />
                <StatCard title="Avg. Skill Coverage" value={`${mockStats.avgSkillCoverage}%`} icon={Target} trend={{ value: 5, positive: true }} />
                <StatCard title="At-Risk Employees" value={mockStats.atRiskEmployees} icon={AlertTriangle} description="Need attention" />
                <StatCard title="Training ROI" value={`${mockStats.trainingROI}%`} icon={TrendingUp} trend={{ value: 12, positive: true }} />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Link href="/manager/skills" className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-orange-500/50 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                        <Target className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors">Skill Coverage</h3>
                    <p className="text-sm text-gray-500 mt-1">View skill gaps across departments</p>
                </Link>
                <Link href="/manager/risks" className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-orange-500/50 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-orange-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors">Risk Heatmap</h3>
                    <p className="text-sm text-gray-500 mt-1">Identify high-risk areas</p>
                </Link>
                <Link href="/manager/impact" className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-orange-500/50 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                        <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors">Training Impact</h3>
                    <p className="text-sm text-gray-500 mt-1">Measure training effectiveness</p>
                </Link>
            </div>

            {/* Department Overview */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Department Overview</h2>
                    <Link href="/manager/skills" className="text-orange-500 font-semibold hover:underline flex items-center gap-1">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <th className="text-left p-5 font-bold text-sm">Department</th>
                                <th className="text-center p-5 font-bold text-sm">Employees</th>
                                <th className="text-center p-5 font-bold text-sm">Skill Coverage</th>
                                <th className="text-center p-5 font-bold text-sm">At Risk</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockDepartments.map((dept, index) => (
                                <tr key={dept.name} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all ${index !== mockDepartments.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                                    <td className="p-5 font-semibold">{dept.name}</td>
                                    <td className="p-5 text-center">{dept.employees}</td>
                                    <td className="p-5">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${dept.skillCoverage}%` }} />
                                            </div>
                                            <span className="text-sm font-semibold">{dept.skillCoverage}%</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${dept.atRisk > 5 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                                            {dept.atRisk}
                                        </span>
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
