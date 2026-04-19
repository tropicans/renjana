"use client";

import Link from "next/link";
import React from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { createAdminClassGroup, deleteAdminClassGroup, fetchAdminClassGroups, fetchAdminEvent, updateAdminClassGroup } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

type ClassGroupFormState = {
    name: string;
    modality: string;
    capacity: string;
    startAt: string;
    endAt: string;
    location: string;
    zoomLink: string;
    zoomPasscode: string;
    instructorName: string;
    description: string;
};

function emptyForm(): ClassGroupFormState {
    return {
        name: "",
        modality: "ONLINE",
        capacity: "",
        startAt: "",
        endAt: "",
        location: "",
        zoomLink: "",
        zoomPasscode: "",
        instructorName: "",
        description: "",
    };
}

function toEditableForm(group: {
    name: string;
    modality: string;
    capacity: number | null;
    startAt: string | null;
    endAt: string | null;
    location: string | null;
    zoomLink: string | null;
    zoomPasscode: string | null;
    instructorName: string | null;
    description: string | null;
}): ClassGroupFormState {
    return {
        name: group.name,
        modality: group.modality,
        capacity: group.capacity?.toString() || "",
        startAt: group.startAt ? group.startAt.slice(0, 16) : "",
        endAt: group.endAt ? group.endAt.slice(0, 16) : "",
        location: group.location || "",
        zoomLink: group.zoomLink || "",
        zoomPasscode: group.zoomPasscode || "",
        instructorName: group.instructorName || "",
        description: group.description || "",
    };
}

export default function AdminEventClassGroupsPage() {
    const { id } = useParams<{ id: string }>();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [form, setForm] = React.useState<ClassGroupFormState>(emptyForm());
    const [editingGroupId, setEditingGroupId] = React.useState<string | null>(null);
    const [editingForm, setEditingForm] = React.useState<ClassGroupFormState>(emptyForm());

    const { data: eventData, isLoading: eventLoading } = useQuery({ queryKey: ["admin-event", id], queryFn: () => fetchAdminEvent(id), enabled: !!id });
    const { data: groupsData, isLoading: groupsLoading } = useQuery({ queryKey: ["admin-class-groups", id], queryFn: () => fetchAdminClassGroups(id), enabled: !!id });

    const groups = groupsData?.classGroups ?? [];

    const createMutation = useMutation({
        mutationFn: () => createAdminClassGroup(id, { ...form, capacity: form.capacity.trim() ? Number(form.capacity) : null }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-class-groups", id] });
            toast.success("Kelompok kelas berhasil dibuat.");
            setForm(emptyForm());
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const updateMutation = useMutation({
        mutationFn: ({ groupId, payload }: { groupId: string; payload: ClassGroupFormState }) => updateAdminClassGroup(groupId, {
            ...payload,
            capacity: payload.capacity.trim() ? Number(payload.capacity) : null,
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-class-groups", id] });
            toast.success("Kelompok kelas berhasil diperbarui.");
            setEditingGroupId(null);
            setEditingForm(emptyForm());
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const deleteMutation = useMutation({
        mutationFn: (groupId: string) => deleteAdminClassGroup(groupId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin-class-groups", id] });
            toast.success("Kelompok kelas berhasil dihapus.");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    if (eventLoading || groupsLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8">
            <Link href={`/admin/events/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary"><ArrowLeft className="h-4 w-4" /> Kembali ke event</Link>

            <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Kelompok Kelas</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{eventData?.event.title}</h1>
                <p className="mt-1 text-gray-500">Buat kelas operasional online/offline untuk penempatan peserta.</p>
            </div>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                <h2 className="text-xl font-bold">Buat Kelompok Kelas</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nama kelompok kelas" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                    <select value={form.modality} onChange={(e) => setForm((prev) => ({ ...prev, modality: e.target.value }))} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700">
                        <option value="ONLINE">ONLINE</option>
                        <option value="OFFLINE">OFFLINE</option>
                    </select>
                    <input value={form.capacity} onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))} placeholder="Kapasitas (opsional)" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                    <input value={form.instructorName} onChange={(e) => setForm((prev) => ({ ...prev, instructorName: e.target.value }))} placeholder="PIC / instruktur" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                    <input type="datetime-local" value={form.startAt} onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                    <input type="datetime-local" value={form.endAt} onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                    <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Lokasi offline" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                    <input value={form.zoomLink} onChange={(e) => setForm((prev) => ({ ...prev, zoomLink: e.target.value }))} placeholder="Link Zoom" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                    <input value={form.zoomPasscode} onChange={(e) => setForm((prev) => ({ ...prev, zoomPasscode: e.target.value }))} placeholder="Passcode Zoom" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                    <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Deskripsi / instruksi kelas" rows={4} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700 md:col-span-2" />
                </div>
                <p className="mt-4 text-xs text-gray-500">Isi jadwal sesi untuk membantu peserta webinar dan seminar melihat waktu hadir yang tepat.</p>
                <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !form.name.trim()} className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"><Plus className="h-4 w-4" /> Buat kelompok kelas</button>
            </section>

            <section className="grid gap-4">
                {groups.map((group) => (
                    <article key={group.id} className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                                    <span>{group.modality}</span>
                                    <span>{group.status}</span>
                                </div>
                                <h2 className="mt-2 text-xl font-bold">{group.name}</h2>
                                <div className="mt-3 space-y-1 text-sm text-gray-500">
                                    <p>Kapasitas: {group.capacity ?? "Tidak dibatasi"}</p>
                                    <p>Peserta terpasang: {group._count?.registrations ?? 0}</p>
                                    <p>PIC: {group.instructorName || "Belum diisi"}</p>
                                    <p>Mulai: {group.startAt ? new Date(group.startAt).toLocaleString("id-ID") : "Belum diatur"}</p>
                                    <p>Selesai: {group.endAt ? new Date(group.endAt).toLocaleString("id-ID") : "Belum diatur"}</p>
                                    <p>Lokasi: {group.location || "-"}</p>
                                    <p>Zoom: {group.zoomLink || "-"}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        setEditingGroupId(group.id);
                                        setEditingForm(toEditableForm(group));
                                    }}
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
                                >
                                    <Pencil className="h-4 w-4" /> Ubah
                                </button>
                                <button onClick={() => deleteMutation.mutate(group.id)} disabled={deleteMutation.isPending} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-60"><Trash2 className="h-4 w-4" /> Hapus</button>
                            </div>
                        </div>

                        {editingGroupId === group.id ? (
                            <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 dark:border-gray-800 md:grid-cols-2">
                                <input value={editingForm.name} onChange={(e) => setEditingForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nama kelompok kelas" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                                <select value={editingForm.modality} onChange={(e) => setEditingForm((prev) => ({ ...prev, modality: e.target.value }))} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700">
                                    <option value="ONLINE">ONLINE</option>
                                    <option value="OFFLINE">OFFLINE</option>
                                </select>
                                <input value={editingForm.capacity} onChange={(e) => setEditingForm((prev) => ({ ...prev, capacity: e.target.value }))} placeholder="Kapasitas (opsional)" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                                <input value={editingForm.instructorName} onChange={(e) => setEditingForm((prev) => ({ ...prev, instructorName: e.target.value }))} placeholder="PIC / instruktur" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                                <input type="datetime-local" value={editingForm.startAt} onChange={(e) => setEditingForm((prev) => ({ ...prev, startAt: e.target.value }))} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                                <input type="datetime-local" value={editingForm.endAt} onChange={(e) => setEditingForm((prev) => ({ ...prev, endAt: e.target.value }))} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                                <input value={editingForm.location} onChange={(e) => setEditingForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Lokasi offline" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                                <input value={editingForm.zoomLink} onChange={(e) => setEditingForm((prev) => ({ ...prev, zoomLink: e.target.value }))} placeholder="Link Zoom" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                                <input value={editingForm.zoomPasscode} onChange={(e) => setEditingForm((prev) => ({ ...prev, zoomPasscode: e.target.value }))} placeholder="Passcode Zoom" className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700" />
                                <textarea value={editingForm.description} onChange={(e) => setEditingForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Deskripsi / instruksi kelas" rows={4} className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700 md:col-span-2" />
                                <div className="flex flex-wrap gap-3 md:col-span-2">
                                    <button
                                        onClick={() => updateMutation.mutate({ groupId: group.id, payload: editingForm })}
                                        disabled={updateMutation.isPending || !editingForm.name.trim()}
                                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                                    >
                                        <Save className="h-4 w-4" /> Simpan perubahan
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingGroupId(null);
                                            setEditingForm(emptyForm());
                                        }}
                                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700"
                                    >
                                        <X className="h-4 w-4" /> Batal
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </article>
                ))}
                {groups.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-[#1a242f]">Belum ada kelompok kelas untuk event ini.</div> : null}
            </section>
        </div>
    );
}
