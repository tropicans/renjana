import { prisma } from "@/lib/db";

type ReadinessInput = {
    courseId: string | null;
    preTestEnabled?: boolean;
    postTestEnabled?: boolean;
};

export async function validateEventCourseReadiness(input: ReadinessInput) {
    const { courseId, preTestEnabled, postTestEnabled } = input;

    if (!courseId || (!preTestEnabled && !postTestEnabled)) {
        return { ok: true as const, errors: [] as string[] };
    }

    const quizzes = await prisma.quiz.findMany({
        where: {
            courseId,
            type: { in: ["PRE_TEST", "POST_TEST"] },
        },
        select: { type: true },
    });

    const quizTypes = new Set(quizzes.map((quiz) => quiz.type));
    const errors: string[] = [];

    if (preTestEnabled && !quizTypes.has("PRE_TEST")) {
        errors.push("Linked course must have a PRE_TEST quiz before pre-test can be enabled");
    }

    if (postTestEnabled && !quizTypes.has("POST_TEST")) {
        errors.push("Linked course must have a POST_TEST quiz before post-test can be enabled");
    }

    return {
        ok: errors.length === 0,
        errors,
    };
}
