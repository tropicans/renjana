import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/dashboard/stats — role-based dashboard statistics
export async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const role = user!.role;

    if (role === "ADMIN") {
        const [totalUsers, totalCourses, totalEvents, totalEnrollments, activeEnrollments, completedEnrollments] =
            await Promise.all([
                prisma.user.count(),
                prisma.course.count(),
                prisma.event.count(),
                prisma.enrollment.count(),
                prisma.enrollment.count({ where: { status: "ACTIVE" } }),
                prisma.enrollment.count({ where: { status: "COMPLETED" } }),
            ]);

        return NextResponse.json({
            role,
            totalUsers,
            totalCourses,
            totalEvents,
            totalEnrollments,
            activeEnrollments,
            completedEnrollments,
        });
    }

    if (role === "LEARNER") {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user!.id },
            include: {
                course: {
                    include: {
                        modules: { include: { lessons: { select: { durationMin: true } } } },
                    },
                },
            },
        });

        const activeCourses = enrollments.filter((e) => e.status === "ACTIVE").length;
        const completedCourses = enrollments.filter((e) => e.status === "COMPLETED").length;
        const totalHoursLearned = enrollments.reduce((sum, e) => {
            const totalMin = e.course.modules.reduce(
                (ms, m) => ms + m.lessons.reduce((ls, l) => ls + (l.durationMin ?? 0), 0),
                0
            );
            return sum + (totalMin * (e.completionPercentage / 100)) / 60;
        }, 0);

        return NextResponse.json({
            role,
            enrolledCourses: enrollments.length,
            activeCourses,
            completedCourses,
            totalHoursLearned: Math.round(totalHoursLearned * 10) / 10,
        });
    }

    if (role === "INSTRUCTOR") {
        const totalLearners = await prisma.enrollment.count();
        const activeLearners = await prisma.enrollment.count({ where: { status: "ACTIVE" } });
        const totalCourses = await prisma.course.count();

        return NextResponse.json({
            role,
            totalCourses,
            totalLearners,
            activeLearners,
        });
    }

    if (role === "MANAGER") {
        const [
            totalLearners,
            totalEnrollments,
            completedEnrollments,
            totalCourses,
            totalEvents,
            enrollments,
            modalityEvents,
            participantModes,
            recentRegistrations,
        ] = await Promise.all([
            prisma.user.count({ where: { role: "LEARNER" } }),
            prisma.enrollment.count(),
            prisma.enrollment.count({ where: { status: "COMPLETED" } }),
            prisma.course.count(),
            prisma.event.count(),
            prisma.enrollment.findMany({
                select: { completionPercentage: true },
            }),
            prisma.event.findMany({
                select: { modality: true },
            }),
            prisma.registration.findMany({
                select: { participantMode: true },
            }),
            prisma.registration.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { fullName: true } },
                    event: { select: { title: true } },
                },
            }),
        ]);

        const avgCompletion = enrollments.length > 0
            ? Math.round(enrollments.reduce((sum, enrollment) => sum + enrollment.completionPercentage, 0) / enrollments.length)
            : 0;

        const onlinePrograms = modalityEvents.filter((event) => event.modality === "ONLINE").length;
        const offlinePrograms = modalityEvents.filter((event) => event.modality === "OFFLINE").length;
        const hybridPrograms = modalityEvents.filter((event) => event.modality === "HYBRID").length;

        const onlineParticipants = participantModes.filter((registration) => registration.participantMode === "ONLINE").length;
        const offlineParticipants = participantModes.filter((registration) => registration.participantMode === "OFFLINE").length;

        return NextResponse.json({
            role,
            totalLearners,
            totalCourses,
            totalEvents,
            totalEnrollments,
            completedEnrollments,
            avgCompletion,
            completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
            onlinePrograms,
            offlinePrograms,
            hybridPrograms,
            onlineParticipants,
            offlineParticipants,
            hybridParticipants: completedEnrollments,
            recentRegistrations: recentRegistrations.map((registration) => ({
                id: registration.id,
                createdAt: registration.createdAt,
                user: { fullName: registration.user.fullName },
                event: { title: registration.event.title },
            })),
        });
    }

    if (role === "FINANCE") {
        const [registrations, latestPayments] = await Promise.all([
            prisma.registration.findMany({
                select: {
                    id: true,
                    totalFee: true,
                    paymentStatus: true,
                },
            }),
            prisma.registrationPayment.findMany({
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    registrationId: true,
                    amount: true,
                    status: true,
                    createdAt: true,
                    paidAt: true,
                },
            }),
        ]);

        const latestPaymentMap = new Map<string, { amount: number; status: string; createdAt: Date; paidAt: Date | null }>();
        for (const payment of latestPayments) {
            if (!latestPaymentMap.has(payment.registrationId)) {
                latestPaymentMap.set(payment.registrationId, payment);
            }
        }

        const totalRegistrations = registrations.length;
        const pendingPayments = registrations.filter((registration) => ["PENDING", "UPLOADED"].includes(registration.paymentStatus)).length;
        const verifiedPayments = registrations.filter((registration) => registration.paymentStatus === "VERIFIED").length;
        const rejectedPayments = registrations.filter((registration) => registration.paymentStatus === "REJECTED").length;
        const totalBilled = registrations.reduce((sum, registration) => sum + (registration.totalFee ?? 0), 0);
        const totalCollected = registrations.reduce((sum, registration) => (
            registration.paymentStatus === "VERIFIED" ? sum + (registration.totalFee ?? 0) : sum
        ), 0);

        return NextResponse.json({
            role,
            totalRegistrations,
            pendingPayments,
            verifiedPayments,
            rejectedPayments,
            totalBilled,
            totalCollected,
            recentTransactions: registrations
                .map((registration) => ({
                    id: registration.id,
                    totalFee: registration.totalFee ?? 0,
                    paymentStatus: registration.paymentStatus,
                    latestPayment: latestPaymentMap.get(registration.id) ?? null,
                }))
                .sort((a, b) => {
                    const aDate = a.latestPayment?.createdAt?.getTime() ?? 0;
                    const bDate = b.latestPayment?.createdAt?.getTime() ?? 0;
                    return bDate - aDate;
                })
                .slice(0, 5),
        });
    }

    return NextResponse.json({ role, message: "No stats available" });
}
