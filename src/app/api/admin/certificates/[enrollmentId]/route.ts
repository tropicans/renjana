import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { getAdminCertificateEligibility } from "@/lib/certificate-eligibility";
import { generateCertificateRecord } from "@/lib/certificate-service";
import { assertSameOrigin } from "@/lib/request-security";
import { prisma } from "@/lib/db";
import { writeSecurityAuditLog } from "@/lib/audit";
import { unlink } from "fs/promises";
import path from "path";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ enrollmentId: string }> }
) {
    const { user, error } = await requireRole("ADMIN");
    if (error) return error;
    const sameOriginError = assertSameOrigin(req);
    if (sameOriginError) return sameOriginError;

    const { enrollmentId } = await params;
    if (!enrollmentId) {
        return NextResponse.json({ error: "Enrollment id is required" }, { status: 400 });
    }

    const eligibility = await getAdminCertificateEligibility(enrollmentId);
    if (!eligibility.ok) {
        return NextResponse.json({ error: eligibility.error }, { status: eligibility.status });
    }

    const { enrollment } = eligibility;
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    if (enrollment.certificate) {
        if (!force) {
            return NextResponse.json({ certificate: enrollment.certificate });
        }

        // Clean up the old certificate PDF on disk
        const oldFilename = enrollment.certificate.pdfUrl ? path.basename(enrollment.certificate.pdfUrl) : null;
        if (oldFilename) {
            const oldFilePath = path.join(process.cwd(), "uploads", "certificates", oldFilename);
            try {
                await unlink(oldFilePath);
            } catch (err) {
                // Suppress ENOENT or other delete errors
            }
        }
    }

    const certificate = await generateCertificateRecord({
        enrollmentId,
        userId: enrollment.userId,
        learnerName: enrollment.user.fullName,
        courseTitle: enrollment.course.title,
    });

    if (enrollment.certificate && force) {
        await writeSecurityAuditLog(prisma, {
            userId: user.id,
            action: "REGENERATE_CERTIFICATE",
            entity: "CERTIFICATE",
            entityId: certificate.id,
            metadata: { enrollmentId },
        });
    }

    return NextResponse.json({ certificate }, { status: enrollment.certificate && force ? 200 : 201 });
}
