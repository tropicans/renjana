import { prisma } from "@/lib/db";

export async function resolveInstructorAssignment(instructorUserId: string | null | undefined) {
    const normalizedId = typeof instructorUserId === "string" ? instructorUserId.trim() : "";

    if (!normalizedId) {
        return {
            instructorUserId: null,
            instructorName: null,
            instructorUser: null,
        };
    }

    const instructorUser = await prisma.user.findUnique({
        where: { id: normalizedId },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
        },
    });

    if (!instructorUser || instructorUser.role !== "INSTRUCTOR" || !instructorUser.isActive) {
        return null;
    }

    return {
        instructorUserId: instructorUser.id,
        instructorName: instructorUser.fullName,
        instructorUser,
    };
}
