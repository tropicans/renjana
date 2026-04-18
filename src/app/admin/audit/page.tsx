"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "@/lib/api";
import { Loader2, Shield, User, Clock } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
    CREATE: "Membuat data",
    UPDATE: "Memperbarui data",
    DELETE: "Menghapus data",
    ADD_LESSON_MATERIAL: "Menambahkan materi lesson",
    REPLACE_LESSON_MATERIAL: "Mengganti materi lesson",
    REMOVE_LESSON_MATERIAL: "Menghapus materi lesson",
    DELETE_COURSE_LESSON_MATERIALS: "Menghapus materi lesson saat pelatihan dihapus",
};

const ENTITY_LABELS: Record<string, string> = {
    COURSE: "Pelatihan",
    COURSE_LESSON: "Lesson Pelatihan",
    quiz: "Quiz",
    REGISTRATION: "Registrasi",
    PAYMENT: "Pembayaran",
};

function getActionLabel(action: string) {
    return ACTION_LABELS[action] ?? action.replaceAll("_", " ");
}

function getEntityLabel(entity: string) {
    return ENTITY_LABELS[entity] ?? entity;
}

function getAuditSummary(log: { action: string; metadata: Record<string, unknown> | null }) {
    const metadata = log.metadata || {};

    if (["ADD_LESSON_MATERIAL", "REPLACE_LESSON_MATERIAL", "REMOVE_LESSON_MATERIAL"].includes(log.action)) {
        const lessonTitle = typeof metadata.lessonTitle === "string" ? metadata.lessonTitle : "Lesson tanpa judul";
        const previousMaterial = typeof metadata.previousMaterial === "string" ? metadata.previousMaterial : null;
        const nextMaterial = typeof metadata.nextMaterial === "string" ? metadata.nextMaterial : null;

        if (log.action === "ADD_LESSON_MATERIAL") return `${lessonTitle}: materi baru ditambahkan${nextMaterial ? ` (${nextMaterial})` : ""}.`;
        if (log.action === "REPLACE_LESSON_MATERIAL") return `${lessonTitle}: materi diganti${previousMaterial ? ` dari ${previousMaterial}` : ""}${nextMaterial ? ` ke ${nextMaterial}` : ""}.`;
        return `${lessonTitle}: materi dihapus${previousMaterial ? ` (${previousMaterial})` : ""}.`;
    }

    if (log.action === "DELETE_COURSE_LESSON_MATERIALS") {
        const removedMaterials = Array.isArray(metadata.removedMaterials) ? metadata.removedMaterials : [];
        const courseTitle = typeof metadata.courseTitle === "string" ? metadata.courseTitle : "Pelatihan";
        return `${courseTitle}: ${removedMaterials.length} materi lesson ikut dibersihkan saat pelatihan dihapus.`;
    }

    return "Aksi sistem tercatat tanpa ringkasan tambahan.";
}

export default function AdminAuditPage() {
    const [selectedAction, setSelectedAction] = React.useState("ALL");
    const [selectedEntity, setSelectedEntity] = React.useState("ALL");

    const { data, isLoading } = useQuery({
        queryKey: ["audit-logs"],
        queryFn: () => fetchAuditLogs(100),
    });

    const logs = React.useMemo(() => data?.logs ?? [], [data?.logs]);
    const actionOptions = React.useMemo(
        () => ["ALL", ...Array.from(new Set(logs.map((log) => log.action)))],
        [logs],
    );
    const entityOptions = React.useMemo(
        () => ["ALL", ...Array.from(new Set(logs.map((log) => log.entity)))],
        [logs],
    );
    const filteredLogs = logs.filter((log) => {
        if (selectedAction !== "ALL" && log.action !== selectedAction) return false;
        if (selectedEntity !== "ALL" && log.entity !== selectedEntity) return false;
        return true;
    });

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Log Audit</h1>
                <p className="text-gray-500 mt-1">{filteredLogs.length} dari {logs.length} log tampil</p>
            </div>

            {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>Belum ada log audit.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-[#1a242f] md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Filter aksi</label>
                            <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700">
                                {actionOptions.map((action) => (
                                    <option key={action} value={action}>{action === "ALL" ? "Semua aksi" : getActionLabel(action)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Filter entitas</label>
                            <select value={selectedEntity} onChange={(e) => setSelectedEntity(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700">
                                {entityOptions.map((entity) => (
                                    <option key={entity} value={entity}>{entity === "ALL" ? "Semua entitas" : getEntityLabel(entity)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500"><th className="p-4 font-semibold">User</th><th className="p-4 font-semibold">Aksi</th><th className="p-4 font-semibold">Entitas</th><th className="p-4 font-semibold">Ringkasan</th><th className="p-4 font-semibold">Waktu</th></tr></thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                                    <td className="p-4"><div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span className="font-medium">{log.user.fullName}</span></div></td>
                                    <td className="p-4"><span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">{getActionLabel(log.action)}</span></td>
                                    <td className="p-4 text-gray-500">{getEntityLabel(log.entity)}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}</td>
                                    <td className="p-4 text-gray-500">{getAuditSummary(log)}</td>
                                    <td className="p-4 text-gray-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(log.createdAt).toLocaleString("id-ID")}</td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-sm text-gray-500">Tidak ada log yang cocok dengan filter saat ini.</td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}
        </div>
    );
}
