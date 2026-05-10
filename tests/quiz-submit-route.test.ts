import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    getAccessibleRegistrationForCourse: vi.fn(),
    prisma: {
        quiz: {
            findFirst: vi.fn(),
        },
        quizAttempt: {
            create: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireAuth: mocks.requireAuth,
}));

vi.mock("@/lib/registration-access", () => ({
    getAccessibleRegistrationForCourse: mocks.getAccessibleRegistrationForCourse,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { POST } from "@/app/api/quizzes/[courseId]/[quizId]/submit/route";

describe("POST /api/quizzes/[courseId]/[quizId]/submit", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireAuth.mockResolvedValue({
            user: { id: "learner-1", role: "LEARNER" },
            error: null,
        });
        mocks.getAccessibleRegistrationForCourse.mockResolvedValue({
            access: { allowed: true },
            registration: { id: "reg-1" },
        });
        mocks.prisma.quiz.findFirst.mockResolvedValue({
            id: "quiz-1",
            passingScore: 50,
            questions: [
                { id: "q1", correctIdx: 1, options: ["a", "b", "c"] },
                { id: "q2", correctIdx: 0, options: ["x", "y"] },
            ],
        });
        mocks.prisma.quizAttempt.create.mockImplementation(async ({ data }: { data: { score: number; passed: boolean; answers: unknown; completedAt: Date } }) => ({
            id: "attempt-1",
            score: data.score,
            passed: data.passed,
            completedAt: data.completedAt,
            answers: data.answers,
        }));
    });

    it("grades answers with O(1) lookup and persists attempt", async () => {
        const response = await POST(
            new Request("http://localhost/api/quizzes/course-1/quiz-1/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    answers: [
                        { questionId: "q2", selectedIdx: 0 },
                        { questionId: "q1", selectedIdx: 1 },
                    ],
                    registrationId: "reg-1",
                }),
            }),
            { params: Promise.resolve({ courseId: "course-1", quizId: "quiz-1" }) }
        );

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.attempt.correctCount).toBe(2);
        expect(body.attempt.score).toBe(100);
        expect(body.attempt.registrationId).toBe("reg-1");
        expect(mocks.prisma.quizAttempt.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                quizId: "quiz-1",
                userId: "learner-1",
                score: 100,
                passed: true,
                answers: [
                    { questionId: "q1", selectedIdx: 1, correctIdx: 1, isCorrect: true },
                    { questionId: "q2", selectedIdx: 0, correctIdx: 0, isCorrect: true },
                ],
            }),
        });
    });

    it("rejects duplicate question answers", async () => {
        const response = await POST(
            new Request("http://localhost/api/quizzes/course-1/quiz-1/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    answers: [
                        { questionId: "q1", selectedIdx: 1 },
                        { questionId: "q1", selectedIdx: 0 },
                    ],
                }),
            }),
            { params: Promise.resolve({ courseId: "course-1", quizId: "quiz-1" }) }
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: "Duplicate questionId in answers" });
        expect(mocks.getAccessibleRegistrationForCourse).not.toHaveBeenCalled();
        expect(mocks.prisma.quizAttempt.create).not.toHaveBeenCalled();
    });

    it("rejects invalid option indexes", async () => {
        const response = await POST(
            new Request("http://localhost/api/quizzes/course-1/quiz-1/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    answers: [
                        { questionId: "q1", selectedIdx: 9 },
                    ],
                }),
            }),
            { params: Promise.resolve({ courseId: "course-1", quizId: "quiz-1" }) }
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: "selectedIdx must be -1 or valid option index" });
        expect(mocks.prisma.quizAttempt.create).not.toHaveBeenCalled();
    });
});
