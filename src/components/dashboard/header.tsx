"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, User, LogOut, Settings, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/context/user-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
    onMenuClick?: () => void;
    sidebarCollapsed?: boolean;
    title?: string;
}

export function Header({ onMenuClick, sidebarCollapsed = false, title = "Dashboard" }: HeaderProps) {
    const router = useRouter();
    const { user, logout } = useUser();
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const getRoleLabel = (role?: string) => {
        switch (role) {
            case 'admin': return 'Administrator';
            case 'instructor': return 'Instructor';
            case 'manager': return 'Manager';
            case 'finance': return 'Finance';
            default: return 'Learner';
        }
    };

    return (
        <header
            className={cn(
                "fixed top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300",
                "glass-nav",
                sidebarCollapsed ? "left-16" : "left-64",
                "right-0 px-6"
            )}
        >
            {/* Left Side */}
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-all"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Page title */}
                <div className="hidden lg:block">
                    <h1 className="text-lg font-bold tracking-tight">{title}</h1>
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800/50 rounded-lg px-3 py-2 gap-2 border border-transparent focus-within:border-primary/30 transition-all">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none focus:ring-0 text-sm w-32 lg:w-48 placeholder:text-gray-400 p-0 outline-none"
                    />
                </div>

                {/* Notifications */}
                <button className="relative h-10 w-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-all">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                </button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20"><User className="h-4 w-4" /></div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold">{user?.name || 'Guest'}</p>
                            <p className="text-xs text-gray-400">{getRoleLabel(user?.role)}</p>
                        </div>
                    </button>

                    {dropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setDropdownOpen(false)}
                            />
                            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-2 shadow-xl">
                                <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                                    <p className="font-bold text-sm">{user?.name || 'Guest'}</p>
                                    <p className="text-xs text-gray-400">{user?.email || 'Not logged in'}</p>
                                </div>
                                <Link
                                    href="/dashboard/settings"
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <Settings className="h-4 w-4 text-gray-400" />
                                    Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
