import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { verifyDokuWebhookToken } from "@/lib/doku";

export async function POST(req: Request) {
    if (!verifyDokuWebhookToken(req.headers)) {
        return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const order = body?.order ?? {};
    const transaction = body?.transaction ?? {};
    const invoiceId = typeof order?.invoice_number === "string" ? order.invoice_number : null;
    const status = typeof transaction?.status === "string" ? transaction.status : null;

    if (!invoiceId || !status) {
        return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    const payment = await prisma.registrationPayment.findFirst({
        where: {
            OR: [{ invoiceId }, { externalId: invoiceId }],
        },
    });

    if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const normalizedStatus = status.toUpperCase();
    const paymentStatus = ["SUCCESS", "PAID", "SETTLEMENT"].includes(normalizedStatus)
        ? "VERIFIED"
        : ["FAILED", "EXPIRED", "CANCELLED"].includes(normalizedStatus)
            ? "REJECTED"
            : "PENDING";

    await prisma.registrationPayment.update({
        where: { id: payment.id },
        data: {
            status: normalizedStatus,
            paidAt: paymentStatus === "VERIFIED" ? new Date() : null,
            metadata: JSON.parse(JSON.stringify(body)) as Prisma.InputJsonValue,
        },
    });

    await prisma.registration.update({
        where: { id: payment.registrationId },
        data: { paymentStatus: paymentStatus as never },
    });

    return NextResponse.json({ success: true });
}
