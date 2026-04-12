import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { getAdminCertificateEligibility } from "@/lib/certificate-eligibility";
import { generateCertificateRecord } from "@/lib/certificate-service";

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ enrollmentId: string }> }
) {
    const { user, error } = await requireRole("ADMIN");
    if (error) return error;

    const { enrollmentId } = await params;
    if (!enrollmentId) {
        return NextResponse.json({ error: "Enrollment id is required" }, { status: 400 });
    }

    const eligibility = await getAdminCertificateEligibility(enrollmentId);
    if (!eligibility.ok) {
        return NextResponse.json({ error: eligibility.error }, { status: eligibility.status });
    }

    const { enrollment } = eligibility;

    if (enrollment.certificate) {
        return NextResponse.json({ certificate: enrollment.certificate });
    }

    const certificate = await generateCertificateRecord({
        enrollmentId,
        userId: user.id,
        learnerName: enrollment.user.fullName,
        courseTitle: enrollment.course.title,
    });

    return NextResponse.json({ certificate }, { status: 201 });
}
