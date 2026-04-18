import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { verifyDokuWebhookToken } from "@/lib/doku";
import { createRegistrationNotification } from "@/lib/notifications";

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

    const registrationBefore = await prisma.registration.findUnique({
        where: { id: payment.registrationId },
        select: { paymentStatus: true },
    });

    if (!registrationBefore) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
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

    if (paymentStatus !== "PENDING" && paymentStatus !== registrationBefore.paymentStatus) {
        const registration = await prisma.registration.findUnique({
            where: { id: payment.registrationId },
            include: {
                event: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                    },
                },
            },
        });

        if (registration) {
            await createRegistrationNotification({
                userId: registration.userId,
                registrationId: registration.id,
                eventId: registration.eventId,
                eventSlug: registration.event.slug,
                eventTitle: registration.event.title,
                type: paymentStatus === "VERIFIED" ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
            });
        }
    }

    return NextResponse.json({ success: true });
}
