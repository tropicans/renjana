import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    getInstructorScope: vi.fn(),
    prisma: {
        enrollment: {
            findMany: vi.fn(),
        },
        attendance: {
            count: vi.fn(),
        },
        module: {
            create: vi.fn(),
        },
        course: {
            count: vi.fn(),
            findMany: vi.fn(),
        },
        evidence: {
            count: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireAuth: mocks.requireAuth,
}));

vi.mock("@/lib/instructor-scope", () => ({
    getInstructorScope: mocks.getInstructorScope,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { GET as learnersGet } from "@/app/api/instructor/learners/route";
import { GET as statsGet } from "@/app/api/instructor/stats/route";
import { POST as modulesPost } from "@/app/api/instructor/modules/route";

describe("instructor permission scoping", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns only scoped enrollments for instructor learners", async () => {
        mocks.requireAuth.mockResolvedValue({
            user: { id: "inst-1", role: "INSTRUCTOR", name: "Instructor One" },
            error: null,
        });
        mocks.getInstructorScope.mockResolvedValue({
            courseIds: ["course-1"],
            eventIds: ["event-1"],
            classGroupIds: ["group-1"],
            enrollmentPairs: [{ userId: "learner-1", courseId: "course-1" }],
        });
        mocks.prisma.enrollment.findMany.mockResolvedValue([
            {
                id: "enroll-1",
                userId: "learner-1",
                courseId: "course-1",
                status: "ACTIVE",
                completionPercentage: 80,
                enrolledAt: new Date("2025-01-01T00:00:00.000Z"),
                user: { id: "learner-1", fullName: "Learner One", email: "learner@example.com" },
                course: { id: "course-1", title: "Course One" },
                certificate: null,
            },
        ]);

        const response = await learnersGet();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(mocks.prisma.enrollment.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                OR: [{ userId: "learner-1", courseId: "course-1" }],
            },
        }));
        expect(body.stats.totalLearners).toBe(1);
        expect(body.enrollments).toHaveLength(1);
    });

    it("returns zero evidence and scoped aggregates for instructor stats", async () => {
        mocks.requireAuth.mockResolvedValue({
            user: { id: "inst-1", role: "INSTRUCTOR", name: "Instructor One" },
            error: null,
        });
        mocks.getInstructorScope.mockResolvedValue({
            courseIds: ["course-1"],
            eventIds: ["event-1"],
            classGroupIds: ["group-1"],
            enrollmentPairs: [{ userId: "learner-1", courseId: "course-1" }],
        });
        mocks.prisma.enrollment.findMany.mockResolvedValue([
            {
                id: "enroll-1",
                userId: "learner-1",
                courseId: "course-1",
                status: "COMPLETED",
                completionPercentage: 100,
                enrolledAt: new Date("2025-01-01T00:00:00.000Z"),
                user: { fullName: "Learner One" },
                course: { id: "course-1", title: "Course One" },
            },
        ]);
        mocks.prisma.attendance.count.mockResolvedValue(4);

        const response = await statsGet();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.stats.totalCourses).toBe(1);
        expect(body.stats.totalEnrollments).toBe(1);
        expect(body.stats.completedEnrollments).toBe(1);
        expect(body.stats.totalAttendances).toBe(4);
        expect(body.stats.totalEvidences).toBe(0);
    });

    it("blocks instructor module creation outside scoped courses", async () => {
        mocks.requireAuth.mockResolvedValue({
            user: { id: "inst-1", role: "INSTRUCTOR", name: "Instructor One" },
            error: null,
        });
        mocks.getInstructorScope.mockResolvedValue({
            courseIds: ["course-1"],
            eventIds: ["event-1"],
            classGroupIds: ["group-1"],
            enrollmentPairs: [{ userId: "learner-1", courseId: "course-1" }],
        });

        const response = await modulesPost(new Request("http://localhost/api/instructor/modules", {
            method: "POST",
            body: JSON.stringify({
                courseId: "course-2",
                title: "Unauthorized Module",
                order: 1,
            }),
            headers: { "Content-Type": "application/json" },
        }));

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
        expect(mocks.prisma.module.create).not.toHaveBeenCalled();
    });
});
