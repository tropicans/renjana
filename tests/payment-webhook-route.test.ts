import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    verifyMidtransWebhookSignature: vi.fn(),
    fetchMidtransTransactionStatus: vi.fn(),
    createRegistrationNotification: vi.fn(),
    prisma: {
        registration: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        registrationPayment: {
            findFirst: vi.fn(),
            update: vi.fn(),
        },
        auditLog: {
            create: vi.fn(),
        },
        $transaction: vi.fn(),
    },
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

import { POST } from "@/app/api/payments/webhook/route";

describe("POST /api/payments/webhook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.verifyMidtransWebhookSignature.mockReturnValue(true);
        mocks.prisma.registrationPayment.findFirst.mockResolvedValue({
            id: "payment-1",
            registrationId: "reg-1",
            expiresAt: null,
        });
        mocks.prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => callback(mocks.prisma as unknown as Parameters<typeof callback>[0]));
    });

    it("does not emit audit log or notification for idempotent payment status", async () => {
        mocks.fetchMidtransTransactionStatus.mockResolvedValue({
            transaction_status: "pending",
            expiry_time: null,
        });
        mocks.prisma.registration.findUnique.mockResolvedValue({
            id: "reg-1",
            userId: "learner-1",
            paymentStatus: "PENDING",
        });

        const response = await POST(new Request("http://localhost/api/payments/webhook", {
            method: "POST",
            body: JSON.stringify({
                order_id: "INV-1",
                transaction_status: "pending",
                status_code: "201",
                gross_amount: "100000.00",
                signature_key: "sig",
            }),
        }));

        expect(response.status).toBe(200);
        expect(mocks.prisma.registration.update).toHaveBeenCalledWith({
            where: { id: "reg-1" },
            data: { paymentStatus: "PENDING" },
        });
        expect(mocks.prisma.auditLog.create).not.toHaveBeenCalled();
        expect(mocks.createRegistrationNotification).not.toHaveBeenCalled();
    });

    it("maps rejected provider state into rejected registration payment status", async () => {
        mocks.fetchMidtransTransactionStatus.mockResolvedValue({
            transaction_status: "expire",
            expiry_time: null,
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
                    slug: "event-1",
                    title: "Event 1",
                },
            });

        const response = await POST(new Request("http://localhost/api/payments/webhook", {
            method: "POST",
            body: JSON.stringify({
                order_id: "INV-1",
                transaction_status: "expire",
                status_code: "200",
                gross_amount: "100000.00",
                signature_key: "sig",
            }),
        }));

        expect(response.status).toBe(200);
        expect(mocks.prisma.registration.update).toHaveBeenCalledWith({
            where: { id: "reg-1" },
            data: { paymentStatus: "REJECTED" },
        });
        expect(mocks.prisma.auditLog.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                action: "REJECT_REGISTRATION_PAYMENT_WEBHOOK",
                entity: "PAYMENT",
                entityId: "reg-1",
            }),
        });
        expect(mocks.createRegistrationNotification).toHaveBeenCalledWith(expect.objectContaining({
            type: "PAYMENT_REJECTED",
            registrationId: "reg-1",
        }));
    });
});
