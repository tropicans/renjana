"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEvidences, uploadEvidence, deleteEvidence } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
    UploadCloud,
    FileText,
    Trash2,
    Star,
    Loader2,
    CheckCircle,
    Clock,
    FileIcon,
    Image as ImageIcon
} from "lucide-react";

export default function EvidencePage() {
    const toast = useToast();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    // Fetch user's evidence list
    const { data: evidenceData, isLoading } = useQuery({
        queryKey: ["evidences"],
        queryFn: fetchEvidences,
    });

    const evidences = evidenceData?.evidences ?? [];

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: () => {
            if (!title.trim() || !file) {
                throw new Error("title and file are required");
            }
            return uploadEvidence(title.trim(), file);
        },
        onSuccess: () => {
            toast.success("Bukti tugas berhasil dikirim!");
            setTitle("");
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            queryClient.invalidateQueries({ queryKey: ["evidences"] });
        },
        onError: () => {
            toast.error("Gagal mengunggah file. Pastikan format file sesuai (PDF/Image) dan ukuran file tidak melebihi 10MB.");
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteEvidence(id),
        onSuccess: () => {
            toast.success("Bukti tugas berhasil dihapus.");
            queryClient.invalidateQueries({ queryKey: ["evidences"] });
        },
        onError: (err: Error) => {
            toast.error(err.message || "Gagal menghapus bukti tugas");
        },
    });

    // Drag events
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const validateFile = (selectedFile: File) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        const maxBytes = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error("Gagal mengunggah file. Pastikan format file sesuai (PDF/Image) dan ukuran file tidak melebihi 10MB.");
            return false;
        }

        if (selectedFile.size > maxBytes) {
            toast.error("Gagal mengunggah file. Pastikan format file sesuai (PDF/Image) dan ukuran file tidak melebihi 10MB.");
            return false;
        }

        return true;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFile = e.dataTransfer.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Silakan masukkan judul tugas");
            return;
        }
        if (!file) {
            toast.error("Silakan pilih file bukti tugas terlebih dahulu");
            return;
        }
        uploadMutation.mutate();
    };

    const handleDelete = (id: string) => {
        const confirmed = window.confirm("Apakah Anda yakin ingin menghapus file bukti tugas yang sudah diunggah? Aksi ini tidak dapat dibatalkan.");
        if (confirmed) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Bukti Tugas</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Unggah bukti tugas Anda dan lihat feedback dari instruktur
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kirim Bukti Tugas Baru</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Judul Tugas Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Judul Tugas
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Masukkan judul tugas..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Drag & Drop Zone */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    File Bukti Tugas
                                </label>
                                <div
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all ${
                                        dragActive
                                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                                            : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 hover:border-gray-300 dark:hover:border-gray-700"
                                    }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".jpeg,.jpg,.png,.webp,.pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="evidence-file-input"
                                    />
                                    
                                    <UploadCloud className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-3" />

                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                                        Tarik & lepas file Anda di sini, atau
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold transition-colors border border-gray-200 dark:border-gray-700"
                                    >
                                        Pilih File Tugas
                                    </button>

                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 text-center">
                                        Format: PDF, JPEG, PNG, WebP (Maks. 10MB)
                                    </p>
                                </div>
                            </div>

                            {/* Selected File Details */}
                            {file && (
                                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-400">
                                    {file.type === "application/pdf" ? (
                                        <FileText className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <ImageIcon className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{file.name}</p>
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                        className="text-emerald-700 dark:text-emerald-500 hover:text-emerald-950 dark:hover:text-emerald-300 font-bold"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            )}

                            {/* Submit CTA */}
                            <button
                                type="submit"
                                disabled={uploadMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                            >
                                {uploadMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <UploadCloud className="h-4 w-4" />
                                )}
                                Kirim Bukti Tugas
                            </button>
                        </form>
                    </div>
                </div>

                {/* History Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] shadow-sm space-y-6 min-h-[400px]">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Riwayat Pengiriman</h2>

                        {evidences.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 dark:text-gray-400 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
                                <FileIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                <h3 className="font-bold text-lg text-gray-700 dark:text-gray-300 mb-1">
                                    Belum Ada Bukti Tugas
                                </h3>
                                <p className="text-sm max-w-sm px-4">
                                    Anda belum mengunggah file bukti tugas untuk modul ini. Silakan pilih atau tarik file Anda ke sini.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {evidences.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-[#151d27]/40 space-y-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-3 min-w-0">
                                                <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                                    {item.fileType === "pdf" ? (
                                                        <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                    ) : (
                                                        <ImageIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{item.title}</h3>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        Diunggah pada: {new Date(item.uploadedAt).toLocaleDateString("id-ID", {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action / Badges */}
                                            <div className="flex items-center gap-3">
                                                {item.rating === null ? (
                                                    <>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            Menunggu Penilaian
                                                        </span>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            disabled={deleteMutation.isPending}
                                                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                                        >
                                                            <Trash2 className="h-4.5 w-4.5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                        Selesai Dinilai
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Graded Details */}
                                        {item.rating !== null && (
                                            <div className="p-4 rounded-xl bg-white dark:bg-[#1a242f] border border-gray-100 dark:border-gray-800 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Nilai:</span>
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`h-4.5 w-4.5 ${
                                                                    star <= item.rating!
                                                                        ? "fill-amber-400 text-amber-400"
                                                                        : "text-gray-200 dark:text-gray-700"
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                {item.comment && (
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">Komentar Instruktur:</p>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic bg-gray-50 dark:bg-gray-900/40 p-3 rounded-lg border border-gray-100 dark:border-gray-800/80">
                                                            &ldquo;{item.comment}&rdquo;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
