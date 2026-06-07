import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { requireApiAuthPolicy } from "@/lib/route-policy";
import { haversineDistance } from "@/lib/geo";

// POST /api/attendance — check-in with optional GPS
export async function POST(req: Request) {
    const policy = await requireApiAuthPolicy(req, { sameOrigin: true });
    if (!policy.ok) return policy.response;

    const { user } = policy;

    const { lessonId, courseId, latitude, longitude, notes } = await req.json();
    if (!lessonId && !courseId) {
        return NextResponse.json({ error: "lessonId or courseId is required" }, { status: 400 });
    }

    // Resolve lessonId: if courseId provided, find first lesson of the course
    let resolvedLessonId = lessonId;
    if (!resolvedLessonId && courseId) {
        const firstLesson = await prisma.lesson.findFirst({
            where: { module: { courseId } },
            orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
        });
        if (!firstLesson) {
            return NextResponse.json({ error: "No lessons found for this course" }, { status: 404 });
        }
        resolvedLessonId = firstLesson.id;
    }

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
        where: { id: resolvedLessonId },
        include: { module: { include: { course: true } } }
    });
    if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // GPS validation for offline/hybrid events
    const courseType = lesson.module?.course?.type;
    if (courseType === "OFFLINE_EVENT" || courseType === "HYBRID") {
        if (latitude == null || longitude == null) {
            return NextResponse.json(
                { error: "Akses lokasi (GPS) diperlukan untuk absensi luring" },
                { status: 400 }
            );
        }

        const CHECK_IN_TARGET_LAT = -6.175392;
        const CHECK_IN_TARGET_LNG = 106.827153;
        const CHECK_IN_MAX_RADIUS_KM = 0.5;

        const distanceKm = haversineDistance(
            latitude,
            longitude,
            CHECK_IN_TARGET_LAT,
            CHECK_IN_TARGET_LNG
        );

        if (distanceKm > CHECK_IN_MAX_RADIUS_KM) {
            return NextResponse.json(
                { error: "Di luar jangkauan" },
                { status: 403 }
            );
        }
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
        data: {
            userId: user!.id,
            lessonId: resolvedLessonId,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            notes: notes ?? null,
        },
        include: {
            lesson: { select: { title: true, type: true } },
        },
    });

    // Auto-complete offline events if the user checks in
    if (lesson.module?.course?.type === "OFFLINE_EVENT") {
        await prisma.enrollment.updateMany({
            where: {
                userId: user!.id,
                courseId: lesson.module.course.id,
            },
            data: {
                status: "COMPLETED",
                completionPercentage: 100,
                completedAt: new Date(),
            },
        });
    }

    return NextResponse.json({ attendance }, { status: 201 });
}

// GET /api/attendance — list attendance records
export async function GET(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    const role = user!.role;

    // Instructors/Admins can see attendance records across the organization
    if (role === "INSTRUCTOR" || role === "ADMIN") {
        const records = await prisma.attendance.findMany({
            where: lessonId ? { lessonId } : {},
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                lesson: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        module: { select: { title: true, course: { select: { title: true } } } },
                    },
                },
            },
            orderBy: { checkedAt: "desc" },
        });
        return NextResponse.json({ attendances: records });
    }

    // Learners see their own attendance
    const records = await prisma.attendance.findMany({
        where: { userId: user!.id },
        include: {
            lesson: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    module: { select: { title: true, course: { select: { title: true } } } },
                },
            },
        },
        orderBy: { checkedAt: "desc" },
    });

    return NextResponse.json({ attendances: records });
}
