import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireRole: vi.fn(),
    requireAuth: vi.fn(),
    hash: vi.fn(),
    getPaymentGatewayPublicConfig: vi.fn(),
    createMidtransCheckout: vi.fn(),
    createRegistrationNotification: vi.fn(),
    fetchMidtransTransactionStatus: vi.fn(),
    verifyMidtransWebhookSignature: vi.fn(),
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        registration: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        registrationPayment: {
            create: vi.fn(),
            findFirst: vi.fn(),
            update: vi.fn(),
        },
        auditLog: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
        event: { findUnique: vi.fn() },
        classGroup: {
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireRole: mocks.requireRole,
    requireAuth: mocks.requireAuth,
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: mocks.hash,
    },
}));

vi.mock("@/lib/payment", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/payment")>();
    return {
        ...actual,
        getPaymentGatewayPublicConfig: mocks.getPaymentGatewayPublicConfig,
        createMidtransCheckout: mocks.createMidtransCheckout,
        fetchMidtransTransactionStatus: mocks.fetchMidtransTransactionStatus,
        verifyMidtransWebhookSignature: mocks.verifyMidtransWebhookSignature,
    };
});

vi.mock("@/lib/notifications", () => ({
    createRegistrationNotification: mocks.createRegistrationNotification,
}));

vi.mock("@/lib/class-group-instructor", () => ({
    resolveInstructorAssignment: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));
vi.mock("@/lib/audit", () => ({
    writeSecurityAuditLog: vi.fn(),
}));

import { POST as createAdminUser } from "@/app/api/admin/users/route";
import { POST as createPaymentCheckout } from "@/app/api/payments/checkout/route";
import { PATCH as markAllNotificationsRead } from "@/app/api/notifications/route";
import { PUT as financeUpdateRegistration } from "@/app/api/finance/registrations/[id]/route";
import { POST as createClassGroup } from "@/app/api/admin/events/[id]/class-groups/route";

describe("request security on mutating routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireRole.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" }, error: null });
        mocks.requireAuth.mockResolvedValue({ user: { id: "learner-1", role: "LEARNER", email: "learner@example.com", name: "Learner" }, error: null });
        mocks.getPaymentGatewayPublicConfig.mockReturnValue({ enabled: true, provider: "MIDTRANS" });
    });

    it("blocks admin route without origin header", async () => {
        const response = await createAdminUser(new Request("http://localhost/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "new@example.com", password: "password123", fullName: "New User" }),
        }));

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: "Missing origin header" });
        expect(mocks.prisma.user.create).not.toHaveBeenCalled();
    });

    it("blocks finance route without origin header", async () => {
        mocks.requireRole.mockResolvedValue({ user: { id: "finance-1", role: "FINANCE" }, error: null });

        const response = await financeUpdateRegistration(new Request("http://localhost/api/finance/registrations/reg-1", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adminNote: "Reviewed" }),
        }), { params: Promise.resolve({ id: "reg-1" }) });

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: "Missing origin header" });
        expect(mocks.prisma.registration.update).not.toHaveBeenCalled();
    });

    it("blocks notification patch without origin header", async () => {
        const response = await markAllNotificationsRead(new Request("http://localhost/api/notifications", {
            method: "PATCH",
        }));

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: "Missing origin header" });
    });

    it("blocks payment checkout without origin header", async () => {
        const response = await createPaymentCheckout(new Request("http://localhost/api/payments/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrationId: "reg-1" }),
        }));

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: "Missing origin header" });
        expect(mocks.prisma.registration.findUnique).not.toHaveBeenCalled();
    });

    it("allows admin route with matching origin to continue", async () => {
        mocks.prisma.event.findUnique.mockResolvedValue({ id: "event-1" });
        mocks.prisma.classGroup.create.mockResolvedValue({
            id: "group-1",
            eventId: "event-1",
            name: "Group 1",
            modality: "ONLINE",
            _count: { registrations: 0 },
            instructorUser: null,
        });

        const response = await createClassGroup(new Request("http://localhost/api/admin/events/event-1/class-groups", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Origin: "http://localhost",
            },
            body: JSON.stringify({ name: "Group 1", modality: "ONLINE" }),
        }), { params: Promise.resolve({ id: "event-1" }) });

        expect(response.status).toBe(201);
        expect(mocks.prisma.classGroup.create).toHaveBeenCalled();
    });
});
