import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    createMidtransCheckout: vi.fn(),
    fetchMidtransTransactionStatus: vi.fn(),
    createRegistrationNotification: vi.fn(),
}));

vi.mock("@/lib/payment", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/payment")>();
    return {
        ...actual,
        createMidtransCheckout: mocks.createMidtransCheckout,
        fetchMidtransTransactionStatus: mocks.fetchMidtransTransactionStatus,
    };
});

vi.mock("@/lib/notifications", () => ({
    createRegistrationNotification: mocks.createRegistrationNotification,
}));

import { applyWebhookPaymentUpdate, createRegistrationCheckout, finalizeWebhookPaymentUpdate } from "@/lib/domain/payment-workflow";

describe("payment workflow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("reuses pending checkout with invoice", async () => {
        const result = await createRegistrationCheckout({
            prisma: {
                registrationPayment: { create: vi.fn() },
                registration: { update: vi.fn() },
            } as never,
            registration: {
                id: "reg-1",
                userId: "learner-1",
                status: "SUBMITTED",
                submittedAt: new Date("2025-01-01T00:00:00.000Z"),
                totalFee: 100000,
                paymentStatus: "PENDING",
                event: { title: "Event 1", slug: "event-1" },
                payments: [{ id: "pay-1", invoiceUrl: "https://pay.example/1", status: "PENDING" }],
            },
            user: { email: "learner@example.com", name: "Learner" },
            returnBaseUrl: "http://localhost:3214",
        });

        expect(result).toEqual({
            reused: true,
            payment: { id: "pay-1", invoiceUrl: "https://pay.example/1", status: "PENDING" },
            status: 200,
        });
    });

    it("maps webhook provider rejection into rejected payment state", async () => {
        mocks.fetchMidtransTransactionStatus.mockResolvedValue({
            transaction_status: "expire",
            expiry_time: null,
        });
        const tx = {
            registrationPayment: { update: vi.fn() },
            registration: { update: vi.fn() },
        } as never;

        const result = await applyWebhookPaymentUpdate({
            prisma: tx,
            payment: { id: "pay-1", registrationId: "reg-1", expiresAt: null },
            registrationBefore: { userId: "learner-1", paymentStatus: "PENDING" },
            notificationPayload: { order_id: "INV-1" },
            orderId: "INV-1",
        });

        expect(result).toEqual({ ok: true, paymentStatus: "REJECTED", providerStatus: "expire" });
    });

    it("skips notification for idempotent webhook update", async () => {
        await finalizeWebhookPaymentUpdate({
            prisma: { auditLog: { create: vi.fn() } } as never,
            payment: { id: "pay-1", registrationId: "reg-1" },
            orderId: "INV-1",
            providerStatus: "pending",
            paymentStatus: "PENDING",
            registrationBefore: { userId: "learner-1", paymentStatus: "PENDING" },
            registrationAfter: null,
        });

        expect(mocks.createRegistrationNotification).not.toHaveBeenCalled();
    });
});
