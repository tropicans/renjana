import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireRole: vi.fn(),
    createRegistrationNotification: vi.fn(),
    ensureEnrollmentForCourse: vi.fn(),
    prisma: {
        registration: {
            findUnique: vi.fn(),
        },
        registrationDocument: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        auditLog: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireRole: mocks.requireRole,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

vi.mock("@/lib/notifications", () => ({
    createRegistrationNotification: mocks.createRegistrationNotification,
}));

vi.mock("@/lib/enrollment-sync", () => ({
    ensureEnrollmentForCourse: mocks.ensureEnrollmentForCourse,
}));

import { PUT as adminPut } from "@/app/api/admin/registrations/[id]/route";

describe("admin approval enrollment sync", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireRole.mockResolvedValue({
            user: { id: "admin-1", role: "ADMIN" },
            error: null,
        });
        mocks.prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => {
            const tx = {
                registration: {
                    update: vi.fn().mockResolvedValue({
                        id: "reg-1",
                        user: { id: "learner-1", fullName: "Learner", email: "learner@example.com", phone: null },
                        event: {
                            id: "event-1",
                            slug: "event-1",
                            title: "Event 1",
                            courseId: "course-1",
                            learningEnabled: true,
                            course: { id: "course-1", title: "Course 1" },
                        },
                        classGroup: null,
                        documents: [],
                        status: "APPROVED",
                        adminNote: null,
                    }),
                },
                enrollment: {
                    upsert: vi.fn(),
                },
            };

            return callback(tx);
        });
    });

    it("creates or reuses enrollment when a registration is first approved for a learning-enabled course", async () => {
        mocks.prisma.registration.findUnique.mockResolvedValue({
            id: "reg-1",
            status: "SUBMITTED",
            paymentStatus: "VERIFIED",
            adminNote: null,
        });

        const response = await adminPut(new Request("http://localhost/api/admin/registrations/reg-1", {
            method: "PUT",
            body: JSON.stringify({ status: "APPROVED" }),
            headers: { "Content-Type": "application/json" },
        }), { params: Promise.resolve({ id: "reg-1" }) });

        expect(response.status).toBe(200);
        expect(mocks.ensureEnrollmentForCourse).toHaveBeenCalledWith(expect.anything(), {
            userId: "learner-1",
            courseId: "course-1",
        });
    });

    it("does not create enrollment when approval does not transition from a non-approved state", async () => {
        mocks.prisma.registration.findUnique.mockResolvedValue({
            id: "reg-1",
            status: "APPROVED",
            paymentStatus: "VERIFIED",
            adminNote: null,
        });

        const response = await adminPut(new Request("http://localhost/api/admin/registrations/reg-1", {
            method: "PUT",
            body: JSON.stringify({ status: "APPROVED" }),
            headers: { "Content-Type": "application/json" },
        }), { params: Promise.resolve({ id: "reg-1" }) });

        expect(response.status).toBe(200);
        expect(mocks.ensureEnrollmentForCourse).not.toHaveBeenCalled();
    });

    it("does not create enrollment when the approved event is not learning-enabled", async () => {
        mocks.prisma.registration.findUnique.mockResolvedValue({
            id: "reg-1",
            status: "SUBMITTED",
            paymentStatus: "VERIFIED",
            adminNote: null,
        });
        mocks.prisma.$transaction.mockImplementationOnce(async (callback: (tx: unknown) => Promise<unknown>) => {
            const tx = {
                registration: {
                    update: vi.fn().mockResolvedValue({
                        id: "reg-1",
                        user: { id: "learner-1", fullName: "Learner", email: "learner@example.com", phone: null },
                        event: {
                            id: "event-1",
                            slug: "event-1",
                            title: "Event 1",
                            courseId: "course-1",
                            learningEnabled: false,
                            course: { id: "course-1", title: "Course 1" },
                        },
                        classGroup: null,
                        documents: [],
                        status: "APPROVED",
                        adminNote: null,
                    }),
                },
                enrollment: {
                    upsert: vi.fn(),
                },
            };

            return callback(tx);
        });

        const response = await adminPut(new Request("http://localhost/api/admin/registrations/reg-1", {
            method: "PUT",
            body: JSON.stringify({ status: "APPROVED" }),
            headers: { "Content-Type": "application/json" },
        }), { params: Promise.resolve({ id: "reg-1" }) });

        expect(response.status).toBe(200);
        expect(mocks.ensureEnrollmentForCourse).not.toHaveBeenCalled();
    });
});
