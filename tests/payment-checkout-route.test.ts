import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    getPaymentGatewayPublicConfig: vi.fn(),
    createMidtransCheckout: vi.fn(),
    prisma: {
        registration: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        registrationPayment: {
            create: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireAuth: mocks.requireAuth,
}));

vi.mock("@/lib/payment", () => ({
    getPaymentGatewayPublicConfig: mocks.getPaymentGatewayPublicConfig,
    createMidtransCheckout: mocks.createMidtransCheckout,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { POST } from "@/app/api/payments/checkout/route";

describe("POST /api/payments/checkout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireAuth.mockResolvedValue({
            user: { id: "learner-1", email: "learner@example.com", name: "Learner One" },
            error: null,
        });
        mocks.getPaymentGatewayPublicConfig.mockReturnValue({ enabled: true, provider: "MIDTRANS" });
    });

    it("rejects when gateway is not configured", async () => {
        mocks.getPaymentGatewayPublicConfig.mockReturnValue({ enabled: false, provider: null });

        const response = await POST(new Request("http://localhost/api/payments/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrationId: "reg-1" }),
        }));

        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toEqual({
            error: "Midtrans payment gateway is not configured",
        });
    });

    it("reuses pending payment when invoice url exists", async () => {
        mocks.prisma.registration.findUnique.mockResolvedValue({
            id: "reg-1",
            userId: "learner-1",
            status: "SUBMITTED",
            submittedAt: new Date("2025-01-10T00:00:00.000Z"),
            totalFee: 150000,
            event: { title: "Event One", slug: "event-one" },
            payments: [{ id: "pay-1", invoiceUrl: "https://pay.example/1", status: "PENDING" }],
            paymentStatus: "PENDING",
        });

        const response = await POST(new Request("http://localhost/api/payments/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrationId: "reg-1" }),
        }));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            payment: { id: "pay-1", invoiceUrl: "https://pay.example/1", status: "PENDING" },
            reused: true,
        });
        expect(mocks.createMidtransCheckout).not.toHaveBeenCalled();
    });

    it("creates midtrans payment record", async () => {
        mocks.prisma.registration.findUnique.mockResolvedValue({
            id: "reg-1",
            userId: "learner-1",
            status: "DRAFT",
            submittedAt: null,
            totalFee: 150000,
            event: { title: "Event One", slug: "event-one" },
            payments: [],
        });
        mocks.createMidtransCheckout.mockResolvedValue({
            token: "snap-token",
            redirect_url: "https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token",
        });
        mocks.prisma.registrationPayment.create.mockResolvedValue({
            id: "pay-1",
            provider: "MIDTRANS",
            invoiceUrl: "https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token",
            status: "PENDING",
        });

        const response = await POST(new Request("http://localhost/api/payments/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrationId: "reg-1" }),
        }));

        expect(response.status).toBe(201);
        expect(mocks.createMidtransCheckout).toHaveBeenCalledWith(expect.objectContaining({
            orderId: expect.stringMatching(/^registration-reg-1-/),
            amount: 150000,
            email: "learner@example.com",
        }));
        expect(mocks.prisma.registrationPayment.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                registrationId: "reg-1",
                provider: "MIDTRANS",
                status: "PENDING",
            }),
        });
        expect(mocks.prisma.registration.update).toHaveBeenCalledWith({
            where: { id: "reg-1" },
            data: expect.objectContaining({
                paymentStatus: "PENDING",
                status: "SUBMITTED",
            }),
        });
    });
});
