import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireRole: vi.fn(),
    prisma: {
        enrollment: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireRole: mocks.requireRole,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { GET } from "@/app/api/manager/learners/route";

describe("GET /api/manager/learners", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns manager-wide learner enrollments and derived stats", async () => {
        mocks.requireRole.mockResolvedValue({
            user: { id: "manager-1", role: "MANAGER" },
            error: null,
        });
        mocks.prisma.enrollment.findMany.mockResolvedValue([
            {
                id: "enroll-1",
                userId: "learner-1",
                courseId: "course-1",
                status: "ACTIVE",
                completionPercentage: 25,
                enrolledAt: new Date("2025-01-01T00:00:00.000Z"),
                user: { id: "learner-1", fullName: "Learner One", email: "one@example.com" },
                course: { id: "course-1", title: "Course One" },
                certificate: null,
            },
            {
                id: "enroll-2",
                userId: "learner-2",
                courseId: "course-2",
                status: "COMPLETED",
                completionPercentage: 100,
                enrolledAt: new Date("2025-01-02T00:00:00.000Z"),
                user: { id: "learner-2", fullName: "Learner Two", email: "two@example.com" },
                course: { id: "course-2", title: "Course Two" },
                certificate: { id: "cert-1", issuedAt: new Date("2025-01-03T00:00:00.000Z") },
            },
        ]);

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.enrollments).toHaveLength(2);
        expect(body.stats).toEqual({
            totalLearners: 2,
            activeEnrollments: 1,
            completedEnrollments: 1,
            avgCompletion: 63,
        });
    });
});
