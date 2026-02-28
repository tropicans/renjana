"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyEnrollments, fetchCertificate } from "@/lib/api";
import {
    Award,
    Download,
    Loader2,
    BookOpen,
    CheckCircle,
    Clock,
} from "lucide-react";

function CertificateCard({ enrollment }: { enrollment: { id: string; courseId: string; course: { title: string }; status: string; completionPercentage: number } }) {
    const isCompleted = enrollment.status === "COMPLETED";

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ["certificate", enrollment.id],
        queryFn: () => fetchCertificate(enrollment.id),
        enabled: false, // only fetch on demand
    });

    const handleGenerate = () => {
        refetch();
    };

    const certificate = data?.certificate;

    return (
        <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
            <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? "bg-green-500/10" : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                    {isCompleted ? (
                        <Award className="h-6 w-6 text-green-500" />
                    ) : (
                        <Clock className="h-6 w-6 text-gray-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{enrollment.course.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {isCompleted ? (
                            <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> Selesai
                            </span>
                        ) : (
                            `Progress: ${enrollment.completionPercentage}%`
                        )}
                    </p>

                    {isCompleted && (
                        <div className="mt-4">
                            {certificate?.pdfUrl ? (
                                <a
                                    href={certificate.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-all"
                                >
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </a>
                            ) : (
                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading || isFetching}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {isLoading || isFetching ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Award className="h-4 w-4" />
                                            Generate Sertifikat
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function CertificatesPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["my-enrollments"],
        queryFn: fetchMyEnrollments,
    });

    const enrollments = data?.enrollments ?? [];
    const completed = enrollments.filter((e) => e.status === "COMPLETED");
    const inProgress = enrollments.filter((e) => e.status === "ACTIVE");

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Sertifikat Saya</h1>
                <p className="text-gray-500 mt-1">Download sertifikat untuk course yang telah Anda selesaikan</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Award className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{completed.length}</p>
                            <p className="text-xs text-gray-500">Sertifikat Tersedia</p>
                        </div>
                    </div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{inProgress.length}</p>
                            <p className="text-xs text-gray-500">Sedang Berlangsung</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Completed Courses */}
            {completed.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-green-600 flex items-center gap-2">
                        <Award className="h-5 w-5" /> Siap Download
                    </h2>
                    <div className="grid gap-4">
                        {completed.map((e) => (
                            <CertificateCard key={e.id} enrollment={e} />
                        ))}
                    </div>
                </div>
            )}

            {/* In Progress */}
            {inProgress.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-500 flex items-center gap-2">
                        <Clock className="h-5 w-5" /> Sedang Berlangsung
                    </h2>
                    <div className="grid gap-4">
                        {inProgress.map((e) => (
                            <CertificateCard key={e.id} enrollment={e} />
                        ))}
                    </div>
                </div>
            )}

            {enrollments.length === 0 && (
                <div className="text-center py-12 text-gray-500 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>Belum ada course yang diikuti.</p>
                </div>
            )}
        </div>
    );
}
