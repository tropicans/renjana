import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
    requireRole: vi.fn(),
    assertSameOrigin: vi.fn(),
    getAdminCertificateEligibility: vi.fn(),
    generateCertificateRecord: vi.fn(),
    writeSecurityAuditLog: vi.fn(),
    unlink: vi.fn(),
    prisma: {},
}));

vi.mock("@/lib/auth-utils", () => ({
    requireRole: mocks.requireRole,
}));

vi.mock("@/lib/request-security", () => ({
    assertSameOrigin: mocks.assertSameOrigin,
}));

vi.mock("@/lib/certificate-eligibility", () => ({
    getAdminCertificateEligibility: mocks.getAdminCertificateEligibility,
}));

vi.mock("@/lib/certificate-service", () => ({
    generateCertificateRecord: mocks.generateCertificateRecord,
}));

vi.mock("@/lib/audit", () => ({
    writeSecurityAuditLog: mocks.writeSecurityAuditLog,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

vi.mock("fs/promises", () => ({
    unlink: mocks.unlink,
}));

import { POST } from "@/app/api/admin/certificates/[enrollmentId]/route";

describe("POST /api/admin/certificates/[enrollmentId] (Regeneration)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireRole.mockResolvedValue({
            user: { id: "admin-1", role: "ADMIN" },
            error: null,
        });
        mocks.assertSameOrigin.mockReturnValue(null);
    });

    it("returns 403 if user is not authorized", async () => {
        const mockError = NextResponse.json({ error: "Forbidden" }, { status: 403 });
        mocks.requireRole.mockResolvedValue({
            user: null,
            error: mockError,
        });

        const response = await POST(new Request("http://localhost/api/admin/certificates/enroll-1"), {
            params: Promise.resolve({ enrollmentId: "enroll-1" }),
        });

        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({ error: "Forbidden" });
        expect(mocks.getAdminCertificateEligibility).not.toHaveBeenCalled();
    });

    it("returns 400 if same-origin policy check fails", async () => {
        mocks.assertSameOrigin.mockReturnValue(NextResponse.json({ error: "Invalid origin" }, { status: 400 }));

        const response = await POST(new Request("http://localhost/api/admin/certificates/enroll-1"), {
            params: Promise.resolve({ enrollmentId: "enroll-1" }),
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Invalid origin" });
    });

    it("returns 400 if enrollment ID is missing", async () => {
        const response = await POST(new Request("http://localhost/api/admin/certificates/"), {
            params: Promise.resolve({ enrollmentId: "" }),
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Enrollment id is required" });
    });

    it("returns eligibility error if check fails", async () => {
        mocks.getAdminCertificateEligibility.mockResolvedValue({
            ok: false,
            status: 400,
            error: "Course not yet completed",
        });

        const response = await POST(new Request("http://localhost/api/admin/certificates/enroll-1"), {
            params: Promise.resolve({ enrollmentId: "enroll-1" }),
        });

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Course not yet completed" });
    });

    it("returns existing certificate when already generated and force=false", async () => {
        const existingCertificate = { id: "cert-1", pdfUrl: "/uploads/certificates/cert-enroll-1.pdf" };
        mocks.getAdminCertificateEligibility.mockResolvedValue({
            ok: true,
            enrollment: {
                id: "enroll-1",
                userId: "learner-1",
                user: { fullName: "Learner Name" },
                course: { title: "Course Title" },
                certificate: existingCertificate,
            },
        });

        const response = await POST(new Request("http://localhost/api/admin/certificates/enroll-1"), {
            params: Promise.resolve({ enrollmentId: "enroll-1" }),
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ certificate: existingCertificate });
        expect(mocks.unlink).not.toHaveBeenCalled();
        expect(mocks.generateCertificateRecord).not.toHaveBeenCalled();
    });

    it("unlinks old file, regenerates certificate, and logs security audit if force=true", async () => {
        const existingCertificate = { id: "cert-1", pdfUrl: "/uploads/certificates/cert-enroll-1.pdf" };
        const newCertificate = { id: "cert-new", pdfUrl: "/uploads/certificates/cert-enroll-1-new.pdf" };
        mocks.getAdminCertificateEligibility.mockResolvedValue({
            ok: true,
            enrollment: {
                id: "enroll-1",
                userId: "learner-1",
                user: { fullName: "Learner Name" },
                course: { title: "Course Title" },
                certificate: existingCertificate,
            },
        });
        mocks.unlink.mockResolvedValue(undefined);
        mocks.generateCertificateRecord.mockResolvedValue(newCertificate);
        mocks.writeSecurityAuditLog.mockResolvedValue(undefined);

        const response = await POST(new Request("http://localhost/api/admin/certificates/enroll-1?force=true"), {
            params: Promise.resolve({ enrollmentId: "enroll-1" }),
        });

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ certificate: newCertificate });
        expect(mocks.unlink).toHaveBeenCalledWith(expect.stringContaining("cert-enroll-1.pdf"));
        expect(mocks.generateCertificateRecord).toHaveBeenCalledWith({
            enrollmentId: "enroll-1",
            userId: "learner-1",
            learnerName: "Learner Name",
            courseTitle: "Course Title",
        });
        expect(mocks.writeSecurityAuditLog).toHaveBeenCalledWith(mocks.prisma, {
            userId: "admin-1",
            action: "REGENERATE_CERTIFICATE",
            entity: "CERTIFICATE",
            entityId: "cert-new",
            metadata: { enrollmentId: "enroll-1" },
        });
    });

    it("generates certificate normally (201) if certificate does not exist", async () => {
        const newCertificate = { id: "cert-new", pdfUrl: "/uploads/certificates/cert-enroll-1-new.pdf" };
        mocks.getAdminCertificateEligibility.mockResolvedValue({
            ok: true,
            enrollment: {
                id: "enroll-1",
                userId: "learner-1",
                user: { fullName: "Learner Name" },
                course: { title: "Course Title" },
                certificate: null,
            },
        });
        mocks.generateCertificateRecord.mockResolvedValue(newCertificate);

        const response = await POST(new Request("http://localhost/api/admin/certificates/enroll-1"), {
            params: Promise.resolve({ enrollmentId: "enroll-1" }),
        });

        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ certificate: newCertificate });
        expect(mocks.unlink).not.toHaveBeenCalled();
        expect(mocks.generateCertificateRecord).toHaveBeenCalledWith({
            enrollmentId: "enroll-1",
            userId: "learner-1",
            learnerName: "Learner Name",
            courseTitle: "Course Title",
        });
        expect(mocks.writeSecurityAuditLog).not.toHaveBeenCalled();
    });
});
