"use client";

import React, { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary/50 transition-all hover:scale-105",
                className
            )}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
            {theme === "light" ? (
                <Moon className="h-4 w-4 text-gray-600" />
            ) : (
                <Sun className="h-4 w-4 text-yellow-400" />
            )}
        </button>
    );
}
