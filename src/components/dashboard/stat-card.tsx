import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: LucideIcon;
    trend?: {
        value: number;
        positive: boolean;
    };
    className?: string;
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
}: StatCardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 transition-all hover:shadow-lg hover:-translate-y-0.5",
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-3xl font-extrabold tracking-tight">{value}</p>
                    {description && (
                        <p className="text-xs text-gray-400">{description}</p>
                    )}
                    {trend && (
                        <p
                            className={cn(
                                "text-xs font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
                                trend.positive
                                    ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                                    : "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                            )}
                        >
                            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="rounded-xl bg-primary/10 p-3.5">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                )}
            </div>
        </div>
    );
}
