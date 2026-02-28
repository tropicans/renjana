"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminCourses } from "@/lib/api";
import { Loader2, Tag, BookOpen } from "lucide-react";

export default function PricingPage() {
    const { data, isLoading } = useQuery({ queryKey: ["admin-courses"], queryFn: fetchAdminCourses });
    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    const courses = data?.courses ?? [];

    return (
        <div className="space-y-8">
            <div><h1 className="text-3xl font-extrabold tracking-tight">Pricing</h1><p className="text-gray-500 mt-1">Harga per program pelatihan</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
                {courses.map(c => (
                    <div key={c.id} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><BookOpen className="h-5 w-5 text-primary" /></div>
                            <div className="flex-1"><h3 className="font-bold">{c.title}</h3><p className="text-xs text-gray-500 mt-1">{c._count.modules} modul · {c._count.enrollments} peserta</p></div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-xs text-gray-500"><Tag className="h-3.5 w-3.5" /> {c.status}</span>
                            <span className="text-xl font-bold text-green-600">Rp 2.500.000</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
