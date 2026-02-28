"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminEnrollments, fetchAdminCourses, fetchUsers, createAdminEnrollment } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Users, BookOpen, Loader2, Plus, CheckCircle, Clock, Search } from "lucide-react";

export default function AdminEnrollmentsPage() {
    const toast = useToast();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [search, setSearch] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-enrollments"],
        queryFn: fetchAdminEnrollments,
    });

    const { data: coursesData } = useQuery({
        queryKey: ["admin-courses"],
        queryFn: fetchAdminCourses,
        enabled: showForm,
    });

    const { data: usersData } = useQuery({
        queryKey: ["admin-users"],
        queryFn: fetchUsers,
        enabled: showForm,
    });

    const enrollments = data?.enrollments ?? [];
    const filtered = search ? enrollments.filter(e => e.user.fullName.toLowerCase().includes(search.toLowerCase()) || e.course.title.toLowerCase().includes(search.toLowerCase())) : enrollments;

    const enrollMutation = useMutation({
        mutationFn: () => createAdminEnrollment({ userId: selectedUserId, courseId: selectedCourseId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
            toast.success("Peserta berhasil didaftarkan ✅");
            setSelectedUserId(""); setSelectedCourseId(""); setShowForm(false);
        },
        onError: (err) => toast.error(err.message),
    });

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    const active = enrollments.filter(e => e.status === "ACTIVE").length;
    const completed = enrollments.filter(e => e.status === "COMPLETED").length;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Enrollments</h1>
                    <p className="text-gray-500 mt-1">{enrollments.length} enrollment total</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-90">
                    <Plus className="h-4 w-4" /> Daftarkan Peserta
                </button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Users className="h-5 w-5 text-blue-500" /></div><div><p className="text-2xl font-bold">{enrollments.length}</p><p className="text-xs text-gray-500">Total</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Clock className="h-5 w-5 text-amber-500" /></div><div><p className="text-2xl font-bold">{active}</p><p className="text-xs text-gray-500">Aktif</p></div></div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-500" /></div><div><p className="text-2xl font-bold">{completed}</p><p className="text-xs text-gray-500">Selesai</p></div></div>
                </div>
            </div>

            {showForm && (
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-4">
                    <h2 className="font-bold">Daftarkan Peserta Baru</h2>
                    <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                        <option value="">-- Pilih Peserta --</option>
                        {usersData?.users?.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
                    </select>
                    <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                        <option value="">-- Pilih Program --</option>
                        {coursesData?.courses?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <button onClick={() => enrollMutation.mutate()} disabled={!selectedUserId || !selectedCourseId || enrollMutation.isPending} className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm disabled:opacity-50">
                        {enrollMutation.isPending ? "Mendaftarkan..." : "Daftarkan"}
                    </button>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Cari peserta atau program..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm" />
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500"><th className="p-4 font-semibold">Peserta</th><th className="p-4 font-semibold">Program</th><th className="p-4 font-semibold">Progress</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold">Tanggal</th></tr></thead>
                    <tbody>
                        {filtered.map(e => (
                            <tr key={e.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                                <td className="p-4"><div><p className="font-medium">{e.user.fullName}</p><p className="text-xs text-gray-500">{e.user.email}</p></div></td>
                                <td className="p-4 text-gray-500">{e.course.title}</td>
                                <td className="p-4"><div className="flex items-center gap-2"><div className="w-20 h-2 rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-primary" style={{ width: `${e.completionPercentage}%` }} /></div><span className="text-xs">{e.completionPercentage}%</span></div></td>
                                <td className="p-4">{e.status === "COMPLETED" ? <span className="text-xs text-green-600 font-semibold">Selesai</span> : <span className="text-xs text-amber-600 font-semibold">Aktif</span>}</td>
                                <td className="p-4 text-xs text-gray-500">{new Date(e.enrolledAt).toLocaleDateString("id-ID")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
