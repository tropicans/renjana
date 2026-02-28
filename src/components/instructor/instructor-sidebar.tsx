"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    ClipboardCheck,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/instructor", icon: LayoutDashboard },
    { name: "Learners", href: "/instructor/learners", icon: Users },
    { name: "Feedback", href: "/instructor/feedback", icon: MessageSquare },
    { name: "Attendance", href: "/instructor/attendance", icon: ClipboardCheck },
];

interface InstructorSidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export function InstructorSidebar({ collapsed = false, onToggle }: InstructorSidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-[#0a0f14] transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50 px-4">
                {!collapsed && (
                    <Link href="/instructor" className="flex items-center gap-3 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-white text-xl">balance</span>
                        </div>
                        <div>
                            <p className="font-bold text-sm">Renjana</p>
                            <p className="text-xs text-emerald-500 font-semibold">Instructor</p>
                        </div>
                    </Link>
                )}
                <button
                    onClick={onToggle}
                    className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all",
                        collapsed && "mx-auto"
                    )}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/instructor" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-emerald-500",
                                collapsed && "justify-center px-2"
                            )}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer - Switch to Learner */}
            <div className="border-t border-gray-200/50 dark:border-gray-800/50 p-3">
                <a
                    href="/dashboard"
                    className={cn(
                        "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 hover:border-emerald-500/50 hover:text-emerald-600 transition-all",
                        collapsed && "px-2"
                    )}
                >
                    {collapsed ? (
                        <Users className="h-4 w-4" />
                    ) : (
                        "Switch to Learner View"
                    )}
                </a>
            </div>

            {/* Footer */}
            {!collapsed && (
                <div className="border-t border-gray-200/50 dark:border-gray-800/50 p-4">
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} Renjana
                    </p>
                </div>
            )}
        </aside>
    );
}
