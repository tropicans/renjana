import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createRegistrationNotification } from "@/lib/notifications";
import { fetchMidtransTransactionStatus, mapMidtransTransactionToPaymentState, verifyMidtransWebhookSignature } from "@/lib/payment";

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    if (!body || !verifyMidtransWebhookSignature(body)) {
        return NextResponse.json({ error: "Invalid Midtrans webhook signature" }, { status: 401 });
    }

    const orderId = typeof body.order_id === "string" ? body.order_id : null;
    if (!orderId) {
        return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    const payment = await prisma.registrationPayment.findFirst({
        where: {
            OR: [{ invoiceId: orderId }, { externalId: orderId }],
        },
    });

    if (!payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const registrationBefore = await prisma.registration.findUnique({
        where: { id: payment.registrationId },
        select: { id: true, userId: true, paymentStatus: true },
    });

    if (!registrationBefore) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const verifiedStatus = await fetchMidtransTransactionStatus(orderId);
    const providerStatus = typeof verifiedStatus.transaction_status === "string"
        ? verifiedStatus.transaction_status
        : typeof body.transaction_status === "string"
            ? body.transaction_status
            : null;

    if (!providerStatus) {
        return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    const paymentStatus = mapMidtransTransactionToPaymentState({
        transactionStatus: providerStatus,
        fraudStatus: typeof verifiedStatus.fraud_status === "string" ? verifiedStatus.fraud_status : undefined,
    });

    const paidAt = paymentStatus === "VERIFIED"
        ? (verifiedStatus.settlement_time || verifiedStatus.transaction_time
            ? new Date((verifiedStatus.settlement_time || verifiedStatus.transaction_time) as string)
            : new Date())
        : null;

    await prisma.registrationPayment.update({
        where: { id: payment.id },
        data: {
            status: providerStatus.toUpperCase(),
            paidAt,
            expiresAt: verifiedStatus.expiry_time ? new Date(verifiedStatus.expiry_time) : payment.expiresAt,
            metadata: JSON.parse(JSON.stringify({ notification: body, status: verifiedStatus })) as Prisma.InputJsonValue,
        },
    });

    await prisma.registration.update({
        where: { id: payment.registrationId },
        data: { paymentStatus: paymentStatus as never },
    });

    if (paymentStatus !== registrationBefore.paymentStatus) {
        await prisma.auditLog.create({
            data: {
                userId: registrationBefore.userId,
                action: paymentStatus === "VERIFIED"
                    ? "VERIFY_REGISTRATION_PAYMENT_WEBHOOK"
                    : paymentStatus === "REJECTED"
                        ? "REJECT_REGISTRATION_PAYMENT_WEBHOOK"
                        : "UPDATE_REGISTRATION_PAYMENT_WEBHOOK",
                entity: "PAYMENT",
                entityId: payment.registrationId,
                metadata: {
                    source: "MIDTRANS_WEBHOOK",
                    paymentId: payment.id,
                    invoiceId: orderId,
                    providerStatus: providerStatus.toUpperCase(),
                    previous: {
                        paymentStatus: registrationBefore.paymentStatus,
                    },
                    next: {
                        paymentStatus,
                    },
                },
            },
        });
    }

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
