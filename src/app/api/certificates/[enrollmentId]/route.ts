import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { getCertificateEligibility } from "@/lib/certificate-eligibility";
import { generateCertificateRecord } from "@/lib/certificate-service";

// GET /api/certificates/:enrollmentId — generate or retrieve certificate PDF
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ enrollmentId: string }> }
) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { enrollmentId } = await params;

    const eligibility = await getCertificateEligibility(user!.id, enrollmentId);
    if (!eligibility.ok) {
        return NextResponse.json({ error: eligibility.error }, { status: eligibility.status });
    }

    const { enrollment } = eligibility;

    // Return existing certificate if already generated
    if (enrollment.certificate) {
        return NextResponse.json({ certificate: enrollment.certificate });
    }

    const certificate = await generateCertificateRecord({
        enrollmentId,
        userId: user!.id,
        learnerName: enrollment.user.fullName,
        courseTitle: enrollment.course.title,
    });

    return NextResponse.json({ certificate });
}
