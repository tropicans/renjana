import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiAuthPolicy } from "@/lib/route-policy";
import { getCertificateEligibility, getAdminCertificateEligibility } from "@/lib/certificate-eligibility";
import { withRequestObservability } from "@/lib/observability/route";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: Request, { params }: { params: Promise<{ enrollmentId: string }> }) {
    return withRequestObservability(req, async () => {
        const policy = await requireApiAuthPolicy(req, { sameOrigin: true });
        if (!policy.ok) return policy.response;

        const { user } = policy;
        const { enrollmentId } = await params;

        // Check eligibility & authorization
        const eligibility = user.role === "ADMIN"
            ? await getAdminCertificateEligibility(enrollmentId)
            : await getCertificateEligibility(user.id, enrollmentId);

        if (!eligibility.ok) {
            return NextResponse.json({ error: eligibility.error }, { status: eligibility.status });
        }

        const certificate = await prisma.certificate.findUnique({
            where: { enrollmentId },
        });

        if (!certificate || !certificate.pdfUrl) {
            return NextResponse.json({ error: "Certificate record not found" }, { status: 404 });
        }

        const fileName = path.basename(certificate.pdfUrl);
        const filePath = path.join(process.cwd(), "uploads", "certificates", fileName);

        try {
            const fileBuffer = await readFile(filePath);
            return new Response(fileBuffer, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `attachment; filename="certificate-${enrollmentId.slice(0, 8)}.pdf"`,
                },
            });
        } catch {
            return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
        }
    }, {
        event: "learner.certificate.download",
        getUser: async () => {
            const policy = await requireApiAuthPolicy(req, { sameOrigin: true });
            return policy.ok ? policy.user : undefined;
        },
    });
}
