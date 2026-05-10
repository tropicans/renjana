import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    prisma: {
        event: {
            findMany: vi.fn(),
        },
        registration: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
        },
    },
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { getAccessibleRegistrationForCourse, getCourseLifecycleAccess } from "@/lib/registration-access";

describe("registration access selection", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("uses most recent linked registration by default for multi-event courses", async () => {
        mocks.prisma.event.findMany.mockResolvedValue([
            {
                id: "event-1",
                title: "Event 1",
                slug: "event-1",
                status: "REGISTRATION_OPEN",
                evaluationEnabled: true,
                certificateEnabled: true,
                postTestEnabled: false,
            },
            {
                id: "event-2",
                title: "Event 2",
                slug: "event-2",
                status: "REGISTRATION_OPEN",
                evaluationEnabled: true,
                certificateEnabled: true,
                postTestEnabled: false,
            },
        ]);
        mocks.prisma.registration.findMany.mockResolvedValue([
            {
                id: "reg-new",
                status: "SUBMITTED",
                event: {
                    id: "event-2",
                    title: "Event 2",
                    slug: "event-2",
                    status: "REGISTRATION_OPEN",
                    evaluationEnabled: true,
                    certificateEnabled: true,
                    postTestEnabled: false,
                },
            },
            {
                id: "reg-old",
                status: "APPROVED",
                event: {
                    id: "event-1",
                    title: "Event 1",
                    slug: "event-1",
                    status: "LEARNING_ACTIVE",
                    evaluationEnabled: true,
                    certificateEnabled: true,
                    postTestEnabled: false,
                },
            },
        ]);

        const result = await getCourseLifecycleAccess("learner-1", "course-1");

        expect(result.allowed).toBe(false);
        expect(result.requiresRegistration).toBe(true);
        expect(result.registration?.id).toBe("reg-new");
        expect(result.linkedEvent?.id).toBe("event-2");
    });

    it("allows caller to select older approved registration explicitly", async () => {
        mocks.prisma.event.findMany.mockResolvedValue([
            {
                id: "event-1",
                title: "Event 1",
                slug: "event-1",
                status: "LEARNING_ACTIVE",
                evaluationEnabled: true,
                certificateEnabled: true,
                postTestEnabled: false,
            },
            {
                id: "event-2",
                title: "Event 2",
                slug: "event-2",
                status: "REGISTRATION_OPEN",
                evaluationEnabled: true,
                certificateEnabled: true,
                postTestEnabled: false,
            },
        ]);
        mocks.prisma.registration.findMany.mockResolvedValue([
            {
                id: "reg-new",
                status: "SUBMITTED",
                event: {
                    id: "event-2",
                    title: "Event 2",
                    slug: "event-2",
                    status: "REGISTRATION_OPEN",
                    evaluationEnabled: true,
                    certificateEnabled: true,
                    postTestEnabled: false,
                },
            },
        ]);
        mocks.prisma.registration.findFirst.mockResolvedValue({
            id: "reg-old",
            status: "APPROVED",
            event: {
                id: "event-1",
                title: "Event 1",
                slug: "event-1",
                status: "LEARNING_ACTIVE",
                evaluationEnabled: true,
                certificateEnabled: true,
                postTestEnabled: false,
            },
        });

        const result = await getAccessibleRegistrationForCourse("learner-1", "course-1", "reg-old");

        expect(result.access.allowed).toBe(true);
        expect(result.registration?.id).toBe("reg-old");
        expect(result.access.registration?.id).toBe("reg-old");
        expect(result.access.linkedEvent?.id).toBe("event-1");
    });
});
