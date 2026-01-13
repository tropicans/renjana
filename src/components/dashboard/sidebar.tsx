"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import {
    Home,
    ListTodo,
    FileCheck,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    Settings,
} from "lucide-react";

const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Action Queue", href: "/dashboard/actions", icon: ListTodo },
    { name: "Evidence", href: "/dashboard/evidence", icon: FileCheck },
    { name: "Feedback", href: "/dashboard/feedback", icon: MessageSquare },
];

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
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
                    <Logo size="sm" showTagline={true} />
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
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-primary",
                                collapsed && "justify-center px-2"
                            )}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="border-t border-gray-200/50 dark:border-gray-800/50 p-3">
                <Link
                    href="/dashboard/settings"
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-primary transition-all",
                        collapsed && "justify-center px-2"
                    )}
                >
                    <Settings className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Settings</span>}
                </Link>
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
