import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { finalizeWebhookPaymentUpdate, applyWebhookPaymentUpdate } from "@/lib/domain/payment-workflow";
import { withRequestObservability } from "@/lib/observability/route";
import { verifyMidtransWebhookSignature } from "@/lib/payment";
import { buildRateLimitKey, enforceRateLimit, getRateLimitIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
    return withRequestObservability(req, async () => {
        const rateLimitResponse = enforceRateLimit({
            key: buildRateLimitKey(["payments-webhook", getRateLimitIp(req)]),
            limit: 30,
            windowMs: 60 * 1000,
            message: "Too many webhook requests. Please try again later.",
        });
        if (rateLimitResponse) return rateLimitResponse;

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

        await prisma.$transaction(async (tx) => {
            const update = await applyWebhookPaymentUpdate({
                prisma: tx,
                payment,
                registrationBefore,
                notificationPayload: body,
                orderId,
            });

            if (!update.ok) {
                return update;
            }

            const registrationAfter = update.paymentStatus !== "PENDING" && update.paymentStatus !== registrationBefore.paymentStatus
                ? await tx.registration.findUnique({
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
                })
                : null;

            await finalizeWebhookPaymentUpdate({
                prisma: tx,
                payment,
                orderId,
                providerStatus: update.providerStatus,
                paymentStatus: update.paymentStatus,
                registrationBefore,
                registrationAfter,
            });

            return update;
        });


        return NextResponse.json({ success: true });
    }, {
        event: "payments.webhook.post",
        metadata: {
            provider: "MIDTRANS",
        },
    });
}
