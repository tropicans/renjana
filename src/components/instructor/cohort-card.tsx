import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Users, TrendingUp, AlertTriangle, ChevronRight } from "lucide-react";

interface CohortCardProps {
    id: string;
    name: string;
    program: string;
    totalLearners: number;
    completionRate: number;
    atRiskCount: number;
    className?: string;
}

export function CohortCard({
    id,
    name,
    program,
    totalLearners,
    completionRate,
    atRiskCount,
    className,
}: CohortCardProps) {
    return (
        <Link
            href={`/instructor/learners?cohort=${id}`}
            className={cn(
                "group block rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:-translate-y-0.5",
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h3 className="font-bold text-lg group-hover:text-emerald-500 transition-colors">
                        {name}
                    </h3>
                    <p className="text-sm text-gray-500">{program}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <ChevronRight className="h-4 w-4" />
                </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <Users className="h-4 w-4" />
                        <span className="text-xs font-medium">Learners</span>
                    </div>
                    <p className="text-xl font-bold">{totalLearners}</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">Progress</span>
                    </div>
                    <p className="text-xl font-bold">{completionRate}%</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-medium">At Risk</span>
                    </div>
                    <p
                        className={cn(
                            "text-xl font-bold",
                            atRiskCount > 0 ? "text-red-500" : "text-green-500"
                        )}
                    >
                        {atRiskCount}
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all rounded-full"
                        style={{ width: `${completionRate}%` }}
                    />
                </div>
            </div>
        </Link>
    );
}
