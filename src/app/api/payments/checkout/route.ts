import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { createMidtransCheckout, getPaymentGatewayPublicConfig } from "@/lib/payment";

export async function POST(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const paymentConfig = getPaymentGatewayPublicConfig();
    if (!paymentConfig.enabled || paymentConfig.provider !== "MIDTRANS") {
        return NextResponse.json({ error: "Midtrans payment gateway is not configured" }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    const registrationId = typeof body?.registrationId === "string" ? body.registrationId : undefined;

    if (!registrationId) {
        return NextResponse.json({ error: "Registration id is required" }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
            event: { select: { title: true, slug: true } },
            payments: {
                where: { provider: "MIDTRANS", status: { in: ["PENDING", "CAPTURE", "SETTLEMENT"] } },
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });

    if (!registration || registration.userId !== user!.id) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (!registration.totalFee || registration.totalFee <= 0) {
        return NextResponse.json({ error: "Registration has invalid total fee" }, { status: 400 });
    }

    const existingPayment = registration.payments[0];
    if (existingPayment?.invoiceUrl && registration.paymentStatus === "PENDING") {
        return NextResponse.json({ payment: existingPayment, reused: true });
    }

    const orderId = `registration-${registration.id}-${Date.now()}`;
    const checkout = await createMidtransCheckout({
        orderId,
        amount: registration.totalFee,
        email: user!.email,
        name: user!.name,
        description: `Pembayaran ${registration.event.title}`,
        returnUrl: `${process.env.NEXTAUTH_URL}/my-registrations?event=${registration.event.slug}`,
    });

    const paymentUrl = checkout.redirect_url || null;

    const payment = await prisma.registrationPayment.create({
        data: {
            registrationId: registration.id,
            provider: "MIDTRANS",
            externalId: orderId,
            invoiceId: orderId,
            invoiceUrl: paymentUrl,
            amount: registration.totalFee,
            currency: "IDR",
            status: "PENDING",
            payerEmail: user!.email,
            description: `Pembayaran ${registration.event.title}`,
            metadata: JSON.parse(JSON.stringify(checkout)) as Prisma.InputJsonValue,
        },
    });

    await prisma.registration.update({
        where: { id: registration.id },
        data: {
            paymentStatus: "PENDING",
            status: registration.status === "DRAFT" ? "SUBMITTED" : registration.status,
            submittedAt: registration.submittedAt ?? new Date(),
        },
    });

    return NextResponse.json({ payment }, { status: 201 });
}
