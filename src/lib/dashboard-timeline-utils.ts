export interface Lesson {
    id: string;
    title: string;
    type: string;
    durationMin: number | null;
    order: number;
    moduleId: string;
}

export interface Progress {
    lessonId: string;
    isCompleted: boolean;
    completedAt: string | null;
    score: number | null;
}

/**
 * Finds the first incomplete lesson in sequence from a list of lessons.
 */
export function getNextIncompleteLesson(lessons: Lesson[], progresses: Progress[]): Lesson | null {
    if (lessons.length === 0) return null;
    const completedSet = new Set(
        progresses.filter((p) => p.isCompleted).map((p) => p.lessonId)
    );
    return lessons.find((l) => !completedSet.has(l.id)) || null;
}

/**
 * Sources the latest completedAt timestamp from progress records, falling back to enrolledAt.
 */
export function getLastActiveDate(progresses: Progress[], enrolledAtString?: string | null): Date | null {
    const completedProgresses = progresses.filter((p) => p.isCompleted && p.completedAt);
    if (completedProgresses.length === 0) {
        return enrolledAtString ? new Date(enrolledAtString) : null;
    }
    const latestTimestamp = Math.max(
        ...completedProgresses.map((p) => {
            const time = new Date(p.completedAt!).getTime();
            return isNaN(time) ? 0 : time;
        })
    );
    if (latestTimestamp === 0) {
        return enrolledAtString ? new Date(enrolledAtString) : null;
    }
    return new Date(latestTimestamp);
}

/**
 * Formats a Date object to Indonesian locale date string.
 */
export function formatLastActiveDate(date: Date | null): string | null {
    if (!date || isNaN(date.getTime())) return null;
    try {
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return null;
    }
}

/**
 * Sequence-based status mapping for lessons.
 */
export function getLessonStatus(
    lessonId: string,
    nextIncompleteLessonId: string | null,
    completedLessonIdsSet: Set<string>
): "COMPLETED" | "IN_PROGRESS" | "LOCKED" {
    if (completedLessonIdsSet.has(lessonId)) {
        return "COMPLETED";
    }
    if (lessonId === nextIncompleteLessonId) {
        return "IN_PROGRESS";
    }
    return "LOCKED";
}
