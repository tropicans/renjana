import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
    requireApiAuthPolicy: vi.fn(),
    getCertificateEligibility: vi.fn(),
    getAdminCertificateEligibility: vi.fn(),
    readFile: vi.fn(),
    prisma: {
        certificate: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock("@/lib/route-policy", () => ({
    requireApiAuthPolicy: mocks.requireApiAuthPolicy,
}));

vi.mock("@/lib/certificate-eligibility", () => ({
    getCertificateEligibility: mocks.getCertificateEligibility,
    getAdminCertificateEligibility: mocks.getAdminCertificateEligibility,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

vi.mock("fs/promises", () => ({
    readFile: mocks.readFile,
}));

import { GET } from "@/app/api/certificates/[enrollmentId]/file/route";

describe("GET /api/certificates/[enrollmentId]/file", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns policy response if auth policy check fails", async () => {
        const mockResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: false,
            response: mockResponse,
        });

        const response = await GET(new Request("http://localhost/api/certificates/enroll-1/file"), {
            params: Promise.resolve({ enrollmentId: "enroll-1" }),
        });

        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body.error).toBe("Unauthorized");
        expect(mocks.prisma.certificate.findUnique).not.toHaveBeenCalled();
    });

    it("returns eligibility error if learner is not eligible", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "learner-1", role: "LEARNER" },
        });
        mocks.getCertificateEligibility.mockResolvedValue({
            ok: false,
            status: 400,
            error: "Course not yet completed",
        });

        const response = await GET(new Request("http://localhost/api/certificates/enroll-1/file"), {
            params: Promise.resolve({ enrollmentId: "enroll-1" }),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toBe("Course not yet completed");
        expect(mocks.getCertificateEligibility).toHaveBeenCalledWith("learner-1", "enroll-1");
    });

    it("returns 404 if certificate record does not exist in DB", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "learner-1", role: "LEARNER" },
        });
        mocks.getCertificateEligibility.mockResolvedValue({
            ok: true,
            enrollment: { id: "enroll-1" },
        });
        mocks.prisma.certificate.findUnique.mockResolvedValue(null);

        const response = await GET(new Request("http://localhost/api/certificates/enroll-1/file"), {
            params: Promise.resolve({ enrollmentId: "enroll-1" }),
        });

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toBe("Certificate record not found");
    });

    it("streams file successfully as attachment for eligible owner learner", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "learner-1", role: "LEARNER" },
        });
        mocks.getCertificateEligibility.mockResolvedValue({
            ok: true,
            enrollment: { id: "enroll-1" },
        });
        mocks.prisma.certificate.findUnique.mockResolvedValue({
            enrollmentId: "enroll-1",
            pdfUrl: "/uploads/certificates/cert-enroll-1.pdf",
        });
        const fileContent = Buffer.from("pdf-binary-data");
        mocks.readFile.mockResolvedValue(fileContent);

        const response = await GET(new Request("http://localhost/api/certificates/enroll-1/file"), {
            params: Promise.resolve({ enrollmentId: "enroll-1" }),
        });

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("application/pdf");
        expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="certificate-enroll-1.pdf"');
        const bodyText = await response.text();
        expect(bodyText).toBe("pdf-binary-data");
        expect(mocks.readFile).toHaveBeenCalledWith(expect.stringContaining("cert-enroll-1.pdf"));
    });

    it("streams file successfully as attachment for admin", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "admin-1", role: "ADMIN" },
        });
        mocks.getAdminCertificateEligibility.mockResolvedValue({
            ok: true,
            enrollment: { id: "enroll-1" },
        });
        mocks.prisma.certificate.findUnique.mockResolvedValue({
            enrollmentId: "enroll-1",
            pdfUrl: "/uploads/certificates/cert-enroll-1.pdf",
        });
        const fileContent = Buffer.from("pdf-binary-data");
        mocks.readFile.mockResolvedValue(fileContent);

        const response = await GET(new Request("http://localhost/api/certificates/enroll-1/file"), {
            params: Promise.resolve({ enrollmentId: "enroll-1" }),
        });

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("application/pdf");
        expect(mocks.getAdminCertificateEligibility).toHaveBeenCalledWith("enroll-1");
        expect(mocks.getCertificateEligibility).not.toHaveBeenCalled();
    });

    it("returns 404 if file exists in DB but is missing on disk", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "learner-1", role: "LEARNER" },
        });
        mocks.getCertificateEligibility.mockResolvedValue({
            ok: true,
            enrollment: { id: "enroll-1" },
        });
        mocks.prisma.certificate.findUnique.mockResolvedValue({
            enrollmentId: "enroll-1",
            pdfUrl: "/uploads/certificates/cert-enroll-1.pdf",
        });
        mocks.readFile.mockRejectedValue(new Error("ENOENT"));

        const response = await GET(new Request("http://localhost/api/certificates/enroll-1/file"), {
            params: Promise.resolve({ enrollmentId: "enroll-1" }),
        });

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toBe("File not found on disk");
    });
});
