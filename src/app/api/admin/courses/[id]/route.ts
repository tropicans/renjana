import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { collectManagedLessonMaterialUrls, deleteManagedLessonMaterialUrls } from "@/lib/lesson-material-storage";

type ModuleInput = {
    title?: string;
    order?: number;
    lessons?: LessonInput[];
};

type LessonInput = {
    title?: string;
    type?: string;
    contentUrl?: string | null;
    materialFileName?: string | null;
    materialFileType?: string | null;
    materialFileSize?: number | null;
    durationMin?: number | string | null;
    order?: number;
};

type NormalizedLesson = {
    title: string;
    type: string;
    contentUrl: string | null;
    materialFileName: string | null;
    materialFileType: string | null;
    materialFileSize: number | null;
    durationMin: number | null;
    order: number;
};

type NormalizedModule = {
    title: string;
    order: number;
    lessons: NormalizedLesson[];
};

// GET /api/admin/courses/:id — get course detail
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            modules: {
                include: { lessons: true },
                orderBy: { order: "asc" },
            },
            enrollments: {
                include: { user: { select: { id: true, fullName: true, email: true } } },
                orderBy: { enrolledAt: "desc" },
            },
        },
    });

    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
}

// PUT /api/admin/courses/:id — update course
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { user, error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const { title, description, status, modules } = await req.json();

    const existingCourse = await prisma.course.findUnique({
        where: { id },
        select: {
            title: true,
            modules: {
                select: {
                    title: true,
                    lessons: {
                        select: { id: true, title: true, contentUrl: true, materialFileName: true },
                    },
                },
            },
        },
    });

    if (!existingCourse) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const normalizedModules: NormalizedModule[] | null = Array.isArray(modules)
        ? modules
            .filter((module: ModuleInput) => module && typeof module.title === "string" && module.title.trim())
            .map((module: ModuleInput, moduleIndex: number) => ({
                title: (module.title || "").trim(),
                order: typeof module.order === "number" && Number.isFinite(module.order) ? module.order : moduleIndex + 1,
                lessons: Array.isArray(module.lessons)
                    ? module.lessons
                        .filter((lesson: LessonInput) => lesson && typeof lesson.title === "string" && lesson.title.trim())
                        .map((lesson: LessonInput, lessonIndex: number) => ({
                            title: (lesson.title || "").trim(),
                            type: typeof lesson.type === "string" && lesson.type.trim() ? lesson.type : "VIDEO",
                            contentUrl: typeof lesson.contentUrl === "string" && lesson.contentUrl.trim() ? lesson.contentUrl.trim() : null,
                            materialFileName: typeof lesson.materialFileName === "string" && lesson.materialFileName.trim() ? lesson.materialFileName.trim() : null,
                            materialFileType: typeof lesson.materialFileType === "string" && lesson.materialFileType.trim() ? lesson.materialFileType.trim() : null,
                            materialFileSize: typeof lesson.materialFileSize === "number" && Number.isFinite(lesson.materialFileSize) ? lesson.materialFileSize : null,
                            durationMin: lesson.durationMin === null || lesson.durationMin === undefined || lesson.durationMin === ""
                                ? null
                                : Number(lesson.durationMin),
                            order: typeof lesson.order === "number" && Number.isFinite(lesson.order) ? lesson.order : lessonIndex + 1,
                        }))
                    : [],
            }))
        : null;

    const course = await prisma.course.update({
        where: { id },
        data: {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(status && { status }),
            ...(normalizedModules && {
                modules: {
                    deleteMany: {},
                    create: normalizedModules.map((module) => ({
                        title: module.title,
                        order: module.order,
                        lessons: module.lessons.length
                            ? {
                                create: module.lessons.map((lesson) => ({
                                    title: lesson.title,
                                    type: lesson.type,
                                    contentUrl: lesson.contentUrl,
                                    materialFileName: lesson.materialFileName,
                                    materialFileType: lesson.materialFileType,
                                    materialFileSize: lesson.materialFileSize,
                                    durationMin: Number.isFinite(lesson.durationMin) ? lesson.durationMin : null,
                                    order: lesson.order,
                                })),
                            }
                            : undefined,
                    })),
                },
            }),
        },
        include: {
            modules: {
                include: { lessons: true },
                orderBy: { order: "asc" },
            },
            enrollments: {
                include: { user: { select: { id: true, fullName: true, email: true } } },
                orderBy: { enrolledAt: "desc" },
            },
        },
    });

    const previousMaterialUrls = collectManagedLessonMaterialUrls(
        existingCourse.modules.flatMap((module) => module.lessons.map((lesson) => lesson.contentUrl)),
    );
    const nextMaterialUrls = collectManagedLessonMaterialUrls(
        course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.contentUrl)),
    );
    const removedMaterialUrls = previousMaterialUrls.filter((url) => !nextMaterialUrls.includes(url));

    const previousLessons = existingCourse.modules.flatMap((module) => module.lessons);
    const nextLessons = course.modules.flatMap((module) => module.lessons);
    const materialAuditChanges = nextLessons.flatMap((lesson) => {
        const previousLesson = previousLessons.find((item) => item.id === lesson.id || item.title === lesson.title);
        if (!previousLesson) return [];
        if (previousLesson.contentUrl === lesson.contentUrl) return [];

        return [{
            lessonTitle: lesson.title,
            previousMaterial: previousLesson.materialFileName || previousLesson.contentUrl,
            nextMaterial: lesson.materialFileName || lesson.contentUrl,
            changeType: previousLesson.contentUrl && lesson.contentUrl ? "REPLACE_LESSON_MATERIAL" : lesson.contentUrl ? "ADD_LESSON_MATERIAL" : "REMOVE_LESSON_MATERIAL",
        }];
    });

    await deleteManagedLessonMaterialUrls(removedMaterialUrls);

    if (materialAuditChanges.length > 0) {
        await prisma.auditLog.createMany({
            data: materialAuditChanges.map((change) => ({
                userId: user!.id,
                action: change.changeType,
                entity: "COURSE_LESSON",
                entityId: id,
                metadata: {
                    courseId: id,
                    courseTitle: course.title,
                    ...change,
                },
            })),
        });
    }

    return NextResponse.json({ course });
}

// DELETE /api/admin/courses/:id — delete course
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { user, error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const course = await prisma.course.findUnique({
        where: { id },
        select: {
            title: true,
            modules: {
                select: {
                    lessons: {
                        select: { title: true, contentUrl: true, materialFileName: true },
                    },
                },
            },
        },
    });

    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await prisma.course.delete({ where: { id } });
    const removedMaterials = course.modules.flatMap((module) => module.lessons)
        .filter((lesson) => lesson.contentUrl)
        .map((lesson) => ({
            lessonTitle: lesson.title,
            removedMaterial: lesson.materialFileName || lesson.contentUrl,
        }));

    await deleteManagedLessonMaterialUrls(
        course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.contentUrl)),
    );

    if (removedMaterials.length > 0) {
        await prisma.auditLog.create({
            data: {
                userId: user!.id,
                action: "DELETE_COURSE_LESSON_MATERIALS",
                entity: "COURSE",
                entityId: id,
                metadata: {
                    courseId: id,
                    courseTitle: course.title,
                    removedMaterials,
                },
            },
        });
    }

    return NextResponse.json({ success: true });
}
