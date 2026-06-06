import { describe, it, expect } from "vitest";
import {
    getNextIncompleteLesson,
    getLastActiveDate,
    formatLastActiveDate,
    getLessonStatus,
    type Lesson,
    type Progress,
} from "../src/lib/dashboard-timeline-utils";

describe("Learner Progress Calculation Helpers", () => {
    const mockLessons: Lesson[] = [
        { id: "l1", title: "Lesson 1", type: "VIDEO", durationMin: 10, order: 1, moduleId: "m1" },
        { id: "l2", title: "Lesson 2", type: "READING", durationMin: 5, order: 2, moduleId: "m1" },
        { id: "l3", title: "Lesson 3", type: "QUIZ", durationMin: 15, order: 3, moduleId: "m2" },
        { id: "l4", title: "Lesson 4", type: "ASSIGNMENT", durationMin: null, order: 4, moduleId: "m2" },
    ];

    describe("getNextIncompleteLesson", () => {
        it("should return the first lesson if progress is empty", () => {
            const result = getNextIncompleteLesson(mockLessons, []);
            expect(result).toEqual(mockLessons[0]);
        });

        it("should return the first incomplete lesson in sequence", () => {
            const progresses: Progress[] = [
                { lessonId: "l1", isCompleted: true, completedAt: "2026-06-05T10:00:00Z", score: null },
            ];
            const result = getNextIncompleteLesson(mockLessons, progresses);
            expect(result).toEqual(mockLessons[1]);
        });

        it("should skip completed lessons and return the next incomplete one", () => {
            const progresses: Progress[] = [
                { lessonId: "l1", isCompleted: true, completedAt: "2026-06-05T10:00:00Z", score: null },
                { lessonId: "l2", isCompleted: true, completedAt: "2026-06-05T10:30:00Z", score: null },
            ];
            const result = getNextIncompleteLesson(mockLessons, progresses);
            expect(result).toEqual(mockLessons[2]);
        });

        it("should handle out-of-order completions correctly", () => {
            // If user completed L3 before L2 (e.g. skipped ahead)
            const progresses: Progress[] = [
                { lessonId: "l1", isCompleted: true, completedAt: "2026-06-05T10:00:00Z", score: null },
                { lessonId: "l3", isCompleted: true, completedAt: "2026-06-05T11:00:00Z", score: null },
            ];
            const result = getNextIncompleteLesson(mockLessons, progresses);
            // First incomplete is still L2
            expect(result).toEqual(mockLessons[1]);
        });

        it("should return null if all lessons are completed", () => {
            const progresses: Progress[] = mockLessons.map((l) => ({
                lessonId: l.id,
                isCompleted: true,
                completedAt: "2026-06-06T10:00:00Z",
                score: null,
            }));
            const result = getNextIncompleteLesson(mockLessons, progresses);
            expect(result).toBeNull();
        });

        it("should return null if lessons array is empty", () => {
            const result = getNextIncompleteLesson([], []);
            expect(result).toBeNull();
        });
    });

    describe("getLastActiveDate", () => {
        const enrolledAt = "2026-06-01T08:00:00Z";

        it("should fallback to enrolledAt if no progress is completed", () => {
            const result = getLastActiveDate([], enrolledAt);
            expect(result).toEqual(new Date(enrolledAt));
        });

        it("should return the latest completedAt timestamp", () => {
            const progresses: Progress[] = [
                { lessonId: "l1", isCompleted: true, completedAt: "2026-06-05T10:00:00Z", score: null },
                { lessonId: "l2", isCompleted: true, completedAt: "2026-06-06T12:00:00Z", score: null },
                { lessonId: "l3", isCompleted: true, completedAt: "2026-06-04T15:00:00Z", score: null },
            ];
            const result = getLastActiveDate(progresses, enrolledAt);
            expect(result).toEqual(new Date("2026-06-06T12:00:00Z"));
        });

        it("should ignore incomplete progress completedAt timestamps", () => {
            const progresses: Progress[] = [
                { lessonId: "l1", isCompleted: true, completedAt: "2026-06-05T10:00:00Z", score: null },
                { lessonId: "l2", isCompleted: false, completedAt: "2026-06-07T12:00:00Z", score: null }, // incomplete
            ];
            const result = getLastActiveDate(progresses, enrolledAt);
            expect(result).toEqual(new Date("2026-06-05T10:00:00Z"));
        });

        it("should return null if progresses is empty and enrolledAt is missing", () => {
            const result = getLastActiveDate([], null);
            expect(result).toBeNull();
        });
    });

    describe("formatLastActiveDate", () => {
        it("should format dates in Indonesian locale", () => {
            const date = new Date("2026-06-07T05:00:00Z");
            const result = formatLastActiveDate(date);
            expect(result).toContain("Juni");
            expect(result).toContain("2026");
            expect(result).toContain("7");
        });

        it("should return null for invalid date objects", () => {
            const result = formatLastActiveDate(new Date("invalid date string"));
            expect(result).toBeNull();
        });

        it("should return null for null inputs", () => {
            const result = formatLastActiveDate(null);
            expect(result).toBeNull();
        });
    });

    describe("getLessonStatus", () => {
        it("should return COMPLETED if lesson is completed", () => {
            const completedSet = new Set(["l1"]);
            const status = getLessonStatus("l1", "l2", completedSet);
            expect(status).toBe("COMPLETED");
        });

        it("should return IN_PROGRESS if lesson is the next incomplete one", () => {
            const completedSet = new Set<string>();
            const status = getLessonStatus("l1", "l1", completedSet);
            expect(status).toBe("IN_PROGRESS");
        });

        it("should return LOCKED for subsequent incomplete lessons", () => {
            const completedSet = new Set<string>();
            const status = getLessonStatus("l2", "l1", completedSet);
            expect(status).toBe("LOCKED");
        });
    });
});
