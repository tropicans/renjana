"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ClipboardList, Loader2, Pencil, Plus, Save, Trash2, XCircle } from "lucide-react";
import {
    createAdminQuiz,
    deleteAdminQuiz,
    fetchAdminEvent,
    fetchAdminQuizzes,
    updateAdminQuiz,
} from "@/lib/api";
import { useToast } from "@/components/ui/toast";

type QuizType = "PRE_TEST" | "POST_TEST";

type QuizQuestionForm = {
    question: string;
    options: [string, string, string, string];
    correctIdx: number;
};

type QuizFormState = {
    id?: string;
    type: QuizType;
    title: string;
    timeLimit: string;
    passingScore: string;
    questions: QuizQuestionForm[];
};

function createEmptyQuestion(): QuizQuestionForm {
    return {
        question: "",
        options: ["", "", "", ""],
        correctIdx: 0,
    };
}

function createDefaultForm(type: QuizType): QuizFormState {
    return {
        type,
        title: type === "PRE_TEST" ? "Pre-Test" : "Post-Test",
        timeLimit: "",
        passingScore: "70",
        questions: [createEmptyQuestion()],
    };
}

function normalizeForm(existing: {
    id: string;
    type: string;
    title: string;
    timeLimit: number | null;
    passingScore: number;
    questions: Array<{
        question: string;
        options: string[];
        correctIdx: number;
    }>;
}): QuizFormState {
    return {
        id: existing.id,
        type: existing.type as QuizType,
        title: existing.title,
        timeLimit: existing.timeLimit?.toString() ?? "",
        passingScore: existing.passingScore.toString(),
        questions: existing.questions.length
            ? existing.questions.map((question) => ({
                question: question.question,
                options: [
                    question.options[0] ?? "",
                    question.options[1] ?? "",
                    question.options[2] ?? "",
                    question.options[3] ?? "",
                ],
                correctIdx: question.correctIdx,
            }))
            : [createEmptyQuestion()],
    };
}

function validateQuizForm(form: QuizFormState) {
    if (!form.title.trim()) return "Judul quiz wajib diisi.";

    const passingScore = Number(form.passingScore);
    if (!Number.isFinite(passingScore) || passingScore < 0 || passingScore > 100) {
        return "Passing score harus di antara 0 sampai 100.";
    }

    if (form.timeLimit.trim()) {
        const timeLimit = Number(form.timeLimit);
        if (!Number.isInteger(timeLimit) || timeLimit <= 0) {
            return "Time limit harus berupa angka bulat positif.";
        }
    }

    if (!form.questions.length) return "Minimal harus ada satu pertanyaan.";

    for (const [index, question] of form.questions.entries()) {
        if (!question.question.trim()) return `Pertanyaan ${index + 1} belum diisi.`;
        if (question.options.some((option) => !option.trim())) return `Semua opsi pada pertanyaan ${index + 1} wajib diisi.`;
        if (question.correctIdx < 0 || question.correctIdx > 3) return `Jawaban benar pertanyaan ${index + 1} tidak valid.`;
    }

    return null;
}

export default function AdminEventQuizzesPage() {
    const { id } = useParams<{ id: string }>();
    const toast = useToast();
    const queryClient = useQueryClient();
    const [activeType, setActiveType] = React.useState<QuizType>("PRE_TEST");
    const [form, setForm] = React.useState<QuizFormState>(createDefaultForm("PRE_TEST"));

    const { data: eventData, isLoading: eventLoading } = useQuery({
        queryKey: ["admin-event", id],
        queryFn: () => fetchAdminEvent(id),
        enabled: !!id,
    });

    const courseId = eventData?.event.courseId ?? "";

    const { data: quizzesData, isLoading: quizzesLoading } = useQuery({
        queryKey: ["admin-quizzes", courseId],
        queryFn: () => fetchAdminQuizzes(courseId),
        enabled: !!courseId,
    });

    const quizzes = quizzesData?.quizzes ?? [];
    const selectedQuiz = quizzes.find((quiz) => quiz.type === activeType);
    const validationError = validateQuizForm(form);

    React.useEffect(() => {
        if (!selectedQuiz) {
            setForm(createDefaultForm(activeType));
            return;
        }

        setForm(normalizeForm(selectedQuiz));
    }, [activeType, selectedQuiz]);

    const invalidate = React.useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: ["admin-quizzes", courseId] });
        await queryClient.invalidateQueries({ queryKey: ["admin-event", id] });
    }, [courseId, id, queryClient]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const error = validateQuizForm(form);
            if (error) throw new Error(error);
            if (!courseId) throw new Error("Event belum terhubung ke course.");

            const payload = {
                courseId,
                type: form.type,
                title: form.title.trim(),
                timeLimit: form.timeLimit.trim() ? Number(form.timeLimit) : null,
                passingScore: Number(form.passingScore),
                questions: form.questions.map((question) => ({
                    question: question.question.trim(),
                    options: question.options.map((option) => option.trim()),
                    correctIdx: question.correctIdx,
                })),
            };

            if (form.id) {
                return updateAdminQuiz(form.id, {
                    title: payload.title,
                    timeLimit: payload.timeLimit,
                    passingScore: payload.passingScore,
                    questions: payload.questions,
                });
            }

            return createAdminQuiz(payload);
        },
        onSuccess: async () => {
            await invalidate();
            toast.success(form.id ? "Quiz berhasil diperbarui." : "Quiz berhasil dibuat.");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!form.id) throw new Error("Quiz belum ada untuk dihapus.");
            return deleteAdminQuiz(form.id);
        },
        onSuccess: async () => {
            await invalidate();
            setForm(createDefaultForm(activeType));
            toast.success("Quiz berhasil dihapus.");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const event = eventData?.event;

    if (eventLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!event) {
        return <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-[#1a242f]">Event tidak ditemukan.</div>;
    }

    if (!courseId) {
        return (
            <div className="space-y-6">
                <Link href={`/admin/events/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
                    <ArrowLeft className="h-4 w-4" /> Kembali ke event
                </Link>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                    Event ini belum terhubung ke course. Hubungkan course terlebih dahulu di halaman `event detail` agar quiz bisa dikelola dari context event.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Link href={`/admin/events/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
                <ArrowLeft className="h-4 w-4" /> Kembali ke event
            </Link>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Quiz Management</p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{event.title}</h1>
                    <p className="mt-1 text-gray-500">Kelola PRE_TEST dan POST_TEST untuk course yang terhubung dengan event ini.</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 text-sm dark:border-gray-800 dark:bg-[#1a242f]">
                    <p className="font-semibold text-gray-900 dark:text-white">Linked course</p>
                    <p className="mt-1 text-gray-500">{event.course?.title}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-2xl font-bold">{quizzes.length}</p>
                            <p className="text-xs text-gray-500">Quiz aktif</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3">
                        {event.postTestEnabled ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-amber-500" />}
                        <div>
                            <p className="text-sm font-bold">Certificate dependency</p>
                            <p className="text-xs text-gray-500">POST_TEST {event.postTestEnabled ? "enabled" : "not enabled"}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="flex items-center gap-3">
                        {event.evaluationEnabled ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-amber-500" />}
                        <div>
                            <p className="text-sm font-bold">Evaluation dependency</p>
                            <p className="text-xs text-gray-500">Evaluation {event.evaluationEnabled ? "enabled" : "not enabled"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-[#1a242f]">
                <div className="flex flex-wrap gap-3">
                    {(["PRE_TEST", "POST_TEST"] as QuizType[]).map((type) => {
                        const existing = quizzes.find((quiz) => quiz.type === type);
                        const active = activeType === type;

                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setActiveType(type)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-primary text-white" : "border border-gray-200 text-gray-600 hover:border-primary/30 hover:text-primary dark:border-gray-700 dark:text-gray-300"}`}
                            >
                                {type}
                                <span className="ml-2 text-xs opacity-80">{existing ? "configured" : "empty"}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold">Status {activeType}</h2>
                            <p className="mt-1 text-sm text-gray-500">Ringkasan kesiapan quiz untuk event ini.</p>
                        </div>
                        {quizzesLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : null}
                    </div>

                    <div className="mt-5 space-y-4 text-sm">
                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                            <p className="font-semibold text-gray-900 dark:text-white">{selectedQuiz ? selectedQuiz.title : `${activeType} belum dibuat`}</p>
                            <div className="mt-3 space-y-2 text-gray-500">
                                <p>Soal: {selectedQuiz?._count.questions ?? 0}</p>
                                <p>Attempts: {selectedQuiz?._count.attempts ?? 0}</p>
                                <p>Passing score: {selectedQuiz?.passingScore ?? "-"}</p>
                                <p>Time limit: {selectedQuiz?.timeLimit ? `${selectedQuiz.timeLimit} menit` : "Tanpa batas waktu"}</p>
                            </div>
                        </div>

                        <div className={`rounded-xl px-4 py-3 text-xs ${selectedQuiz ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"}`}>
                            {selectedQuiz
                                ? `${activeType} siap dipakai pada event ini.`
                                : `Belum ada ${activeType}. Buat quiz untuk mengaktifkan readiness event dengan rapi.`}
                        </div>

                        {activeType === "POST_TEST" ? (
                            <div className={`rounded-xl px-4 py-3 text-xs ${event.postTestEnabled && event.evaluationEnabled ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"}`}>
                                Sertifikat event ini baru benar-benar siap jika POST_TEST aktif, evaluation aktif, peserta lulus POST_TEST, dan peserta submit evaluation.
                            </div>
                        ) : null}
                    </div>
                </section>

                <section className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-[#1a242f]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold">{form.id ? "Edit quiz" : "Buat quiz baru"}</h2>
                            <p className="mt-1 text-sm text-gray-500">Semua perubahan langsung terkait ke course yang dipakai event ini.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.id ? (
                                <button
                                    type="button"
                                    onClick={() => setForm(normalizeForm(selectedQuiz!))}
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold dark:border-gray-700"
                                >
                                    <Pencil className="h-3.5 w-3.5" /> Reset perubahan
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setForm(createDefaultForm(activeType))}
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold dark:border-gray-700"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Reset draft
                                </button>
                            )}
                            {form.id ? (
                                <button
                                    type="button"
                                    onClick={() => deleteMutation.mutate()}
                                    disabled={deleteMutation.isPending}
                                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 disabled:opacity-60 dark:border-red-900/50"
                                >
                                    {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Hapus quiz
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {validationError ? (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                            {validationError}
                        </div>
                    ) : null}

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <input
                            value={form.title}
                            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Judul quiz"
                            className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700"
                        />
                        <input value={form.type} disabled className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-700 dark:bg-slate-900" />
                        <input
                            value={form.timeLimit}
                            onChange={(e) => setForm((prev) => ({ ...prev, timeLimit: e.target.value }))}
                            placeholder="Time limit (menit, opsional)"
                            className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700"
                        />
                        <input
                            value={form.passingScore}
                            onChange={(e) => setForm((prev) => ({ ...prev, passingScore: e.target.value }))}
                            placeholder="Passing score"
                            className="rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700"
                        />
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-bold">Questions</h3>
                            <button
                                type="button"
                                onClick={() => setForm((prev) => ({ ...prev, questions: [...prev.questions, createEmptyQuestion()] }))}
                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold dark:border-gray-700"
                            >
                                <Plus className="h-3.5 w-3.5" /> Tambah soal
                            </button>
                        </div>

                        {form.questions.map((question, questionIdx) => (
                            <div key={`${form.type}-${questionIdx}`} className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold">Pertanyaan {questionIdx + 1}</p>
                                    {form.questions.length > 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => setForm((prev) => ({
                                                ...prev,
                                                questions: prev.questions.filter((_, index) => index !== questionIdx),
                                            }))}
                                            className="text-xs font-semibold text-red-500"
                                        >
                                            Hapus
                                        </button>
                                    ) : null}
                                </div>

                                <textarea
                                    value={question.question}
                                    onChange={(e) => setForm((prev) => ({
                                        ...prev,
                                        questions: prev.questions.map((item, index) => index === questionIdx ? { ...item, question: e.target.value } : item),
                                    }))}
                                    rows={3}
                                    placeholder="Tulis pertanyaan"
                                    className="mt-3 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700"
                                />

                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    {question.options.map((option, optionIdx) => (
                                        <div key={`${form.type}-${questionIdx}-option-${optionIdx}`} className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-xs font-semibold text-gray-500">Opsi {optionIdx + 1}</span>
                                                <label className="flex items-center gap-2 text-xs text-gray-500">
                                                    <input
                                                        type="radio"
                                                        name={`${form.type}-correct-${questionIdx}`}
                                                        checked={question.correctIdx === optionIdx}
                                                        onChange={() => setForm((prev) => ({
                                                            ...prev,
                                                            questions: prev.questions.map((item, index) => index === questionIdx ? { ...item, correctIdx: optionIdx } : item),
                                                        }))}
                                                    />
                                                    Correct
                                                </label>
                                            </div>
                                            <input
                                                value={option}
                                                onChange={(e) => setForm((prev) => ({
                                                    ...prev,
                                                    questions: prev.questions.map((item, index) => index === questionIdx ? {
                                                        ...item,
                                                        options: item.options.map((currentOption, currentIndex) => currentIndex === optionIdx ? e.target.value : currentOption) as [string, string, string, string],
                                                    } : item),
                                                }))}
                                                placeholder={`Isi opsi ${optionIdx + 1}`}
                                                className="mt-3 w-full rounded-xl border border-gray-200 bg-transparent px-4 py-3 text-sm dark:border-gray-700"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={() => saveMutation.mutate()}
                            disabled={saveMutation.isPending || !!validationError}
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
                        >
                            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {form.id ? "Simpan perubahan" : "Buat quiz"}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
