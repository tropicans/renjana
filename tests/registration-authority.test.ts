import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireRole: vi.fn(),
    verifyMidtransWebhookSignature: vi.fn(),
    fetchMidtransTransactionStatus: vi.fn(),
    createRegistrationNotification: vi.fn(),
    prisma: {
        registration: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        registrationDocument: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        registrationPayment: {
            findFirst: vi.fn(),
            update: vi.fn(),
        },
        auditLog: {
            create: vi.fn(),
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

vi.mock("@/lib/payment", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/payment")>();
    return {
        ...actual,
        verifyMidtransWebhookSignature: mocks.verifyMidtransWebhookSignature,
        fetchMidtransTransactionStatus: mocks.fetchMidtransTransactionStatus,
    };
});

vi.mock("@/lib/notifications", () => ({
    createRegistrationNotification: mocks.createRegistrationNotification,
}));

import { PUT as adminPut } from "@/app/api/admin/registrations/[id]/route";
import { PUT as financePut } from "@/app/api/finance/registrations/[id]/route";
import { POST as webhookPost } from "@/app/api/payments/webhook/route";

describe("registration authority boundaries", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects admin payment status changes", async () => {
        mocks.requireRole.mockResolvedValue({
            user: { id: "admin-1", role: "ADMIN" },
            error: null,
        });

        const response = await adminPut(new Request("http://localhost/api/admin/registrations/reg-1", {
            method: "PUT",
            body: JSON.stringify({ paymentStatus: "VERIFIED" }),
            headers: { "Content-Type": "application/json" },
        }), { params: Promise.resolve({ id: "reg-1" }) });

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({
            error: "Admin cannot change payment status. Finance must verify payment.",
        });
    });

    it("rejects finance registration status changes", async () => {
        mocks.requireRole.mockResolvedValue({
            user: { id: "finance-1", role: "FINANCE" },
            error: null,
        });

        const response = await financePut(new Request("http://localhost/api/finance/registrations/reg-1", {
            method: "PUT",
            body: JSON.stringify({ status: "APPROVED" }),
            headers: { "Content-Type": "application/json" },
        }), { params: Promise.resolve({ id: "reg-1" }) });

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({
            error: "Finance cannot change registration status",
        });
    });

    it("writes an audit log when webhook changes payment status", async () => {
        mocks.verifyMidtransWebhookSignature.mockReturnValue(true);
        mocks.fetchMidtransTransactionStatus.mockResolvedValue({
            transaction_status: "settlement",
            fraud_status: "accept",
            settlement_time: "2025-01-10 10:00:00",
            expiry_time: null,
        });
        mocks.prisma.registrationPayment.findFirst.mockResolvedValue({
            id: "payment-1",
            registrationId: "reg-1",
        });
        mocks.prisma.registration.findUnique
            .mockResolvedValueOnce({
                id: "reg-1",
                userId: "learner-1",
                paymentStatus: "PENDING",
            })
            .mockResolvedValueOnce({
                id: "reg-1",
                userId: "learner-1",
                eventId: "event-1",
                event: {
                    id: "event-1",
                    slug: "event-slug",
                    title: "Event title",
                },
            });

        const response = await webhookPost(new Request("http://localhost/api/payments/webhook", {
            method: "POST",
            body: JSON.stringify({
                order_id: "INV-1",
                transaction_status: "settlement",
                status_code: "200",
                gross_amount: "100000.00",
                signature_key: "sig",
            }),
        }));

        expect(response.status).toBe(200);
        expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userId: "learner-1",
                action: "VERIFY_REGISTRATION_PAYMENT_WEBHOOK",
                entity: "PAYMENT",
                entityId: "reg-1",
            }),
        });
        expect(mocks.createRegistrationNotification).toHaveBeenCalledWith(expect.objectContaining({
            type: "PAYMENT_VERIFIED",
            registrationId: "reg-1",
        }));
    });
});
