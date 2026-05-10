import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    createRegistrationNotification: vi.fn(),
    prisma: {
        registration: {
            upsert: vi.fn(),
            update: vi.fn(),
            findUnique: vi.fn(),
        },
        event: {
            findUnique: vi.fn(),
        },
    },
}));

function withOrigin(init?: RequestInit) {
    const headers = new Headers(init?.headers);
    headers.set("Origin", "http://localhost");
    return { ...init, headers };
}

vi.mock("@/lib/auth-utils", () => ({
    requireAuth: mocks.requireAuth,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

vi.mock("@/lib/notifications", () => ({
    createRegistrationNotification: mocks.createRegistrationNotification,
}));

vi.mock("@/lib/payment", () => ({
    getPaymentGatewayPublicConfig: () => ({ enabled: true, provider: "MIDTRANS" }),
}));

import { POST } from "@/app/api/registrations/route";

describe("POST /api/registrations submit rules", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireAuth.mockResolvedValue({
            user: { id: "learner-1", role: "LEARNER" },
            error: null,
        });
        mocks.prisma.event.findUnique.mockResolvedValue({
            id: "event-1",
            slug: "event-1",
            title: "Event 1",
            status: "REGISTRATION_OPEN",
            registrationStart: null,
            registrationEnd: null,
            registrationFee: 100,
            onlineTuitionFee: 200,
            offlineTuitionFee: 300,
            alumniRegistrationFee: 0,
        });
    });

    it("rolls submitted registration back to draft when required documents are missing", async () => {
        mocks.prisma.registration.upsert.mockResolvedValue({
            id: "reg-1",
            fullName: "Learner One",
            birthPlace: "City",
            birthDate: new Date("1990-01-01T00:00:00.000Z"),
            gender: "F",
            domicileAddress: "Street",
            whatsapp: "08123",
            institution: "Law Firm",
            agreedTerms: true,
            agreedRefundPolicy: true,
            documents: [],
        });
        mocks.prisma.registration.findUnique.mockResolvedValue({
            id: "reg-1",
            status: "DRAFT",
            paymentStatus: null,
            documents: [],
            event: { id: "event-1", slug: "event-1", title: "Event 1" },
            classGroup: null,
            payments: [],
        });

        const response = await POST(new Request("http://localhost/api/registrations", {
            method: "POST",
            body: JSON.stringify({
                eventId: "event-1",
                participantMode: "ONLINE",
                submit: true,
                fullName: "Learner One",
                birthPlace: "City",
                birthDate: "1990-01-01",
                gender: "F",
                domicileAddress: "Street",
                whatsapp: "08123",
                institution: "Law Firm",
                agreedTerms: true,
                agreedRefundPolicy: true,
            }),
            headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
        }));

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
            error: "Complete the required form fields and uploads before submitting",
            details: {
                missingFields: [],
                missingDocuments: ["PHOTO_4X6", "KTP", "DIPLOMA_OR_SKL"],
                agreedTerms: true,
                agreedRefundPolicy: true,
            },
        });
        expect(mocks.prisma.registration.update).toHaveBeenCalledWith({
            where: { id: "reg-1" },
            data: { status: "DRAFT", submittedAt: null },
        });
        expect(mocks.createRegistrationNotification).not.toHaveBeenCalled();
    });

    it("derives uploaded payment status when payment proof already exists", async () => {
        mocks.prisma.registration.upsert.mockResolvedValue({
            id: "reg-1",
            fullName: "Learner One",
            birthPlace: "City",
            birthDate: new Date("1990-01-01T00:00:00.000Z"),
            gender: "F",
            domicileAddress: "Street",
            whatsapp: "08123",
            institution: "Law Firm",
            agreedTerms: true,
            agreedRefundPolicy: true,
            documents: [{ type: "PHOTO_4X6" }, { type: "KTP" }, { type: "DIPLOMA_OR_SKL" }, { type: "PAYMENT_PROOF" }],
        });
        mocks.prisma.registration.findUnique.mockResolvedValue({
            id: "reg-1",
            status: "SUBMITTED",
            paymentStatus: "UPLOADED",
            documents: [{ type: "PHOTO_4X6" }, { type: "KTP" }, { type: "DIPLOMA_OR_SKL" }, { type: "PAYMENT_PROOF" }],
            event: { id: "event-1", slug: "event-1", title: "Event 1" },
            classGroup: null,
            payments: [],
        });

        const response = await POST(new Request("http://localhost/api/registrations", {
            method: "POST",
            body: JSON.stringify({
                eventId: "event-1",
                participantMode: "ONLINE",
                submit: true,
                fullName: "Learner One",
                birthPlace: "City",
                birthDate: "1990-01-01",
                gender: "F",
                domicileAddress: "Street",
                whatsapp: "08123",
                institution: "Law Firm",
                agreedTerms: true,
                agreedRefundPolicy: true,
            }),
            headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
        }));

        expect(response.status).toBe(201);
        expect(mocks.prisma.registration.update).toHaveBeenCalledWith({
            where: { id: "reg-1" },
            data: { paymentStatus: "UPLOADED" },
        });
        expect(mocks.createRegistrationNotification).toHaveBeenCalledWith(expect.objectContaining({
            type: "REGISTRATION_SUBMITTED",
            registrationId: "reg-1",
        }));
    });
});
