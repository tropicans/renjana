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
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const result = await createRegistrationCheckout({
            prisma: {
                registrationPayment: { create: vi.fn(), update: vi.fn() },
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
                payments: [{ id: "pay-1", invoiceUrl: "https://pay.example/1", status: "PENDING", expiresAt: futureDate }],
            },
            user: { email: "learner@example.com", name: "Learner" },
            returnBaseUrl: "http://localhost:3214",
        });

        expect(result).toEqual({
            reused: true,
            payment: { id: "pay-1", invoiceUrl: "https://pay.example/1", status: "PENDING", expiresAt: futureDate },
            status: 200,
        });
    });

    it("regenerates checkout if pending payment is expired", async () => {
        const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
        mocks.createMidtransCheckout.mockResolvedValue({
            token: "snap-token-new",
            redirect_url: "https://pay.example/new",
        });
        const mockCreate = vi.fn().mockResolvedValue({
            id: "pay-new",
            provider: "MIDTRANS",
            externalId: "registration-reg-1-12345",
            invoiceId: "registration-reg-1-12345",
            invoiceUrl: "https://pay.example/new",
            amount: 100000,
            status: "PENDING",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        const mockUpdatePayment = vi.fn();
        const mockUpdateReg = vi.fn();

        const result = await createRegistrationCheckout({
            prisma: {
                registrationPayment: {
                    create: mockCreate,
                    update: mockUpdatePayment,
                },
                registration: {
                    update: mockUpdateReg,
                },
            } as never,
            registration: {
                id: "reg-1",
                userId: "learner-1",
                status: "SUBMITTED",
                submittedAt: new Date("2025-01-01T00:00:00.000Z"),
                totalFee: 100000,
                paymentStatus: "PENDING",
                event: { title: "Event 1", slug: "event-1" },
                payments: [{ id: "pay-1", invoiceUrl: "https://pay.example/1", status: "PENDING", expiresAt: pastDate }],
            },
            user: { email: "learner@example.com", name: "Learner" },
            returnBaseUrl: "http://localhost:3214",
        });

        expect(mockUpdatePayment).toHaveBeenCalledWith({
            where: { id: "pay-1" },
            data: { status: "EXPIRED" },
        });
        expect(mocks.createMidtransCheckout).toHaveBeenCalled();
        expect(mockCreate).toHaveBeenCalled();
        expect(result.reused).toBe(false);
        expect(result.status).toBe(201);
        expect(result.payment.id).toBe("pay-new");
        expect(result.payment.invoiceUrl).toBe("https://pay.example/new");
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
            registrationBefore: { id: "reg-1", userId: "learner-1", paymentStatus: "PENDING" },
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
