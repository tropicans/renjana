import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireApiAuthPolicy: vi.fn(),
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

function withOrigin(init?: RequestInit) {
    const headers = new Headers(init?.headers);
    headers.set("Origin", "http://localhost");
    return { ...init, headers };
}
vi.mock("@/lib/route-policy", () => ({
    requireApiAuthPolicy: mocks.requireApiAuthPolicy,
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
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "learner-1", email: "learner@example.com", name: "Learner One" },
        });
        mocks.getPaymentGatewayPublicConfig.mockReturnValue({ enabled: true, provider: "MIDTRANS" });
    });

    it("rejects when gateway is not configured", async () => {
        mocks.getPaymentGatewayPublicConfig.mockReturnValue({ enabled: false, provider: null });

        const response = await POST(new Request("http://localhost/api/payments/checkout", {
            method: "POST",
            headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
            body: JSON.stringify({ registrationId: "reg-1" }),
        }));

        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toEqual({
            error: "Midtrans payment gateway is not configured",
        });
    });

    it("reuses pending payment when invoice url exists", async () => {
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        mocks.prisma.registration.findUnique.mockResolvedValue({
            id: "reg-1",
            userId: "learner-1",
            status: "SUBMITTED",
            submittedAt: new Date("2025-01-10T00:00:00.000Z"),
            totalFee: 150000,
            event: { title: "Event One", slug: "event-one" },
            payments: [{ id: "pay-1", invoiceUrl: "https://pay.example/1", status: "PENDING", expiresAt: futureDate }],
            paymentStatus: "PENDING",
        });

        const response = await POST(new Request("http://localhost/api/payments/checkout", {
            method: "POST",
            headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
            body: JSON.stringify({ registrationId: "reg-1" }),
        }));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            payment: { id: "pay-1", invoiceUrl: "https://pay.example/1", status: "PENDING", expiresAt: futureDate.toISOString() },
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
            headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
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
            data: { paymentStatus: "PENDING" },
        });
    });

    it("rejects missing same-origin header", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: false,
            response: new Response(JSON.stringify({ error: "Missing origin header" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            }),
        });

        const response = await POST(new Request("http://localhost/api/payments/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrationId: "reg-1" }),
        }));

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: "Missing origin header" });
    });

    it("uses resolved policy user for checkout flow", async () => {
        mocks.prisma.registration.findUnique.mockResolvedValue({
            id: "reg-1",
            userId: "learner-1",
            status: "SUBMITTED",
            submittedAt: new Date("2025-01-10T00:00:00.000Z"),
            totalFee: 150000,
            event: { title: "Event One", slug: "event-one" },
            payments: [{ id: "pay-1", invoiceUrl: "https://pay.example/1", status: "PENDING", expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }],
            paymentStatus: "PENDING",
        });

        const response = await POST(new Request("http://localhost/api/payments/checkout", {
            method: "POST",
            headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
            body: JSON.stringify({ registrationId: "reg-1" }),
        }));

        expect(response.status).toBe(200);
        expect(mocks.requireApiAuthPolicy).toHaveBeenCalledWith(expect.any(Request), {
            sameOrigin: true,
            rateLimit: {
                keyParts: ["payments-checkout"],
                limit: 10,
                windowMs: 10 * 60 * 1000,
                message: "Too many payment checkout attempts. Please try again later.",
            },
        });
    });
});
