import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight, Clock, MapPin, Wifi, Shuffle } from "lucide-react";

interface ActionCardProps {
    id: string;
    title: string;
    program: string;
    dueDate?: string;
    status: "pending" | "in-progress" | "overdue";
    type: string;
    modality?: "LURING" | "DARING" | "HYBRID";
    className?: string;
}

const statusStyles = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "in-progress": "bg-primary/10 text-primary",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels = {
    pending: "Pending",
    "in-progress": "In Progress",
    overdue: "Overdue",
};

const modalityConfig = {
    LURING: { label: "Luring", icon: MapPin, class: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
    DARING: { label: "Daring", icon: Wifi, class: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
    HYBRID: { label: "Hybrid", icon: Shuffle, class: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
};

export function ActionCard({
    id,
    title,
    program,
    dueDate,
    status,
    type,
    modality,
    className,
}: ActionCardProps) {
    const ModalityIcon = modality ? modalityConfig[modality].icon : null;

    return (
        <Link
            href={`/dashboard/activity/${id}`}
            className={cn(
                "group flex items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5",
                className
            )}
        >
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold",
                            statusStyles[status]
                        )}
                    >
                        {statusLabels[status]}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{type}</span>
                    {modality && ModalityIcon && (
                        <span className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                            modalityConfig[modality].class
                        )}>
                            <ModalityIcon className="h-3 w-3" />
                            {modalityConfig[modality].label}
                        </span>
                    )}
                </div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{program}</p>
                {dueDate && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Due: {dueDate}</span>
                    </div>
                )}
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shrink-0 ml-4">
                <ChevronRight className="h-5 w-5" />
            </div>
        </Link>
    );
}
