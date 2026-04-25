import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    prisma: {
        enrollment: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        course: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireAuth: mocks.requireAuth,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { POST } from "@/app/api/enrollments/route";

describe("POST /api/enrollments", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireAuth.mockResolvedValue({
            user: { id: "learner-1", role: "LEARNER" },
            error: null,
        });
        mocks.prisma.enrollment.findUnique.mockResolvedValue(null);
    });

    it("rejects self-enrollment for courses linked to events", async () => {
        mocks.prisma.course.findUnique.mockResolvedValue({
            id: "course-1",
            events: [
                {
                    id: "event-1",
                    slug: "pkpa-batch-1",
                    title: "PKPA Batch 1",
                    status: "REGISTRATION_OPEN",
                },
            ],
        });

        const response = await POST(new Request("http://localhost/api/enrollments", {
            method: "POST",
            body: JSON.stringify({ courseId: "course-1" }),
            headers: { "Content-Type": "application/json" },
        }));

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({
            error: "This course requires event registration before enrollment",
            linkedEvent: {
                id: "event-1",
                slug: "pkpa-batch-1",
                title: "PKPA Batch 1",
                status: "REGISTRATION_OPEN",
            },
        });
        expect(mocks.prisma.enrollment.create).not.toHaveBeenCalled();
    });

    it("allows self-enrollment for standalone courses", async () => {
        mocks.prisma.course.findUnique.mockResolvedValue({
            id: "course-2",
            events: [],
        });
        mocks.prisma.enrollment.create.mockResolvedValue({
            id: "enroll-1",
            courseId: "course-2",
            userId: "learner-1",
            status: "ACTIVE",
            completionPercentage: 0,
            course: {
                id: "course-2",
                title: "Standalone Course",
                description: null,
                thumbnail: null,
            },
        });

        const response = await POST(new Request("http://localhost/api/enrollments", {
            method: "POST",
            body: JSON.stringify({ courseId: "course-2" }),
            headers: { "Content-Type": "application/json" },
        }));

        expect(response.status).toBe(201);
        await expect(response.json()).resolves.toEqual({
            enrollment: {
                id: "enroll-1",
                courseId: "course-2",
                userId: "learner-1",
                status: "ACTIVE",
                completionPercentage: 0,
                course: {
                    id: "course-2",
                    title: "Standalone Course",
                    description: null,
                    thumbnail: null,
                },
            },
        });
    });
});
