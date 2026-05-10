import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiAuthPolicy } from "@/lib/route-policy";
import { createRegistrationCheckout } from "@/lib/domain/payment-workflow";
import { withRequestObservability } from "@/lib/observability/route";
import { getPaymentGatewayPublicConfig } from "@/lib/payment";

export async function POST(req: Request) {
    const policy = await requireApiAuthPolicy(req, {
        sameOrigin: true,
        rateLimit: {
            keyParts: ["payments-checkout"],
            limit: 10,
            windowMs: 10 * 60 * 1000,
            message: "Too many payment checkout attempts. Please try again later.",
        },
    });
    if (!policy.ok) return policy.response;

    const { user } = policy;

    return withRequestObservability(req, async () => {
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

        const checkoutResult = await createRegistrationCheckout({
            prisma,
            registration,
            user: {
                email: user!.email,
                name: user!.name,
            },
            returnBaseUrl: process.env.NEXTAUTH_URL,
        });

        if (checkoutResult.reused) {
            return NextResponse.json({ payment: checkoutResult.payment, reused: true }, { status: checkoutResult.status });
        }

        return NextResponse.json({ payment: checkoutResult.payment }, { status: checkoutResult.status });
    }, {
        event: "payments.checkout.post",
        user,
    });
}
