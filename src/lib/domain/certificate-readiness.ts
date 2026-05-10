import { prisma } from "@/lib/db";
import { getEvaluationRegistrationId } from "@/lib/evaluation-link";
import { isLearningAccessibleRegistration } from "@/lib/domain/registration-rules";

export const ADMIN_REGISTRATIONS_PAGE_SIZE = 25;

export type CertificateReadiness = {
    status:
        | "not_applicable"
        | "not_enabled"
        | "registration_pending"
        | "enrollment_missing"
        | "issued"
        | "learning_in_progress"
        | "post_test_pending"
        | "evaluation_pending"
        | "ready";
    label: string;
    detail: string;
    enrollmentId: string | null;
    certificateUrl: string | null;
};

export async function getAdminRegistrationsWithReadiness(page: number, pageSize = ADMIN_REGISTRATIONS_PAGE_SIZE) {
    const skip = (page - 1) * pageSize;

    const [registrations, total] = await Promise.all([
        prisma.registration.findMany({
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                event: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        category: true,
                        modality: true,
                        courseId: true,
                        certificateEnabled: true,
                        postTestEnabled: true,
                        evaluationEnabled: true,
                    },
                },
                classGroup: {
                    select: {
                        id: true,
                        name: true,
                        modality: true,
                    },
                },
                documents: { select: { id: true, type: true, reviewStatus: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.registration.count(),
    ]);

    const registrationPairs = registrations
        .filter((registration) => registration.event.courseId)
        .map((registration) => ({
            registrationId: registration.id,
            userId: registration.userId,
            courseId: registration.event.courseId!,
        }));

    const uniqueCourseIds = Array.from(new Set(registrationPairs.map((pair) => pair.courseId)));

    const [enrollments, postTests, evaluations] = await Promise.all([
        registrationPairs.length
            ? prisma.enrollment.findMany({
                where: {
                    OR: registrationPairs.map((pair) => ({
                        userId: pair.userId,
                        courseId: pair.courseId,
                    })),
                },
                select: {
                    id: true,
                    userId: true,
                    courseId: true,
                    status: true,
                    completionPercentage: true,
                    certificate: { select: { id: true, issuedAt: true, pdfUrl: true } },
                },
            })
            : Promise.resolve([]),
        uniqueCourseIds.length
            ? prisma.quiz.findMany({
                where: { courseId: { in: uniqueCourseIds }, type: "POST_TEST" },
                select: { id: true, courseId: true },
            })
            : Promise.resolve([]),
        registrationPairs.length
            ? prisma.evaluation.findMany({
                where: {
                    OR: registrationPairs.map((pair) => ({
                        courseId: pair.courseId,
                        userId: pair.userId,
                        OR: [
                            { registrationId: pair.registrationId },
                            { registrationId: null },
                        ],
                    })),
                },
                select: { id: true, courseId: true, userId: true, registrationId: true, answers: true },
            })
            : Promise.resolve([]),
    ]);

    const enrollmentMap = new Map(
        enrollments.map((enrollment) => [`${enrollment.userId}:${enrollment.courseId}`, enrollment])
    );
    const postTestMap = new Map(postTests.map((quiz) => [quiz.courseId, quiz.id]));

    const postTestAttemptPairs = registrationPairs
        .map((pair) => {
            const quizId = postTestMap.get(pair.courseId);
            if (!quizId) return null;

            return {
                quizId,
                userId: pair.userId,
            };
        })
        .filter((pair): pair is { quizId: string; userId: string } => Boolean(pair));

    const postTestAttempts = postTestAttemptPairs.length
        ? await prisma.quizAttempt.findMany({
            where: {
                OR: postTestAttemptPairs,
            },
            orderBy: [
                { userId: "asc" },
                { quizId: "asc" },
                { completedAt: "desc" },
                { startedAt: "desc" },
            ],
            distinct: ["userId", "quizId"],
            select: { quizId: true, userId: true, passed: true },
        })
        : [];

    const passedPostTestMap = new Map(
        postTestAttempts.map((attempt) => [`${attempt.userId}:${attempt.quizId}`, attempt.passed])
    );

    const evaluationMap = new Map(
        evaluations.map((evaluation) => [
            `${evaluation.userId}:${evaluation.courseId}:${getEvaluationRegistrationId(evaluation) ?? ""}`,
            evaluation,
        ])
    );

    const registrationsWithReadiness = registrations.map((registration) => {
        const courseId = registration.event.courseId;
        const postTestId = courseId ? postTestMap.get(courseId) ?? null : null;

        return {
            ...registration,
            certificateReadiness: getCertificateReadiness({
                registration,
                enrollment: courseId
                    ? enrollmentMap.get(`${registration.userId}:${courseId}`) ?? null
                    : null,
                postTestId,
                hasPassedPostTest: postTestId
                    ? Boolean(passedPostTestMap.get(`${registration.userId}:${postTestId}`))
                    : false,
                evaluation: courseId
                    ? evaluationMap.get(`${registration.userId}:${courseId}:${registration.id}`)
                        ?? evaluationMap.get(`${registration.userId}:${courseId}:`)
                        ?? null
                    : null,
            }),
        };
    });

    return {
        registrations: registrationsWithReadiness,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
    };
}

type RegistrationForReadiness = {
    id: string;
    userId: string;
    status: string;
    event: {
        courseId: string | null;
        certificateEnabled: boolean;
        postTestEnabled: boolean;
        evaluationEnabled: boolean;
    };
};

type EnrollmentForReadiness = {
    id: string;
    status: string;
    completionPercentage: number;
    certificate: { pdfUrl: string | null } | null;
};

export function getCertificateReadiness(input: {
    registration: RegistrationForReadiness;
    enrollment: EnrollmentForReadiness | null;
    postTestId: string | null;
    hasPassedPostTest: boolean;
    evaluation: { id: string } | null;
}): CertificateReadiness {
    const { registration, enrollment, postTestId, hasPassedPostTest, evaluation } = input;
    const courseId = registration.event.courseId;

    if (!courseId) {
        return {
            status: "not_applicable",
            label: "No linked course",
            detail: "Event ini belum terhubung ke course.",
            enrollmentId: null,
            certificateUrl: null,
        };
    }

    if (!registration.event.certificateEnabled) {
        return {
            status: "not_enabled",
            label: "Certificate off",
            detail: "Event belum mengaktifkan certificate issuance.",
            enrollmentId: null,
            certificateUrl: null,
        };
    }

    if (!isLearningAccessibleRegistration(registration.status)) {
        return {
            status: "registration_pending",
            label: "Awaiting approval",
            detail: "Registration harus disetujui sebelum jalur sertifikat aktif.",
            enrollmentId: null,
            certificateUrl: null,
        };
    }

    if (!enrollment) {
        return {
            status: "enrollment_missing",
            label: "Enrollment missing",
            detail: "Peserta belum memiliki enrollment pada course event.",
            enrollmentId: null,
            certificateUrl: null,
        };
    }

    if (enrollment.certificate) {
        return {
            status: "issued",
            label: "Certificate issued",
            detail: "Sertifikat sudah diterbitkan untuk peserta ini.",
            enrollmentId: enrollment.id,
            certificateUrl: enrollment.certificate.pdfUrl,
        };
    }

    if (enrollment.status !== "COMPLETED") {
        return {
            status: "learning_in_progress",
            label: "Learning in progress",
            detail: `Progress belajar ${Math.round(enrollment.completionPercentage)}% dan course belum selesai.`,
            enrollmentId: enrollment.id,
            certificateUrl: null,
        };
    }

    if (registration.event.postTestEnabled && (!postTestId || !hasPassedPostTest)) {
        return {
            status: "post_test_pending",
            label: "Post-test pending",
            detail: "Peserta belum lulus POST_TEST untuk event ini.",
            enrollmentId: enrollment.id,
            certificateUrl: null,
        };
    }

    if (registration.event.evaluationEnabled && !evaluation) {
        return {
            status: "evaluation_pending",
            label: "Evaluation pending",
            detail: "Peserta belum mengirim evaluation event.",
            enrollmentId: enrollment.id,
            certificateUrl: null,
        };
    }

    return {
        status: "ready",
        label: "Ready to issue",
        detail: "Semua syarat utama terpenuhi, sertifikat bisa diterbitkan.",
        enrollmentId: enrollment.id,
        certificateUrl: null,
    };
}
