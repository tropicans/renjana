import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireRole: vi.fn(),
    createRegistrationNotification: vi.fn(),
    ensureEnrollmentForCourse: vi.fn(),
    prisma: {
        registration: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        registrationDocument: {
            findMany: vi.fn(),
            update: vi.fn(),
        },
        auditLog: {
            create: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

function withOrigin(init?: RequestInit) {
    const headers = new Headers(init?.headers);
    headers.set("Origin", "http://localhost");
    return { ...init, headers };
}

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
import { PUT as financePut } from "@/app/api/finance/registrations/[id]/route";

describe("registration document review boundaries", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.prisma.registration.findUnique.mockResolvedValue({
            id: "reg-1",
            status: "SUBMITTED",
            paymentStatus: "PENDING",
            adminNote: null,
        });
    });

    it("blocks admin from reviewing payment proof documents", async () => {
        mocks.requireRole.mockResolvedValue({
            user: { id: "admin-1", role: "ADMIN" },
            error: null,
        });
        mocks.prisma.registrationDocument.findMany.mockResolvedValue([
            {
                id: "doc-1",
                registrationId: "reg-1",
                type: "PAYMENT_PROOF",
            },
        ]);

        const response = await adminPut(new Request("http://localhost/api/admin/registrations/reg-1", {
            method: "PUT",
            body: JSON.stringify({
                documentUpdates: [{ id: "doc-1", reviewStatus: "APPROVED" }],
            }),
            headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
        }), { params: Promise.resolve({ id: "reg-1" }) });

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({
            error: "Payment proof documents must be reviewed by Finance",
        });
        expect(mocks.prisma.registrationDocument.update).not.toHaveBeenCalled();
        expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
    });

    it("blocks finance from reviewing non-payment documents", async () => {
        mocks.requireRole.mockResolvedValue({
            user: { id: "finance-1", role: "FINANCE" },
            error: null,
        });
        mocks.prisma.registrationDocument.findMany.mockResolvedValue([
            {
                id: "doc-2",
                registrationId: "reg-1",
                type: "IDENTITY_CARD",
            },
        ]);

        const response = await financePut(new Request("http://localhost/api/finance/registrations/reg-1", {
            method: "PUT",
            body: JSON.stringify({
                documentUpdates: [{ id: "doc-2", reviewStatus: "APPROVED" }],
            }),
            headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
        }), { params: Promise.resolve({ id: "reg-1" }) });

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({
            error: "This action only applies to payment proof documents",
        });
        expect(mocks.prisma.registrationDocument.update).not.toHaveBeenCalled();
        expect(mocks.prisma.auditLog.create).not.toHaveBeenCalled();
    });

    it("batches document lookups and updates approved admin documents", async () => {
        mocks.requireRole.mockResolvedValue({
            user: { id: "admin-1", role: "ADMIN" },
            error: null,
        });
        mocks.prisma.registration.findUnique.mockResolvedValue({
            id: "reg-1",
            status: "SUBMITTED",
            paymentStatus: "PENDING",
            adminNote: null,
        });
        mocks.prisma.registrationDocument.findMany.mockResolvedValue([
            { id: "doc-1", registrationId: "reg-1", type: "IDENTITY_CARD" },
            { id: "doc-2", registrationId: "reg-1", type: "ADVOCATE_LICENSE" },
        ]);
        mocks.prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => callback({
            registration: {
                update: vi.fn().mockResolvedValue({
                    id: "reg-1",
                    user: { id: "learner-1", fullName: "Learner", email: "learner@example.com", phone: null },
                    event: { id: "event-1", slug: "event-1", title: "Event 1", courseId: null, learningEnabled: false, course: null },
                    classGroup: null,
                    documents: [],
                    status: "SUBMITTED",
                    adminNote: null,
                }),
            },
        }));

        const response = await adminPut(new Request("http://localhost/api/admin/registrations/reg-1", {
            method: "PUT",
            body: JSON.stringify({
                documentUpdates: [
                    { id: "doc-1", reviewStatus: "APPROVED", adminNote: "  ok  " },
                    { id: "doc-2", reviewStatus: "REJECTED", adminNote: "" },
                ],
            }),
            headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
        }), { params: Promise.resolve({ id: "reg-1" }) });

        expect(response.status).toBe(200);
        expect(mocks.prisma.registrationDocument.findMany).toHaveBeenCalledWith({
            where: {
                id: { in: ["doc-1", "doc-2"] },
                registrationId: "reg-1",
            },
            select: {
                id: true,
                registrationId: true,
                type: true,
            },
        });
        expect(mocks.prisma.registrationDocument.update).toHaveBeenCalledTimes(2);
        expect(mocks.prisma.registrationDocument.update).toHaveBeenNthCalledWith(1, {
            where: { id: "doc-1" },
            data: { reviewStatus: "APPROVED", adminNote: "ok" },
        });
        expect(mocks.prisma.registrationDocument.update).toHaveBeenNthCalledWith(2, {
            where: { id: "doc-2" },
            data: { reviewStatus: "REJECTED", adminNote: null },
        });
        expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                action: "UPDATE_REGISTRATION_DOCUMENT_REVIEW",
                entityId: "reg-1",
            }),
        });
    });
});