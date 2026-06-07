import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireApiAuthPolicy: vi.fn(),
    requireAuth: vi.fn(),
    prisma: {
        lesson: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
        },
        attendance: {
            create: vi.fn(),
        },
        enrollment: {
            updateMany: vi.fn(),
        },
    },
}));

function withOrigin(init?: RequestInit) {
    const headers = new Headers(init?.headers);
    headers.set("Origin", "http://localhost");
    return { ...init, headers };
}

vi.mock("@/lib/route-policy", () => ({
    requireApiAuthPolicy: mocks.requireApiAuthPolicy,
}));

vi.mock("@/lib/auth-utils", () => ({
    requireAuth: mocks.requireAuth,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { POST } from "@/app/api/attendance/route";

describe("POST /api/attendance", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "learner-1", email: "learner@test.com", name: "Test Learner", role: "LEARNER" },
        });
        mocks.prisma.lesson.findUnique.mockResolvedValue({
            id: "lesson-1",
            module: {
                course: {
                    id: "course-1",
                    type: "OFFLINE_EVENT",
                },
            },
        });
        mocks.prisma.attendance.create.mockResolvedValue({
            id: "att-1",
            userId: "learner-1",
            lessonId: "lesson-1",
            latitude: -6.175392,
            longitude: 106.827153,
            notes: null,
            lesson: {
                title: "Test Lesson",
                type: "OFFLINE_EVENT",
            },
        });
        mocks.prisma.enrollment.updateMany.mockResolvedValue({
            count: 1,
        });
    });

    it("returns 400 when lessonId and courseId both missing", async () => {
        const response = await POST(
            new Request("http://localhost/api/attendance", {
                method: "POST",
                headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
                body: JSON.stringify({}),
            })
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: "lessonId or courseId is required",
        });
        expect(mocks.prisma.lesson.findUnique).not.toHaveBeenCalled();
    });

    it("returns 400 when GPS missing for OFFLINE_EVENT", async () => {
        const response = await POST(
            new Request("http://localhost/api/attendance", {
                method: "POST",
                headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
                body: JSON.stringify({ lessonId: "lesson-1" }),
            })
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: "Akses lokasi (GPS) diperlukan untuk absensi luring",
        });
        expect(mocks.prisma.attendance.create).not.toHaveBeenCalled();
    });

    it("returns 403 when GPS outside 500m radius for OFFLINE_EVENT", async () => {
        const response = await POST(
            new Request("http://localhost/api/attendance", {
                method: "POST",
                headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
                body: JSON.stringify({
                    lessonId: "lesson-1",
                    latitude: -6.2,
                    longitude: 106.8,
                }),
            })
        );

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({
            error: "Di luar jangkauan",
        });
        expect(mocks.prisma.attendance.create).not.toHaveBeenCalled();
    });

    it("returns 201 when GPS within 500m radius for OFFLINE_EVENT", async () => {
        const response = await POST(
            new Request("http://localhost/api/attendance", {
                method: "POST",
                headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
                body: JSON.stringify({
                    lessonId: "lesson-1",
                    latitude: -6.175392,
                    longitude: 106.827153,
                }),
            })
        );

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.attendance.id).toBe("att-1");
        expect(mocks.prisma.attendance.create).toHaveBeenCalled();
        expect(mocks.prisma.enrollment.updateMany).toHaveBeenCalled();
    });

    it("returns 201 for ONLINE course without GPS", async () => {
        mocks.prisma.lesson.findUnique.mockResolvedValue({
            id: "lesson-1",
            module: {
                course: {
                    id: "course-1",
                    type: "ONLINE",
                },
            },
        });

        const response = await POST(
            new Request("http://localhost/api/attendance", {
                method: "POST",
                headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
                body: JSON.stringify({ lessonId: "lesson-1" }),
            })
        );

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.attendance.id).toBe("att-1");
        expect(mocks.prisma.attendance.create).toHaveBeenCalled();
        // Online course doesn't trigger auto-complete logic
        expect(mocks.prisma.enrollment.updateMany).not.toHaveBeenCalled();
    });

    it("returns 400 when GPS missing for HYBRID course", async () => {
        mocks.prisma.lesson.findUnique.mockResolvedValue({
            id: "lesson-1",
            module: {
                course: {
                    id: "course-1",
                    type: "HYBRID",
                },
            },
        });

        const response = await POST(
            new Request("http://localhost/api/attendance", {
                method: "POST",
                headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
                body: JSON.stringify({ lessonId: "lesson-1" }),
            })
        );

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: "Akses lokasi (GPS) diperlukan untuk absensi luring",
        });
        expect(mocks.prisma.attendance.create).not.toHaveBeenCalled();
    });

    it("returns 201 for HYBRID course with valid GPS", async () => {
        mocks.prisma.lesson.findUnique.mockResolvedValue({
            id: "lesson-1",
            module: {
                course: {
                    id: "course-1",
                    type: "HYBRID",
                },
            },
        });

        const response = await POST(
            new Request("http://localhost/api/attendance", {
                method: "POST",
                headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
                body: JSON.stringify({
                    lessonId: "lesson-1",
                    latitude: -6.175392,
                    longitude: 106.827153,
                }),
            })
        );

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.attendance.id).toBe("att-1");
        expect(mocks.prisma.attendance.create).toHaveBeenCalled();
    });
});
