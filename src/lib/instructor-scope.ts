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

    const classGroups = await prisma.classGroup.findMany({
        where: normalizedUserId
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
                event: {
                    courseId: { not: null },
                },
            }
            : {
                instructorName: {
                    equals: instructorName,
                    mode: "insensitive",
                },
                event: {
                    courseId: { not: null },
                },
            },
        select: {
            id: true,
            eventId: true,
            event: {
                select: {
                    courseId: true,
                },
            },
            registrations: {
                select: {
                    userId: true,
                },
            },
        },
    });

    const courseIds = new Set<string>();
    const eventIds = new Set<string>();
    const classGroupIds = new Set<string>();
    const enrollmentPairsMap = new Map<string, { userId: string; courseId: string }>();

    for (const classGroup of classGroups) {
        const courseId = classGroup.event.courseId;
        if (!courseId) continue;

        courseIds.add(courseId);
        eventIds.add(classGroup.eventId);
        classGroupIds.add(classGroup.id);

        for (const registration of classGroup.registrations) {
            const key = `${registration.userId}:${courseId}`;
            if (!enrollmentPairsMap.has(key)) {
                enrollmentPairsMap.set(key, {
                    userId: registration.userId,
                    courseId,
                });
            }
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
