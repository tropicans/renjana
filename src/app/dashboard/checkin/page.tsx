"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAttendances, fetchMyEnrollments, checkIn } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
    ArrowLeft,
    MapPin,
    CheckCircle,
    AlertCircle,
    Navigation,
    Loader2,
    Clock,
} from "lucide-react";

export default function CheckInPage() {
    const toast = useToast();
    const queryClient = useQueryClient();
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

    // Get enrollments to show available courses/lessons
    const { data: enrollmentData } = useQuery({
        queryKey: ["my-enrollments"],
        queryFn: fetchMyEnrollments,
    });

    // Get past attendance records
    const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
        queryKey: ["my-attendances"],
        queryFn: () => fetchAttendances(),
    });

    const attendances = attendanceData?.attendances ?? [];

    const handleGetLocation = () => {
        setGettingLocation(true);
        setLocationError(null);
        if (!navigator.geolocation) {
            setLocationError("Geolocation tidak didukung di browser ini.");
            setGettingLocation(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGettingLocation(false);
            },
            (err) => {
                setLocationError(`Gagal mendapatkan lokasi: ${err.message}`);
                setGettingLocation(false);
            }
        );
    };

    const checkInMutation = useMutation({
        mutationFn: () =>
            checkIn({
                lessonId: selectedLessonId!,
                latitude: location?.lat,
                longitude: location?.lng,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-attendances"] });
            toast.success("Check-in berhasil! ✅");
            setSelectedLessonId(null);
            setLocation(null);
        },
        onError: (err) => {
            toast.error(err.message || "Check-in gagal.");
        },
    });

    return (
        <div className="space-y-8">
            <div>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 mb-4">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Link>
                <h1 className="text-3xl font-extrabold tracking-tight">Check-In Kehadiran</h1>
                <p className="text-gray-500 mt-1">Catat kehadiran Anda di sesi pembelajaran</p>
            </div>

            {/* Check-in Form */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-8 space-y-6">
                <h2 className="text-xl font-bold">Lakukan Check-In</h2>

                {/* Step 1: Select Lesson */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Pilih Sesi / Lesson</label>
                    <select
                        value={selectedLessonId ?? ""}
                        onChange={(e) => setSelectedLessonId(e.target.value || null)}
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    >
                        <option value="">-- Pilih sesi --</option>
                        {enrollmentData?.enrollments?.filter(e => e.status === "ACTIVE").map((e) => (
                            <option key={e.id} value={e.courseId}>
                                {e.course.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Step 2: GPS */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Lokasi GPS (opsional)</label>
                    {location ? (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-sm">
                                Lokasi: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </span>
                        </div>
                    ) : locationError ? (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-sm">{locationError}</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleGetLocation}
                            disabled={gettingLocation}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                        >
                            {gettingLocation ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Navigation className="h-4 w-4" />
                            )}
                            {gettingLocation ? "Mendapatkan lokasi..." : "Aktifkan GPS"}
                        </button>
                    )}
                </div>

                {/* Step 3: Submit */}
                <button
                    onClick={() => checkInMutation.mutate()}
                    disabled={!selectedLessonId || checkInMutation.isPending}
                    className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {checkInMutation.isPending ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-5 w-5" />
                            Check-In Sekarang
                        </>
                    )}
                </button>
            </div>

            {/* Attendance History */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Riwayat Kehadiran</h2>
                {attendanceLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : attendances.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Belum ada riwayat kehadiran.
                    </div>
                ) : (
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                        {attendances.map((a, i) => (
                            <div
                                key={a.id}
                                className={`flex items-center justify-between p-5 ${i !== attendances.length - 1
                                        ? "border-b border-gray-100 dark:border-gray-800"
                                        : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                    <div>
                                        <p className="font-semibold">{a.lesson?.title ?? "Sesi"}</p>
                                        <p className="text-xs text-gray-500">
                                            {a.lesson?.module?.course?.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Clock className="h-3.5 w-3.5" />
                                        {new Date(a.checkedAt).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                    {a.latitude && (
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            GPS ✓
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
