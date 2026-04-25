import type { Prisma, EnrollmentStatus } from "@prisma/client";

type EnrollmentSyncInput = {
    userId: string;
    courseId: string;
    defaultStatus?: EnrollmentStatus;
};

type EnrollmentSyncClient = Pick<Prisma.TransactionClient, "enrollment">;

export async function ensureEnrollmentForCourse(
    tx: EnrollmentSyncClient,
    input: EnrollmentSyncInput,
) {
    return tx.enrollment.upsert({
        where: {
            userId_courseId: {
                userId: input.userId,
                courseId: input.courseId,
            },
        },
        update: {},
        create: {
            userId: input.userId,
            courseId: input.courseId,
            status: input.defaultStatus ?? "ACTIVE",
            completionPercentage: 0,
        },
    });
}
