"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    Layers,
    UserPlus,
    FileText,
    ChevronLeft,
    ChevronRight,
    Settings,
} from "lucide-react";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Programs", href: "/admin/programs", icon: BookOpen },
    { name: "Activities", href: "/admin/activities", icon: Layers },
    { name: "Enrollments", href: "/admin/enrollments", icon: UserPlus },
    { name: "Audit Log", href: "/admin/audit", icon: FileText },
];

interface AdminSidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
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
                    <Link href="/admin" className="flex items-center gap-3 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-white text-xl">balance</span>
                        </div>
                        <div>
                            <p className="font-bold text-sm">Renjana</p>
                            <p className="text-xs text-red-500 font-semibold">Admin Control</p>
                        </div>
                    </Link>
                )}
                <button
                    onClick={onToggle}
                    className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-all",
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
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/admin" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-red-500",
                                collapsed && "justify-center px-2"
                            )}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer - Quick Links */}
            <div className="border-t border-gray-200/50 dark:border-gray-800/50 p-3 space-y-2">
                <a
                    href="/instructor"
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600 transition-all",
                        collapsed && "justify-center px-2"
                    )}
                >
                    <Settings className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Instructor View</span>}
                </a>
                <a
                    href="/dashboard"
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:text-blue-600 transition-all",
                        collapsed && "justify-center px-2"
                    )}
                >
                    <UserPlus className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Learner View</span>}
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
