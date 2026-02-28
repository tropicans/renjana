"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEvidences, uploadEvidence, type ApiEvidence } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
    Upload,
    FileCheck,
    Clock,
    CheckCircle,
    File,
    Plus,
    Loader2,
    Image as ImageIcon,
} from "lucide-react";

export default function EvidencePage() {
    const toast = useToast();
    const queryClient = useQueryClient();
    const fileRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["my-evidences"],
        queryFn: fetchEvidences,
    });

    const evidences = data?.evidences ?? [];

    const uploadMutation = useMutation({
        mutationFn: () => uploadEvidence(title, file!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-evidences"] });
            toast.success("Evidence berhasil diupload! ✅");
            setTitle("");
            setFile(null);
            if (fileRef.current) fileRef.current.value = "";
        },
        onError: (err) => {
            toast.error(err.message || "Upload gagal.");
        },
    });

    const getFileIcon = (fileType: string) => {
        return fileType === "image" ? (
            <ImageIcon className="h-5 w-5 text-blue-500" />
        ) : (
            <File className="h-5 w-5 text-red-500" />
        );
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Upload Evidence</h1>
                <p className="text-gray-500 mt-1">Upload bukti kerja dan portofolio pembelajaran Anda</p>
            </div>

            {/* Upload Form */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-8 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Upload Baru
                </h2>

                <div>
                    <label className="block text-sm font-semibold mb-2">Judul Evidence</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Tugas Modul 3 - Studi Kasus"
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">File (JPEG, PNG, WebP, PDF — maks 10MB)</label>
                    <div
                        onClick={() => fileRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                        {file ? (
                            <div className="flex items-center justify-center gap-3">
                                <FileCheck className="h-8 w-8 text-green-500" />
                                <div className="text-left">
                                    <p className="font-semibold text-sm">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">Klik atau drag file ke sini</p>
                            </>
                        )}
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="hidden"
                    />
                </div>

                <button
                    onClick={() => uploadMutation.mutate()}
                    disabled={!title || !file || uploadMutation.isPending}
                    className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {uploadMutation.isPending ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Mengupload...
                        </>
                    ) : (
                        <>
                            <Upload className="h-5 w-5" />
                            Upload Evidence
                        </>
                    )}
                </button>
            </div>

            {/* Evidence List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Evidence Saya</h2>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : evidences.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        Belum ada evidence yang diupload.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {evidences.map((ev) => (
                            <div
                                key={ev.id}
                                className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] flex items-start gap-4"
                            >
                                <div className="h-12 w-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                    {getFileIcon(ev.fileType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm truncate">{ev.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(ev.uploadedAt).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                        <CheckCircle className="h-3 w-3" />
                                        Uploaded
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
