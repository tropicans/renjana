"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "@/lib/api";
import { Loader2, Shield, User, Clock } from "lucide-react";

export default function AdminAuditPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["audit-logs"],
        queryFn: () => fetchAuditLogs(100),
    });

    const logs = data?.logs ?? [];

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Audit Log</h1>
                <p className="text-gray-500 mt-1">{logs.length} log tercatat</p>
            </div>

            {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>Belum ada log audit.</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-gray-100 dark:border-gray-800 text-left text-gray-500"><th className="p-4 font-semibold">User</th><th className="p-4 font-semibold">Action</th><th className="p-4 font-semibold">Entity</th><th className="p-4 font-semibold">Time</th></tr></thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                                    <td className="p-4"><div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span className="font-medium">{log.user.fullName}</span></div></td>
                                    <td className="p-4"><span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold">{log.action}</span></td>
                                    <td className="p-4 text-gray-500">{log.entity}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}</td>
                                    <td className="p-4 text-gray-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(log.createdAt).toLocaleString("id-ID")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
