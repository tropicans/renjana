import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { jsPDF } from "jspdf";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET /api/certificates/:enrollmentId — generate or retrieve certificate PDF
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ enrollmentId: string }> }
) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { enrollmentId } = await params;

    // Get enrollment with course data
    const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
            user: { select: { fullName: true, email: true } },
            course: { select: { title: true } },
            certificate: true,
        },
    });

    if (!enrollment || enrollment.userId !== user!.id) {
        return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    if (enrollment.status !== "COMPLETED") {
        return NextResponse.json({ error: "Course not yet completed" }, { status: 400 });
    }

    // Return existing certificate if already generated
    if (enrollment.certificate) {
        return NextResponse.json({ certificate: enrollment.certificate });
    }

    // Generate PDF
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Background border
    doc.setDrawColor(180, 0, 0);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    doc.setLineWidth(0.5);
    doc.rect(14, 14, 269, 182);

    // Header
    doc.setFontSize(14);
    doc.setTextColor(150, 150, 150);
    doc.text("RENJANA LEGAL TRAINING CENTER", 148.5, 35, { align: "center" });

    // Title
    doc.setFontSize(36);
    doc.setTextColor(180, 0, 0);
    doc.text("CERTIFICATE", 148.5, 55, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("OF COMPLETION", 148.5, 65, { align: "center" });

    // Divider
    doc.setDrawColor(180, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(80, 72, 217, 72);

    // Body
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("This is to certify that", 148.5, 85, { align: "center" });

    // Name
    doc.setFontSize(28);
    doc.setTextColor(30, 30, 30);
    doc.text(enrollment.user.fullName, 148.5, 100, { align: "center" });

    // Course
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("has successfully completed the course", 148.5, 115, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(180, 0, 0);
    doc.text(enrollment.course.title, 148.5, 128, { align: "center" });

    // Date
    const issuedDate = new Date();
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(
        `Issued on ${issuedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
        148.5,
        145,
        { align: "center" }
    );

    // Certificate ID
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Certificate ID: ${enrollmentId.slice(0, 8).toUpperCase()}`, 148.5, 155, { align: "center" });

    // Signature line
    doc.setDrawColor(100, 100, 100);
    doc.line(100, 170, 197, 170);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Renjana Training Director", 148.5, 177, { align: "center" });

    // Save PDF to storage
    const uploadDir = path.join(process.cwd(), "public", "uploads", "certificates");
    await mkdir(uploadDir, { recursive: true });
    const fileName = `cert-${enrollmentId.slice(0, 8)}-${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    const pdfBuffer = doc.output("arraybuffer");
    await writeFile(filePath, Buffer.from(pdfBuffer));

    const pdfUrl = `/uploads/certificates/${fileName}`;

    // Save certificate record
    const certificate = await prisma.certificate.create({
        data: {
            enrollmentId,
            userId: user!.id,
            pdfUrl,
        },
    });

    return NextResponse.json({ certificate });
}
