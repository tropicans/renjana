import { prisma } from "@/lib/db";

function normalizeInstructorName(value: string | null | undefined) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
}

export async function getInstructorScope(userId: string | null | undefined, userName: string | null | undefined) {
    const instructorName = normalizeInstructorName(userName);
    const normalizedUserId = typeof userId === "string" ? userId.trim() : "";

    if (!normalizedUserId && !instructorName) {
        return {
            instructorName: null,
            courseIds: [] as string[],
            eventIds: [] as string[],
            classGroupIds: [] as string[],
            enrollmentPairs: [] as Array<{ userId: string; courseId: string }>,
        };
    }

    const registrations = await prisma.registration.findMany({
        where: {
            classGroup: normalizedUserId
                ? {
                    OR: [
                        { instructorUserId: normalizedUserId },
                        ...(instructorName ? [{
                            instructorUserId: null,
                            instructorName: {
                                equals: instructorName,
                                mode: "insensitive" as const,
                            },
                        }] : []),
                    ],
                }
                : {
                    instructorName: {
                        equals: instructorName,
                        mode: "insensitive",
                    },
                },
            event: {
                courseId: { not: null },
            },
        },
        select: {
            userId: true,
            eventId: true,
            classGroupId: true,
            event: {
                select: {
                    courseId: true,
                },
            },
        },
    });

    const courseIds = new Set<string>();
    const eventIds = new Set<string>();
    const classGroupIds = new Set<string>();
    const enrollmentPairsMap = new Map<string, { userId: string; courseId: string }>();

    for (const registration of registrations) {
        const courseId = registration.event.courseId;
        if (!courseId) continue;

        courseIds.add(courseId);
        eventIds.add(registration.eventId);
        if (registration.classGroupId) {
            classGroupIds.add(registration.classGroupId);
        }

        const key = `${registration.userId}:${courseId}`;
        if (!enrollmentPairsMap.has(key)) {
            enrollmentPairsMap.set(key, {
                userId: registration.userId,
                courseId,
            });
        }
    }

    return {
        instructorName,
        courseIds: Array.from(courseIds),
        eventIds: Array.from(eventIds),
        classGroupIds: Array.from(classGroupIds),
        enrollmentPairs: Array.from(enrollmentPairsMap.values()),
    };
}
