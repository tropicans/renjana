import { Clock3, FileText, ShieldCheck, User } from "lucide-react";

type AuditActor = {
    id: string;
    fullName: string;
    email: string;
};

export type OpsAuditLog = {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    metadata?: {
        previous?: Record<string, unknown>;
        next?: Record<string, unknown>;
        documentUpdates?: Array<{
            id: string;
            reviewStatus?: string;
            adminNote?: string | null;
        }>;
        classGroupId?: string | null;
        classGroupName?: string | null;
    } | null;
    createdAt: string;
    user: AuditActor;
};

function formatValue(value: unknown) {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "boolean") return value ? "Ya" : "Tidak";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

function getSummary(log: OpsAuditLog) {
    if (log.metadata?.documentUpdates?.length) {
        return `${log.metadata.documentUpdates.length} dokumen direview di langkah ini.`;
    }

    const previous = log.metadata?.previous ?? {};
    const next = log.metadata?.next ?? {};
    const keys = Array.from(new Set([...Object.keys(previous), ...Object.keys(next)]));
    const changedKeys = keys.filter((key) => formatValue(previous[key]) !== formatValue(next[key]));

    if (changedKeys.length > 0) {
        return changedKeys
            .slice(0, 2)
            .map((key) => `${key}: ${formatValue(previous[key])} -> ${formatValue(next[key])}`)
            .join(" | ");
    }

    if (log.metadata?.classGroupName) {
        return `Class group: ${log.metadata.classGroupName}`;
    }

    return "Perubahan operasional tercatat tanpa detail tambahan.";
}

export function OpsAuditTimeline({ logs, emptyLabel }: { logs: OpsAuditLog[]; emptyLabel: string }) {
    return (
        <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Jejak Operasional</h2>
            </div>
            <p className="mt-2 text-sm text-gray-500">Ringkasan aksi Finance dan Admin terakhir untuk registrasi ini.</p>

            {logs.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500 dark:border-gray-700">
                    {emptyLabel}
                </div>
            ) : (
                <div className="mt-5 space-y-4">
                    {logs.map((log) => (
                        <div key={log.id} className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                            {log.action}
                                        </span>
                                        <span className="text-xs text-gray-400">{log.entity}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}</span>
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-100">{getSummary(log)}</p>
                                </div>
                                <div className="text-xs text-gray-400 sm:text-right">
                                    <div className="flex items-center gap-1 sm:justify-end"><Clock3 className="h-3.5 w-3.5" />{new Date(log.createdAt).toLocaleString("id-ID")}</div>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{log.user.fullName}</div>
                                <div>{log.user.email}</div>
                            </div>
                            {log.metadata?.documentUpdates?.length ? (
                                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                    <div className="mb-2 flex items-center gap-1 font-semibold"><FileText className="h-3.5 w-3.5" />Dokumen terdampak</div>
                                    <div className="space-y-1">
                                        {log.metadata.documentUpdates.map((document, index) => (
                                            <p key={`${log.id}-${document.id}-${index}`}>
                                                {document.id.slice(0, 8)} - {document.reviewStatus || "tanpa status"}{document.adminNote ? ` - ${document.adminNote}` : ""}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
