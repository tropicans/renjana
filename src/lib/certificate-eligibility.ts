import { prisma } from "@/lib/db";
import { getAccessibleRegistrationForCourse } from "@/lib/registration-access";

async function evaluateCertificateEligibility(enrollmentId: string, userId: string, requireOwnership: boolean) {
    const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
            user: { select: { fullName: true, email: true } },
            course: { select: { id: true, title: true } },
            certificate: true,
        },
    });

    if (!enrollment || (requireOwnership && enrollment.userId !== userId)) {
        return { ok: false as const, status: 404, error: "Enrollment not found", enrollment: null };
    }

    const { access, registration } = await getAccessibleRegistrationForCourse(userId, enrollment.courseId);
    const event = registration?.event ?? access.linkedEvent ?? null;

    if (event && !registration) {
        return { ok: false as const, status: 403, error: "Registration is required before a certificate can be issued", enrollment };
    }

    if (event && !access.allowed) {
        return { ok: false as const, status: 403, error: "Registration must be approved before a certificate can be issued", enrollment };
    }

    if (event?.certificateEnabled === false) {
        return { ok: false as const, status: 403, error: "Certificate is not enabled for this event", enrollment };
    }

    if (enrollment.status !== "COMPLETED") {
        return { ok: false as const, status: 400, error: "Course not yet completed", enrollment };
    }

    if (event?.postTestEnabled) {
        const postTest = await prisma.quiz.findFirst({
            where: { courseId: enrollment.courseId, type: "POST_TEST" },
            select: { id: true, passingScore: true },
        });

        if (!postTest) {
            return { ok: false as const, status: 400, error: "Post-test is enabled but no post-test quiz is configured", enrollment };
        }

        const latestPostTestAttempt = await prisma.quizAttempt.findFirst({
            where: { quizId: postTest.id, userId },
            orderBy: { completedAt: "desc" },
            select: { passed: true },
        });

        if (!latestPostTestAttempt?.passed) {
            return { ok: false as const, status: 400, error: "Post-test must be passed before a certificate can be issued", enrollment };
        }
    }

    if (event?.evaluationEnabled && registration) {
        const evaluation = await prisma.evaluation.findFirst({
            where: {
                courseId: enrollment.courseId,
                userId,
            },
            orderBy: { createdAt: "desc" },
        });

        const evaluationRegistrationId = (evaluation?.answers as { registrationId?: string } | null)?.registrationId;
        if (!evaluation || evaluationRegistrationId !== registration.id) {
            return { ok: false as const, status: 400, error: "Evaluation must be submitted before a certificate can be issued", enrollment };
        }
    }

    return {
        ok: true as const,
        enrollment,
        registration,
        event,
    };
}

export async function getCertificateEligibility(userId: string, enrollmentId: string) {
    return evaluateCertificateEligibility(enrollmentId, userId, true);
}

export async function getAdminCertificateEligibility(enrollmentId: string) {
    const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        select: { userId: true },
    });

    if (!enrollment) {
        return { ok: false as const, status: 404, error: "Enrollment not found", enrollment: null };
    }

    return evaluateCertificateEligibility(enrollmentId, enrollment.userId, false);
}
