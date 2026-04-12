import { jsPDF } from "jspdf";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";

export async function generateCertificateRecord(input: {
    enrollmentId: string;
    userId: string;
    learnerName: string;
    courseTitle: string;
}) {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setDrawColor(180, 0, 0);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    doc.setLineWidth(0.5);
    doc.rect(14, 14, 269, 182);

    doc.setFontSize(14);
    doc.setTextColor(150, 150, 150);
    doc.text("RENJANA LEGAL TRAINING CENTER", 148.5, 35, { align: "center" });

    doc.setFontSize(36);
    doc.setTextColor(180, 0, 0);
    doc.text("CERTIFICATE", 148.5, 55, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("OF COMPLETION", 148.5, 65, { align: "center" });

    doc.setDrawColor(180, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(80, 72, 217, 72);

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("This is to certify that", 148.5, 85, { align: "center" });

    doc.setFontSize(28);
    doc.setTextColor(30, 30, 30);
    doc.text(input.learnerName, 148.5, 100, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("has successfully completed the course", 148.5, 115, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(180, 0, 0);
    doc.text(input.courseTitle, 148.5, 128, { align: "center" });

    const issuedDate = new Date();
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(
        `Issued on ${issuedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
        148.5,
        145,
        { align: "center" }
    );

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Certificate ID: ${input.enrollmentId.slice(0, 8).toUpperCase()}`, 148.5, 155, { align: "center" });

    doc.setDrawColor(100, 100, 100);
    doc.line(100, 170, 197, 170);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Renjana Training Director", 148.5, 177, { align: "center" });

    const uploadDir = path.join(process.cwd(), "public", "uploads", "certificates");
    await mkdir(uploadDir, { recursive: true });
    const fileName = `cert-${input.enrollmentId.slice(0, 8)}-${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    const pdfBuffer = doc.output("arraybuffer");
    await writeFile(filePath, Buffer.from(pdfBuffer));

    const pdfUrl = `/uploads/certificates/${fileName}`;

    return prisma.certificate.create({
        data: {
            enrollmentId: input.enrollmentId,
            userId: input.userId,
            pdfUrl,
        },
    });
}
