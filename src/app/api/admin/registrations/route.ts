import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

export async function GET() {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const registrations = await prisma.registration.findMany({
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
            documents: { select: { id: true, type: true, reviewStatus: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const registrationCoursePairs = registrations
        .filter((registration) => registration.event.courseId)
        .map((registration) => ({
            registrationId: registration.id,
            userId: registration.userId,
            courseId: registration.event.courseId!,
        }));

    const uniqueUserIds = Array.from(new Set(registrationCoursePairs.map((pair) => pair.userId)));
    const uniqueCourseIds = Array.from(new Set(registrationCoursePairs.map((pair) => pair.courseId)));

    const [enrollments, postTests, evaluations] = await Promise.all([
        registrationCoursePairs.length
            ? prisma.enrollment.findMany({
                where: {
                    OR: registrationCoursePairs.map((pair) => ({ userId: pair.userId, courseId: pair.courseId })),
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
                },
                select: { id: true, courseId: true, userId: true, answers: true },
            })
            : Promise.resolve([]),
    ]);

    const enrollmentMap = new Map(enrollments.map((enrollment) => [`${enrollment.userId}:${enrollment.courseId}`, enrollment]));
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
            `${evaluation.userId}:${evaluation.courseId}:${((evaluation.answers as { registrationId?: string } | null)?.registrationId ?? "")}`,
            evaluation,
        ])
    );

    const registrationsWithReadiness = registrations.map((registration) => {
        const courseId = registration.event.courseId;

        if (!courseId) {
            return {
                ...registration,
                certificateReadiness: {
                    status: "not_applicable",
                    label: "No linked course",
                    detail: "Event ini belum terhubung ke course.",
                    enrollmentId: null,
                    certificateUrl: null,
                },
            };
        }

        if (!registration.event.certificateEnabled) {
            return {
                ...registration,
                certificateReadiness: {
                    status: "not_enabled",
                    label: "Certificate off",
                    detail: "Event belum mengaktifkan certificate issuance.",
                    enrollmentId: null,
                    certificateUrl: null,
                },
            };
        }

        if (!["APPROVED", "ACTIVE", "COMPLETED"].includes(registration.status)) {
            return {
                ...registration,
                certificateReadiness: {
                    status: "registration_pending",
                    label: "Awaiting approval",
                    detail: "Registration harus disetujui sebelum jalur sertifikat aktif.",
                    enrollmentId: null,
                    certificateUrl: null,
                },
            };
        }

        const enrollment = enrollmentMap.get(`${registration.userId}:${courseId}`);
        if (!enrollment) {
            return {
                ...registration,
                certificateReadiness: {
                    status: "enrollment_missing",
                    label: "Enrollment missing",
                    detail: "Peserta belum memiliki enrollment pada course event.",
                    enrollmentId: null,
                    certificateUrl: null,
                },
            };
        }

        if (enrollment.certificate) {
            return {
                ...registration,
                certificateReadiness: {
                    status: "issued",
                    label: "Certificate issued",
                    detail: "Sertifikat sudah diterbitkan untuk peserta ini.",
                    enrollmentId: enrollment.id,
                    certificateUrl: enrollment.certificate.pdfUrl,
                },
            };
        }

        if (enrollment.status !== "COMPLETED") {
            return {
                ...registration,
                certificateReadiness: {
                    status: "learning_in_progress",
                    label: "Learning in progress",
                    detail: `Progress belajar ${Math.round(enrollment.completionPercentage)}% dan course belum selesai.`,
                    enrollmentId: enrollment.id,
                    certificateUrl: null,
                },
            };
        }

        if (registration.event.postTestEnabled) {
            const postTestId = postTestMap.get(courseId);
            const passedPostTest = postTestId ? passedPostTestMap.get(`${registration.userId}:${postTestId}`) : false;
            if (!postTestId || !passedPostTest) {
                return {
                    ...registration,
                    certificateReadiness: {
                        status: "post_test_pending",
                        label: "Post-test pending",
                        detail: "Peserta belum lulus POST_TEST untuk event ini.",
                        enrollmentId: enrollment.id,
                        certificateUrl: null,
                    },
                };
            }
        }

        if (registration.event.evaluationEnabled) {
            const evaluation = evaluationMap.get(`${registration.userId}:${courseId}:${registration.id}`);
            if (!evaluation) {
                return {
                    ...registration,
                    certificateReadiness: {
                        status: "evaluation_pending",
                        label: "Evaluation pending",
                        detail: "Peserta belum mengirim evaluation event.",
                        enrollmentId: enrollment.id,
                        certificateUrl: null,
                    },
                };
            }
        }

        return {
            ...registration,
            certificateReadiness: {
                status: "ready",
                label: "Ready to issue",
                detail: "Semua syarat utama terpenuhi, sertifikat bisa diterbitkan.",
                enrollmentId: enrollment.id,
                certificateUrl: null,
            },
        };
    });

    return NextResponse.json({ registrations: registrationsWithReadiness });
}
