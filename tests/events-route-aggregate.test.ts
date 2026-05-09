import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    prisma: {
        event: {
            findMany: vi.fn(),
        },
        lesson: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { GET } from "@/app/api/events/route";

describe("GET /api/events aggregate stats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("computes lesson counts and duration from batched lesson query", async () => {
        mocks.prisma.event.findMany.mockResolvedValue([
            {
                id: "event-1",
                courseId: "course-1",
                slug: "event-1",
                title: "Event One",
                category: "CAT",
                summary: null,
                description: null,
                modality: "ONLINE",
                status: "PUBLISHED",
                location: null,
                platform: null,
                registrationStart: null,
                registrationEnd: null,
                eventStart: null,
                eventEnd: null,
                scheduleSummary: null,
                contactName: null,
                contactPhone: null,
                termsSummary: null,
                refundPolicySummary: null,
                registrationFee: null,
                onlineTuitionFee: null,
                offlineTuitionFee: null,
                alumniRegistrationFee: null,
                learningEnabled: true,
                preTestEnabled: false,
                postTestEnabled: false,
                evaluationEnabled: false,
                certificateEnabled: true,
                isFeatured: true,
                createdAt: new Date("2025-01-01T00:00:00.000Z"),
                updatedAt: new Date("2025-01-01T00:00:00.000Z"),
                _count: { registrations: 3 },
                course: {
                    id: "course-1",
                    title: "Course One",
                },
            },
            {
                id: "event-2",
                courseId: null,
                slug: "event-2",
                title: "Event Two",
                category: "CAT",
                summary: null,
                description: null,
                modality: "OFFLINE",
                status: "PUBLISHED",
                location: null,
                platform: null,
                registrationStart: null,
                registrationEnd: null,
                eventStart: null,
                eventEnd: null,
                scheduleSummary: null,
                contactName: null,
                contactPhone: null,
                termsSummary: null,
                refundPolicySummary: null,
                registrationFee: null,
                onlineTuitionFee: null,
                offlineTuitionFee: null,
                alumniRegistrationFee: null,
                learningEnabled: false,
                preTestEnabled: false,
                postTestEnabled: false,
                evaluationEnabled: false,
                certificateEnabled: false,
                isFeatured: false,
                createdAt: new Date("2025-01-02T00:00:00.000Z"),
                updatedAt: new Date("2025-01-02T00:00:00.000Z"),
                _count: { registrations: 1 },
                course: null,
            },
        ]);
        mocks.prisma.lesson.findMany.mockResolvedValue([
            { durationMin: 30, module: { courseId: "course-1" } },
            { durationMin: 45, module: { courseId: "course-1" } },
            { durationMin: null, module: { courseId: "course-1" } },
        ]);

        const response = await GET(new Request("http://localhost/api/events?featured=true"));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(mocks.prisma.lesson.findMany).toHaveBeenCalledWith({
            where: {
                module: {
                    courseId: { in: ["course-1"] },
                },
            },
            select: {
                durationMin: true,
                module: {
                    select: {
                        courseId: true,
                    },
                },
            },
        });
        expect(body.events.map((event: { id: string; totalLessons: number; totalDurationMin: number }) => ({
            id: event.id,
            totalLessons: event.totalLessons,
            totalDurationMin: event.totalDurationMin,
        }))).toEqual([
            { id: "event-1", totalLessons: 3, totalDurationMin: 75 },
            { id: "event-2", totalLessons: 0, totalDurationMin: 0 },
        ]);
    });

    it("skips lesson query when no event has linked course", async () => {
        mocks.prisma.event.findMany.mockResolvedValue([
            {
                id: "event-1",
                courseId: null,
                slug: "event-1",
                title: "Event One",
                category: "CAT",
                summary: null,
                description: null,
                modality: "ONLINE",
                status: "PUBLISHED",
                location: null,
                platform: null,
                registrationStart: null,
                registrationEnd: null,
                eventStart: null,
                eventEnd: null,
                scheduleSummary: null,
                contactName: null,
                contactPhone: null,
                termsSummary: null,
                refundPolicySummary: null,
                registrationFee: null,
                onlineTuitionFee: null,
                offlineTuitionFee: null,
                alumniRegistrationFee: null,
                learningEnabled: false,
                preTestEnabled: false,
                postTestEnabled: false,
                evaluationEnabled: false,
                certificateEnabled: false,
                isFeatured: false,
                createdAt: new Date("2025-01-01T00:00:00.000Z"),
                updatedAt: new Date("2025-01-01T00:00:00.000Z"),
                _count: { registrations: 0 },
                course: null,
            },
        ]);

        const response = await GET(new Request("http://localhost/api/events"));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(mocks.prisma.lesson.findMany).not.toHaveBeenCalled();
        expect(body.events[0].totalLessons).toBe(0);
        expect(body.events[0].totalDurationMin).toBe(0);
    });
});
