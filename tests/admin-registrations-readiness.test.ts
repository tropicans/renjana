import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireRole: vi.fn(),
    prisma: {
        registration: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
        enrollment: {
            findMany: vi.fn(),
        },
        quiz: {
            findMany: vi.fn(),
        },
        quizAttempt: {
            findMany: vi.fn(),
        },
        evaluation: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireRole: mocks.requireRole,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { GET } from "@/app/api/admin/registrations/route";

describe("GET /api/admin/registrations readiness", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireRole.mockResolvedValue({
            user: { id: "admin-1", role: "ADMIN" },
            error: null,
        });
        mocks.prisma.registration.count.mockResolvedValue(8);
        mocks.prisma.enrollment.findMany.mockResolvedValue([]);
        mocks.prisma.quiz.findMany.mockResolvedValue([]);
        mocks.prisma.quizAttempt.findMany.mockResolvedValue([]);
        mocks.prisma.evaluation.findMany.mockResolvedValue([]);
    });

    it("returns expected readiness states across edge cases", async () => {
        mocks.prisma.registration.findMany.mockResolvedValue([
            {
                id: "reg-no-course",
                userId: "user-1",
                status: "APPROVED",
                createdAt: new Date("2025-01-08T00:00:00.000Z"),
                event: {
                    id: "event-1",
                    slug: "event-1",
                    title: "No Course",
                    category: "CAT",
                    modality: "ONLINE",
                    courseId: null,
                    certificateEnabled: true,
                    postTestEnabled: false,
                    evaluationEnabled: false,
                },
                classGroup: null,
                documents: [],
                user: { id: "user-1", fullName: "No Course", email: "a@example.com" },
            },
            {
                id: "reg-cert-off",
                userId: "user-2",
                status: "APPROVED",
                createdAt: new Date("2025-01-07T00:00:00.000Z"),
                event: {
                    id: "event-2",
                    slug: "event-2",
                    title: "Cert Off",
                    category: "CAT",
                    modality: "ONLINE",
                    courseId: "course-2",
                    certificateEnabled: false,
                    postTestEnabled: false,
                    evaluationEnabled: false,
                },
                classGroup: null,
                documents: [],
                user: { id: "user-2", fullName: "Cert Off", email: "b@example.com" },
            },
            {
                id: "reg-pending",
                userId: "user-3",
                status: "SUBMITTED",
                createdAt: new Date("2025-01-06T00:00:00.000Z"),
                event: {
                    id: "event-3",
                    slug: "event-3",
                    title: "Pending",
                    category: "CAT",
                    modality: "ONLINE",
                    courseId: "course-3",
                    certificateEnabled: true,
                    postTestEnabled: false,
                    evaluationEnabled: false,
                },
                classGroup: null,
                documents: [],
                user: { id: "user-3", fullName: "Pending", email: "c@example.com" },
            },
            {
                id: "reg-enrollment-missing",
                userId: "user-4",
                status: "APPROVED",
                createdAt: new Date("2025-01-05T00:00:00.000Z"),
                event: {
                    id: "event-4",
                    slug: "event-4",
                    title: "Missing Enrollment",
                    category: "CAT",
                    modality: "ONLINE",
                    courseId: "course-4",
                    certificateEnabled: true,
                    postTestEnabled: false,
                    evaluationEnabled: false,
                },
                classGroup: null,
                documents: [],
                user: { id: "user-4", fullName: "Missing Enrollment", email: "d@example.com" },
            },
            {
                id: "reg-post-test",
                userId: "user-5",
                status: "ACTIVE",
                createdAt: new Date("2025-01-04T00:00:00.000Z"),
                event: {
                    id: "event-5",
                    slug: "event-5",
                    title: "Post Test",
                    category: "CAT",
                    modality: "ONLINE",
                    courseId: "course-5",
                    certificateEnabled: true,
                    postTestEnabled: true,
                    evaluationEnabled: false,
                },
                classGroup: null,
                documents: [],
                user: { id: "user-5", fullName: "Post Test", email: "e@example.com" },
            },
            {
                id: "reg-evaluation",
                userId: "user-6",
                status: "COMPLETED",
                createdAt: new Date("2025-01-03T00:00:00.000Z"),
                event: {
                    id: "event-6",
                    slug: "event-6",
                    title: "Evaluation",
                    category: "CAT",
                    modality: "ONLINE",
                    courseId: "course-6",
                    certificateEnabled: true,
                    postTestEnabled: false,
                    evaluationEnabled: true,
                },
                classGroup: null,
                documents: [],
                user: { id: "user-6", fullName: "Evaluation", email: "f@example.com" },
            },
            {
                id: "reg-issued",
                userId: "user-7",
                status: "COMPLETED",
                createdAt: new Date("2025-01-02T00:00:00.000Z"),
                event: {
                    id: "event-7",
                    slug: "event-7",
                    title: "Issued",
                    category: "CAT",
                    modality: "ONLINE",
                    courseId: "course-7",
                    certificateEnabled: true,
                    postTestEnabled: false,
                    evaluationEnabled: false,
                },
                classGroup: null,
                documents: [],
                user: { id: "user-7", fullName: "Issued", email: "g@example.com" },
            },
            {
                id: "reg-ready",
                userId: "user-8",
                status: "COMPLETED",
                createdAt: new Date("2025-01-01T00:00:00.000Z"),
                event: {
                    id: "event-8",
                    slug: "event-8",
                    title: "Ready",
                    category: "CAT",
                    modality: "ONLINE",
                    courseId: "course-8",
                    certificateEnabled: true,
                    postTestEnabled: true,
                    evaluationEnabled: true,
                },
                classGroup: null,
                documents: [],
                user: { id: "user-8", fullName: "Ready", email: "h@example.com" },
            },
        ]);

        mocks.prisma.enrollment.findMany.mockResolvedValue([
            {
                id: "enroll-5",
                userId: "user-5",
                courseId: "course-5",
                status: "COMPLETED",
                completionPercentage: 100,
                certificate: null,
            },
            {
                id: "enroll-6",
                userId: "user-6",
                courseId: "course-6",
                status: "COMPLETED",
                completionPercentage: 100,
                certificate: null,
            },
            {
                id: "enroll-7",
                userId: "user-7",
                courseId: "course-7",
                status: "COMPLETED",
                completionPercentage: 100,
                certificate: { id: "cert-7", issuedAt: new Date("2025-01-02T00:00:00.000Z"), pdfUrl: "/cert-7.pdf" },
            },
            {
                id: "enroll-8",
                userId: "user-8",
                courseId: "course-8",
                status: "COMPLETED",
                completionPercentage: 100,
                certificate: null,
            },
        ]);
        mocks.prisma.quiz.findMany.mockResolvedValue([
            { id: "quiz-5", courseId: "course-5" },
            { id: "quiz-8", courseId: "course-8" },
        ]);
        mocks.prisma.quizAttempt.findMany.mockResolvedValue([
            { quizId: "quiz-8", userId: "user-8", passed: true },
        ]);
        mocks.prisma.evaluation.findMany.mockResolvedValue([
            {
                id: "eval-8",
                courseId: "course-8",
                userId: "user-8",
                registrationId: "reg-ready",
                answers: {},
            },
        ]);

        const response = await GET(new Request("http://localhost/api/admin/registrations?page=1"));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.pagination).toEqual({
            page: 1,
            pageSize: 25,
            total: 8,
            totalPages: 1,
        });
        expect(body.registrations.map((registration: { id: string; certificateReadiness: { status: string } }) => ({
            id: registration.id,
            status: registration.certificateReadiness.status,
        }))).toEqual([
            { id: "reg-no-course", status: "not_applicable" },
            { id: "reg-cert-off", status: "not_enabled" },
            { id: "reg-pending", status: "registration_pending" },
            { id: "reg-enrollment-missing", status: "enrollment_missing" },
            { id: "reg-post-test", status: "post_test_pending" },
            { id: "reg-evaluation", status: "evaluation_pending" },
            { id: "reg-issued", status: "issued" },
            { id: "reg-ready", status: "ready" },
        ]);
    });

    it("reuses registrationId field and legacy answers fallback for evaluation linkage", async () => {
        mocks.prisma.registration.findMany.mockResolvedValue([
            {
                id: "reg-direct",
                userId: "user-1",
                status: "COMPLETED",
                createdAt: new Date("2025-01-01T00:00:00.000Z"),
                event: {
                    id: "event-1",
                    slug: "event-1",
                    title: "Direct",
                    category: "CAT",
                    modality: "ONLINE",
                    courseId: "course-1",
                    certificateEnabled: true,
                    postTestEnabled: false,
                    evaluationEnabled: true,
                },
                classGroup: null,
                documents: [],
                user: { id: "user-1", fullName: "Direct", email: "direct@example.com" },
            },
            {
                id: "reg-legacy",
                userId: "user-2",
                status: "COMPLETED",
                createdAt: new Date("2025-01-02T00:00:00.000Z"),
                event: {
                    id: "event-2",
                    slug: "event-2",
                    title: "Legacy",
                    category: "CAT",
                    modality: "ONLINE",
                    courseId: "course-2",
                    certificateEnabled: true,
                    postTestEnabled: false,
                    evaluationEnabled: true,
                },
                classGroup: null,
                documents: [],
                user: { id: "user-2", fullName: "Legacy", email: "legacy@example.com" },
            },
        ]);
        mocks.prisma.registration.count.mockResolvedValue(2);
        mocks.prisma.enrollment.findMany.mockResolvedValue([
            {
                id: "enroll-1",
                userId: "user-1",
                courseId: "course-1",
                status: "COMPLETED",
                completionPercentage: 100,
                certificate: null,
            },
            {
                id: "enroll-2",
                userId: "user-2",
                courseId: "course-2",
                status: "COMPLETED",
                completionPercentage: 100,
                certificate: null,
            },
        ]);
        mocks.prisma.evaluation.findMany.mockResolvedValue([
            {
                id: "eval-direct",
                courseId: "course-1",
                userId: "user-1",
                registrationId: "reg-direct",
                answers: {},
            },
            {
                id: "eval-legacy",
                courseId: "course-2",
                userId: "user-2",
                registrationId: null,
                answers: { registrationId: "reg-legacy" },
            },
        ]);

        const response = await GET(new Request("http://localhost/api/admin/registrations?page=1"));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.registrations.every((registration: { certificateReadiness: { status: string } }) => registration.certificateReadiness.status === "ready")).toBe(true);
    });
});
