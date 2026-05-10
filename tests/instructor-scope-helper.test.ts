import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    prisma: {
        classGroup: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { getInstructorScope } from "@/lib/instructor-scope";

describe("getInstructorScope", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("prefers instructorUserId and falls back to instructorName only for legacy rows", async () => {
        mocks.prisma.classGroup.findMany.mockResolvedValue([
            {
                id: "group-1",
                eventId: "event-1",
                event: { courseId: "course-1" },
                registrations: [{ userId: "learner-1" }],
            },
        ]);

        const scope = await getInstructorScope("inst-1", "Instructor One");

        expect(mocks.prisma.classGroup.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                OR: [
                    { instructorUserId: "inst-1" },
                    {
                        instructorUserId: null,
                        instructorName: {
                            equals: "Instructor One",
                            mode: "insensitive",
                        },
                    },
                ],
            }),
        }));
        expect(scope.courseIds).toEqual(["course-1"]);
        expect(scope.classGroupIds).toEqual(["group-1"]);
    });

    it("returns empty scope when neither user id nor user name is available", async () => {
        const scope = await getInstructorScope(null, null);

        expect(scope.courseIds).toEqual([]);
        expect(mocks.prisma.classGroup.findMany).not.toHaveBeenCalled();
    });
});
