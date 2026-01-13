"use client";

import React from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    MoreVertical,
    BookOpen,
    Users,
    Calendar,
    Edit,
    Trash2,
    Copy,
} from "lucide-react";

// Mock data
const mockPrograms = [
    {
        id: "prog-1",
        name: "Mediator Certification Program",
        description: "Complete certification program for professional mediators",
        status: "published",
        activitiesCount: 24,
        enrolledCount: 89,
        createdAt: "Nov 15, 2025",
    },
    {
        id: "prog-2",
        name: "Advanced Mediation Skills",
        description: "Advanced techniques for experienced mediators",
        status: "published",
        activitiesCount: 18,
        enrolledCount: 45,
        createdAt: "Dec 1, 2025",
    },
    {
        id: "prog-3",
        name: "Legal Framework Fundamentals",
        description: "Understanding legal aspects of dispute resolution",
        status: "draft",
        activitiesCount: 12,
        enrolledCount: 0,
        createdAt: "Jan 2, 2026",
    },
];

const statusStyles = {
    published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    archived: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export default function ProgramsPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [menuOpen, setMenuOpen] = React.useState<string | null>(null);

    const filteredPrograms = mockPrograms.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Programs</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Create and manage learning programs
                    </p>
                </div>
                <Link
                    href="/admin/programs/new"
                    className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                >
                    <Plus className="h-4 w-4" />
                    New Program
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search programs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] focus:border-red-500 outline-none transition-all"
                />
            </div>

            {/* Programs Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPrograms.map((program) => (
                    <div
                        key={program.id}
                        className="relative rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-4 hover:border-red-500/50 transition-all"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <span
                                    className={`inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[program.status as keyof typeof statusStyles]}`}
                                >
                                    {program.status}
                                </span>
                                <h3 className="font-bold text-lg">{program.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {program.description}
                                </p>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setMenuOpen(menuOpen === program.id ? null : program.id)}
                                    className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                                {menuOpen === program.id && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setMenuOpen(null)}
                                        />
                                        <div className="absolute right-0 top-full z-50 w-40 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] p-2 shadow-xl">
                                            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </button>
                                            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                                                <Copy className="h-4 w-4" />
                                                Duplicate
                                            </button>
                                            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4" />
                                <span>{program.activitiesCount} activities</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                <span>{program.enrolledCount} enrolled</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{program.createdAt}</span>
                            </div>
                            <Link
                                href={`/admin/programs/${program.id}`}
                                className="text-red-500 font-semibold text-sm hover:underline"
                            >
                                Manage →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* New Program Card */}
            <Link
                href="/admin/programs/new"
                className="flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-10 transition-all hover:border-red-500 hover:bg-red-500/5"
            >
                <div className="text-center">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                        <Plus className="h-7 w-7 text-red-500" />
                    </div>
                    <p className="font-bold text-lg">Create New Program</p>
                    <p className="text-sm text-gray-500">
                        Build a new learning program from scratch
                    </p>
                </div>
            </Link>
        </div>
    );
}
