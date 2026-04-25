import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    getAccessibleRegistrationForCourse: vi.fn(),
    prisma: {
        enrollment: {
            findUnique: vi.fn(),
        },
        quiz: {
            findFirst: vi.fn(),
        },
        quizAttempt: {
            findFirst: vi.fn(),
        },
        evaluation: {
            findFirst: vi.fn(),
        },
    },
}));

vi.mock("@/lib/registration-access", () => ({
    getAccessibleRegistrationForCourse: mocks.getAccessibleRegistrationForCourse,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { getCertificateEligibility } from "@/lib/certificate-eligibility";

describe("certificate eligibility evaluation linkage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.prisma.enrollment.findUnique.mockResolvedValue({
            id: "enroll-1",
            userId: "learner-1",
            status: "COMPLETED",
            user: { fullName: "Learner", email: "learner@example.com" },
            course: { id: "course-1", title: "Course 1" },
            certificate: null,
        });
        mocks.getAccessibleRegistrationForCourse.mockResolvedValue({
            access: {
                allowed: true,
                linkedEvent: {
                    id: "event-1",
                    evaluationEnabled: true,
                    certificateEnabled: true,
                    postTestEnabled: false,
                },
            },
            registration: {
                id: "reg-1",
                event: {
                    id: "event-1",
                    evaluationEnabled: true,
                    certificateEnabled: true,
                    postTestEnabled: false,
                },
            },
        });
    });

    it("accepts the normalized evaluation registrationId field", async () => {
        mocks.prisma.evaluation.findFirst.mockResolvedValue({
            id: "eval-1",
            courseId: "course-1",
            userId: "learner-1",
            registrationId: "reg-1",
            answers: { registrationId: "legacy-reg" },
        });

        const result = await getCertificateEligibility("learner-1", "enroll-1");

        expect(result.ok).toBe(true);
    });

    it("falls back to legacy answers.registrationId for older evaluations", async () => {
        mocks.prisma.evaluation.findFirst.mockResolvedValue({
            id: "eval-1",
            courseId: "course-1",
            userId: "learner-1",
            registrationId: null,
            answers: { registrationId: "reg-1" },
        });

        const result = await getCertificateEligibility("learner-1", "enroll-1");

        expect(result.ok).toBe(true);
    });
});
