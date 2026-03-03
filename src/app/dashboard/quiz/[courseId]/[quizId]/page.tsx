"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchQuizDetail, submitQuiz, fetchQuizAttempts } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock,
    Award,
    ChevronLeft,
    ChevronRight,
    Send,
    RotateCcw,
    HelpCircle,
} from "lucide-react";

export default function QuizPlayerPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const courseId = params.courseId as string;
    const quizId = params.quizId as string;

    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<{
        score: number;
        passed: boolean;
        totalQuestions: number;
        correctCount: number;
        answers: Array<{ questionId: string; selectedIdx: number; correctIdx: number; isCorrect: boolean }>;
    } | null>(null);

    // Fetch quiz detail
    const { data: quizData, isLoading: quizLoading } = useQuery({
        queryKey: ["quiz-detail", courseId, quizId],
        queryFn: () => fetchQuizDetail(courseId, quizId),
        enabled: !!courseId && !!quizId,
    });

    // Fetch previous attempts
    const { data: attemptsData } = useQuery({
        queryKey: ["quiz-attempts", courseId, quizId],
        queryFn: () => fetchQuizAttempts(courseId, quizId),
        enabled: !!courseId && !!quizId,
    });

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: () => {
            const answerArray = Object.entries(answers).map(([questionId, selectedIdx]) => ({
                questionId,
                selectedIdx,
            }));
            return submitQuiz(courseId, quizId, answerArray);
        },
        onSuccess: (data) => {
            setResult(data.attempt);
            setSubmitted(true);
            if (data.attempt.passed) {
                toast.success(`🎉 Selamat! Anda lulus dengan skor ${data.attempt.score}%`);
            } else {
                toast.error(`Skor Anda ${data.attempt.score}%. Belum mencapai passing grade.`);
            }
        },
        onError: (err: Error) => {
            toast.error(err.message || "Gagal submit quiz");
        },
    });

    const quiz = quizData?.quiz;
    const questions = quiz?.questions ?? [];
    const currentQuestion = questions[currentIdx];
    const previousAttempts = attemptsData?.attempts ?? [];

    const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
    const allAnswered = answeredCount === questions.length;

    if (quizLoading || !quiz) {
        return (
            <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleSelectOption = (questionId: string, optionIdx: number) => {
        if (submitted) return;
        setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
    };

    const handleRetry = () => {
        setAnswers({});
        setSubmitted(false);
        setResult(null);
        setCurrentIdx(0);
    };

    const getResultForQuestion = (questionId: string) => {
        if (!result) return null;
        return result.answers.find((a) => a.questionId === questionId);
    };

    return (
        <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922]">
            {/* Top Bar */}
            <div className="bg-white dark:bg-[#1a242f] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/learn/${courseId}`}
                            className="text-gray-500 hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest">
                                {quiz.type === "PRE_TEST" ? "Pre-Test" : "Post-Test"}
                            </p>
                            <h1 className="text-lg font-bold">{quiz.title}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        {quiz.timeLimit && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {quiz.timeLimit} menit
                            </span>
                        )}
                        <span className="font-medium">
                            {answeredCount}/{questions.length} dijawab
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-gray-100 dark:bg-gray-800">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Result Banner */}
                {submitted && result && (
                    <div
                        className={`mb-8 p-6 rounded-2xl border ${result.passed
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            {result.passed ? (
                                <Award className="h-12 w-12 text-green-500" />
                            ) : (
                                <XCircle className="h-12 w-12 text-red-500" />
                            )}
                            <div>
                                <h2 className={`text-2xl font-bold ${result.passed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                                    {result.passed ? "Selamat, Anda Lulus!" : "Belum Lulus"}
                                </h2>
                                <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                                    Skor:{" "}
                                    <span className="font-bold text-lg">{result.score}%</span>
                                    {" "}({result.correctCount}/{result.totalQuestions} benar)
                                    {" · "}Passing grade: {quiz.passingScore}%
                                </p>
                            </div>
                        </div>
                        {!result.passed && (
                            <button
                                onClick={handleRetry}
                                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-all"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Coba Lagi
                            </button>
                        )}
                    </div>
                )}

                {/* Previous Attempts */}
                {previousAttempts.length > 0 && !submitted && (
                    <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                            📝 Anda sudah pernah mengerjakan quiz ini {previousAttempts.length}x.
                            Skor terakhir: <span className="font-bold">{previousAttempts[0].score}%</span>
                            {previousAttempts[0].passed ? " ✅ Lulus" : " ❌ Belum lulus"}
                        </p>
                    </div>
                )}

                {/* Question Navigator */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {questions.map((q, idx) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const isCurrent = idx === currentIdx;
                        const qResult = getResultForQuestion(q.id);

                        let bgClass = "bg-gray-100 dark:bg-gray-800 text-gray-500";
                        if (submitted && qResult) {
                            bgClass = qResult.isCorrect
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
                        } else if (isCurrent) {
                            bgClass = "bg-primary text-white shadow-lg shadow-primary/20";
                        } else if (isAnswered) {
                            bgClass = "bg-primary/20 text-primary";
                        }

                        return (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIdx(idx)}
                                className={`h-10 w-10 rounded-lg font-bold text-sm transition-all ${bgClass}`}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>

                {/* Current Question */}
                {currentQuestion && (
                    <div className="bg-white dark:bg-[#1a242f] rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <HelpCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Soal {currentIdx + 1} dari {questions.length}
                                </p>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold mb-6 leading-relaxed">
                            {currentQuestion.question}
                        </h3>

                        {/* Options */}
                        <div className="space-y-3">
                            {(currentQuestion.options as string[]).map((option, optIdx) => {
                                const isSelected = answers[currentQuestion.id] === optIdx;
                                const qResult = getResultForQuestion(currentQuestion.id);

                                let optionClass =
                                    "border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5";

                                if (submitted && qResult) {
                                    if (optIdx === qResult.correctIdx) {
                                        optionClass =
                                            "border-green-500 bg-green-50 dark:bg-green-900/20";
                                    } else if (isSelected && !qResult.isCorrect) {
                                        optionClass =
                                            "border-red-500 bg-red-50 dark:bg-red-900/20";
                                    }
                                } else if (isSelected) {
                                    optionClass =
                                        "border-primary bg-primary/10 ring-2 ring-primary/20";
                                }

                                return (
                                    <button
                                        key={optIdx}
                                        onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                                        disabled={submitted}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${optionClass} disabled:cursor-default`}
                                    >
                                        <div
                                            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${isSelected && !submitted
                                                ? "bg-primary text-white"
                                                : submitted && qResult && optIdx === qResult.correctIdx
                                                    ? "bg-green-500 text-white"
                                                    : submitted && isSelected && !qResult?.isCorrect
                                                        ? "bg-red-500 text-white"
                                                        : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                                                }`}
                                        >
                                            {submitted && qResult && optIdx === qResult.correctIdx ? (
                                                <CheckCircle2 className="h-4 w-4" />
                                            ) : submitted && isSelected && !qResult?.isCorrect ? (
                                                <XCircle className="h-4 w-4" />
                                            ) : (
                                                String.fromCharCode(65 + optIdx)
                                            )}
                                        </div>
                                        <span className="flex-1">{option}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                        disabled={currentIdx === 0}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-gray-500 hover:text-primary disabled:opacity-30 transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                    </button>

                    {currentIdx < questions.length - 1 ? (
                        <button
                            onClick={() =>
                                setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))
                            }
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            Selanjutnya
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : !submitted ? (
                        <button
                            onClick={() => submitMutation.mutate()}
                            disabled={!allAnswered || submitMutation.isPending}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {submitMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            Submit Quiz
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push(`/learn/${courseId}`)}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold text-sm hover:opacity-90 transition-all"
                        >
                            Kembali ke Course
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
