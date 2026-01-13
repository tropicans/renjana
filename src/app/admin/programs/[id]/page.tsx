"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Users, Calendar, Clock, BookOpen } from "lucide-react";
import { useParams } from "next/navigation";

// Mock program data
const mockPrograms: Record<string, {
    id: string;
    name: string;
    category: string;
    description: string;
    duration: string;
    price: number;
    maxParticipants: number;
    enrolled: number;
    status: string;
    modules: { title: string; description: string }[];
}> = {
    "prog-1": {
        id: "prog-1",
        name: "Mediator Certification Program",
        category: "Certification",
        description: "Comprehensive 12-week program designed to prepare participants for professional mediation practice. Covers all aspects of mediation theory and practice.",
        duration: "12 weeks",
        price: 8500000,
        maxParticipants: 50,
        enrolled: 45,
        status: "active",
        modules: [
            { title: "Module 1: Introduction to Mediation", description: "Fundamentals of mediation theory and principles" },
            { title: "Module 2: Legal Framework", description: "Understanding the legal context of mediation" },
            { title: "Module 3: Communication Skills", description: "Essential communication techniques for mediators" },
            { title: "Module 4: Conflict Analysis", description: "Methods for analyzing and understanding conflicts" },
            { title: "Module 5: Practical Sessions", description: "Hands-on mediation practice with feedback" },
        ]
    }
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

export default function ProgramDetailPage() {
    const params = useParams();
    const programId = params.id as string;
    const program = mockPrograms[programId] || mockPrograms["prog-1"];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/programs"
                        className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-red-500/50 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold tracking-tight">{program.name}</h1>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${program.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"}`}>
                                {program.status}
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{program.category}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-sm hover:border-red-500/50 transition-all flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                    </button>
                    <button className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Enrolled</p>
                            <p className="text-2xl font-extrabold">{program.enrolled}/{program.maxParticipants}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="text-2xl font-extrabold">{program.duration}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Modules</p>
                            <p className="text-2xl font-extrabold">{program.modules.length}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="text-xl font-extrabold">{formatCurrency(program.price)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{program.description}</p>
            </div>

            {/* Modules */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6">
                <h2 className="text-xl font-bold mb-4">Modules</h2>
                <div className="space-y-3">
                    {program.modules.map((module, index) => (
                        <div key={index} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:border-red-500/50 transition-all">
                            <h3 className="font-bold">{module.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
