import crypto from "node:crypto";


function getTrustedMidtransBaseUrl(value: string, expectedHosts: Set<string>) {
    let parsed: URL;

    try {
        parsed = new URL(value);
    } catch {
        throw new Error(`Invalid Midtrans base URL: ${value}`);
    }

    if (parsed.protocol !== "https:") {
        throw new Error(`Midtrans base URL must use HTTPS: ${value}`);
    }

    if (!expectedHosts.has(parsed.hostname)) {
        throw new Error(`Midtrans base URL host is not allowed: ${parsed.hostname}`);
    }

    return parsed.origin;
}

function getMidtransApiBase() {
    return getTrustedMidtransBaseUrl(
        process.env.MIDTRANS_API_BASE_URL || "https://app.sandbox.midtrans.com",
        new Set(["app.midtrans.com", "app.sandbox.midtrans.com"])
    );
}

function getMidtransCoreApiBase() {
    return getTrustedMidtransBaseUrl(
        process.env.MIDTRANS_CORE_API_BASE_URL || "https://api.sandbox.midtrans.com",
        new Set(["api.midtrans.com", "api.sandbox.midtrans.com"])
    );
}

export type PaymentGatewayProvider = "MIDTRANS";

export function isMidtransEnabled() {
    return process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === "MIDTRANS" && Boolean(process.env.MIDTRANS_SERVER_KEY);
}

export function getPaymentGatewayPublicConfig() {
    return {
        enabled: isMidtransEnabled(),
        provider: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || null,
    };
}

function getMidtransServerKey() {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    if (!serverKey) {
        throw new Error("Midtrans server key is not configured");
    }

    return serverKey;
}

function createMidtransAuthHeader(serverKey: string) {
    return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}


export async function createMidtransCheckout(input: {
    orderId: string;
    amount: number;
    email: string;
    name: string;
    phone?: string | null;
    description: string;
    returnUrl?: string;
}) {
    const serverKey = getMidtransServerKey();
    const payload = {
        transaction_details: {
            order_id: input.orderId,
            gross_amount: input.amount,
        },
        credit_card: {
            secure: true,
        },
        customer_details: {
            first_name: input.name,
            email: input.email,
            phone: input.phone || undefined,
        },
        item_details: [
            {
                id: input.orderId,
                price: input.amount,
                quantity: 1,
                name: input.description.slice(0, 50),
            },
        ],
        callbacks: input.returnUrl
            ? {
                finish: input.returnUrl,
                error: input.returnUrl,
                pending: input.returnUrl,
            }
            : undefined,
    };

    const response = await fetch(`${getMidtransApiBase()}/snap/v1/transactions`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: createMidtransAuthHeader(serverKey),
        },
        body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(body.error_messages?.join(", ") || body.status_message || `Midtrans checkout creation failed (${response.status})`);
    }

    return body as {
        token?: string;
        redirect_url?: string;
    };
}

export function verifyMidtransWebhookSignature(payload: {
    order_id?: unknown;
    status_code?: unknown;
    gross_amount?: unknown;
    signature_key?: unknown;
}) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) return false;

    const orderId = typeof payload.order_id === "string" ? payload.order_id : null;
    const statusCode = typeof payload.status_code === "string" ? payload.status_code : null;
    const grossAmount = typeof payload.gross_amount === "string" ? payload.gross_amount : null;
    const signatureKey = typeof payload.signature_key === "string" ? payload.signature_key : null;

    if (!orderId || !statusCode || !grossAmount || !signatureKey) {
        return false;
    }

    const expected = crypto.createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest("hex");
    return expected === signatureKey;
}

export async function fetchMidtransTransactionStatus(orderId: string) {
    const serverKey = getMidtransServerKey();
    const response = await fetch(`${getMidtransCoreApiBase()}/v2/${encodeURIComponent(orderId)}/status`, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: createMidtransAuthHeader(serverKey),
        },
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(body.status_message || `Midtrans status lookup failed (${response.status})`);
    }

    return body as {
        order_id?: string;
        transaction_id?: string;
        transaction_status?: string;
        fraud_status?: string;
        payment_type?: string;
        status_code?: string;
        gross_amount?: string;
        settlement_time?: string;
        transaction_time?: string;
        expiry_time?: string;
    };
}

export function mapMidtransTransactionToPaymentState(input: {
    transactionStatus: string | null | undefined;
    fraudStatus?: string | null | undefined;
}) {
    const transactionStatus = (input.transactionStatus || "").toLowerCase();
    const fraudStatus = (input.fraudStatus || "").toLowerCase();

    if (transactionStatus === "capture") {
        return fraudStatus && fraudStatus !== "accept" ? "PENDING" : "VERIFIED";
    }

    if (transactionStatus === "settlement") {
        return "VERIFIED";
    }

    if (transactionStatus === "pending" || transactionStatus === "authorize") {
        return "PENDING";
    }

    if (["deny", "cancel", "expire", "failure"].includes(transactionStatus)) {
        return "REJECTED";
    }

    if (["refund", "partial_refund"].includes(transactionStatus)) {
        return "REJECTED";
    }

    return "PENDING";
}

export function getMidtransBaseUrlsForTest() {
    return {
        apiBase: getMidtransApiBase(),
        coreApiBase: getMidtransCoreApiBase(),
    };
}
