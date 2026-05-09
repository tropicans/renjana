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

    const registrationCoursePairs = registrations
        .filter((registration) => registration.event.courseId)
        .map((registration) => ({
            registrationId: registration.id,
            userId: registration.userId,
            courseId: registration.event.courseId!,
        }));

    const uniqueUserIds = Array.from(new Set(registrationCoursePairs.map((pair) => pair.userId)));
    const uniqueCourseIds = Array.from(new Set(registrationCoursePairs.map((pair) => pair.courseId)));
    const registrationIds = registrations.map((registration) => registration.id);

    const [enrollments, postTests, evaluations] = await Promise.all([
        uniqueCourseIds.length && uniqueUserIds.length
            ? prisma.enrollment.findMany({
                where: {
                    userId: { in: uniqueUserIds },
                    courseId: { in: uniqueCourseIds },
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
        uniqueCourseIds.length && uniqueUserIds.length
            ? prisma.evaluation.findMany({
                where: {
                    courseId: { in: uniqueCourseIds },
                    userId: { in: uniqueUserIds },
                    OR: [
                        { registrationId: { in: registrationIds } },
                        { registrationId: null },
                    ],
                },
                select: { id: true, courseId: true, userId: true, registrationId: true, answers: true },
            })
            : Promise.resolve([]),
    ]);

    const enrollmentMap = new Map(
        enrollments.map((enrollment) => [`${enrollment.userId}:${enrollment.courseId}`, enrollment])
    );
    const postTestMap = new Map(postTests.map((quiz) => [quiz.courseId, quiz.id]));

    const postTestAttempts = postTests.length && uniqueUserIds.length
        ? await prisma.quizAttempt.findMany({
            where: {
                quizId: { in: postTests.map((quiz) => quiz.id) },
                userId: { in: uniqueUserIds },
            },
            orderBy: [{ completedAt: "desc" }, { startedAt: "desc" }],
            select: { quizId: true, userId: true, passed: true },
        })
        : [];

    const passedPostTestMap = new Map<string, boolean>();
    for (const attempt of postTestAttempts) {
        const key = `${attempt.userId}:${attempt.quizId}`;
        if (!passedPostTestMap.has(key)) {
            passedPostTestMap.set(key, attempt.passed);
        }
    }

    const evaluationMap = new Map(
        evaluations.map((evaluation) => [
            `${evaluation.userId}:${evaluation.courseId}:${getEvaluationRegistrationId(evaluation) ?? ""}`,
            evaluation,
        ])
    );

    const registrationsWithReadiness = registrations.map((registration) => ({
        ...registration,
        certificateReadiness: getCertificateReadiness({
            registration,
            enrollment: registration.event.courseId
                ? enrollmentMap.get(`${registration.userId}:${registration.event.courseId}`) ?? null
                : null,
            postTestId: registration.event.courseId ? postTestMap.get(registration.event.courseId) ?? null : null,
            hasPassedPostTest: registration.event.courseId
                ? Boolean(postTestMap.get(registration.event.courseId) && passedPostTestMap.get(`${registration.userId}:${postTestMap.get(registration.event.courseId)}`))
                : false,
            evaluation: registration.event.courseId
                ? evaluationMap.get(`${registration.userId}:${registration.event.courseId}:${registration.id}`) ?? null
                : null,
        }),
    }));

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
