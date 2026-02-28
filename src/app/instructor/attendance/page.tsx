"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses, fetchAttendances } from "@/lib/api";
import {
    Calendar,
    Check,
    X,
    Users,
    Clock,
    Search,
    MapPin,
    Loader2,
} from "lucide-react";

export default function InstructorAttendancePage() {
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: coursesData, isLoading: coursesLoading } = useQuery({
        queryKey: ["courses"],
        queryFn: () => fetchCourses(),
    });

    // Note: For instructor view, we fetch attendances without lessonId filter
    // to show all records (instructor/admin role allows this)
    const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
        queryKey: ["attendances-all"],
        queryFn: () => fetchAttendances(),
    });

    const courses = coursesData?.courses ?? [];
    const allAttendances = attendanceData?.attendances ?? [];

    // Group attendances by date
    const groupedByDate = allAttendances.reduce<Record<string, typeof allAttendances>>((acc, att) => {
        const date = new Date(att.checkedAt).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(att);
        return acc;
    }, {});

    const isLoading = coursesLoading || attendanceLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Kehadiran Peserta</h1>
                    <p className="text-gray-500 mt-1">Monitor kehadiran peserta di semua sesi</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari peserta..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm focus:ring-2 focus:ring-primary w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{allAttendances.length}</p>
                            <p className="text-xs text-gray-500">Total Check-in</p>
                        </div>
                    </div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {new Set(allAttendances.map((a) => a.userId)).size}
                            </p>
                            <p className="text-xs text-gray-500">Peserta Unik</p>
                        </div>
                    </div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {allAttendances.filter((a) => a.latitude).length}
                            </p>
                            <p className="text-xs text-gray-500">Dengan GPS</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Records by Date */}
            {Object.keys(groupedByDate).length === 0 ? (
                <div className="text-center py-12 text-gray-500 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>Belum ada data kehadiran.</p>
                </div>
            ) : (
                Object.entries(groupedByDate).map(([date, records]) => {
                    const filtered = searchQuery
                        ? records.filter(
                            (r) =>
                                r.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                r.lesson?.title?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        : records;

                    if (filtered.length === 0) return null;

                    return (
                        <div key={date} className="space-y-3">
                            <h3 className="font-bold text-sm text-gray-500 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {date}
                            </h3>
                            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500">
                                            <th className="p-4 font-semibold">Peserta</th>
                                            <th className="p-4 font-semibold">Sesi</th>
                                            <th className="p-4 font-semibold">Waktu</th>
                                            <th className="p-4 font-semibold">GPS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((r) => (
                                            <tr key={r.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Check className="h-4 w-4 text-green-500" />
                                                        <span className="font-medium">{r.user?.fullName ?? "-"}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-500">{r.lesson?.title ?? "-"}</td>
                                                <td className="p-4 text-gray-500 flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {new Date(r.checkedAt).toLocaleTimeString("id-ID", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </td>
                                                <td className="p-4">
                                                    {r.latitude ? (
                                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" /> ✓
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">
                                                            <X className="h-3.5 w-3.5" />
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
