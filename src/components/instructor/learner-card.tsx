import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LearnerCardProps {
    id: string;
    name: string;
    email: string;
    cohort: string;
    progress: number;
    status: "on-track" | "at-risk" | "completed";
    lastActivity?: string;
    className?: string;
}

const statusConfig = {
    "on-track": {
        label: "On Track",
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        icon: TrendingUp,
    },
    "at-risk": {
        label: "At Risk",
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: TrendingDown,
    },
    completed: {
        label: "Completed",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        icon: Minus,
    },
};

export function LearnerCard({
    id,
    name,
    email,
    cohort,
    progress,
    status,
    lastActivity,
    className,
}: LearnerCardProps) {
    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <Link
            href={`/instructor/learners/${id}`}
            className={cn(
                "group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md",
                className
            )}
        >
            {/* Avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                {name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {name}
                    </h3>
                    <span
                        className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                            config.bg,
                            config.text
                        )}
                    >
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{email}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{cohort}</span>
                    {lastActivity && (
                        <>
                            <span>•</span>
                            <span>Last active: {lastActivity}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-lg font-bold">{progress}%</p>
                    <p className="text-xs text-muted-foreground">Progress</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </div>
        </Link>
    );
}
