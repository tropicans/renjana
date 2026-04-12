import crypto from "node:crypto";

const DOKU_API_BASE = process.env.DOKU_API_BASE_URL || "https://api-sandbox.doku.com";

export function isDokuEnabled() {
    return process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === "DOKU" && Boolean(process.env.DOKU_CLIENT_ID) && Boolean(process.env.DOKU_SECRET_KEY);
}

export function getDokuPublicConfig() {
    return {
        enabled: isDokuEnabled(),
        provider: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || null,
    };
}

function getDokuCredentials() {
    const clientId = process.env.DOKU_CLIENT_ID;
    const secretKey = process.env.DOKU_SECRET_KEY;

    if (!clientId || !secretKey) {
        throw new Error("DOKU credentials are not configured");
    }

    return { clientId, secretKey };
}

function createDokuDigest(payload: string) {
    return crypto.createHash("sha256").update(payload).digest("base64");
}

function createDokuSignature(input: {
    clientId: string;
    requestId: string;
    requestTarget: string;
    digest: string;
    timestamp: string;
    secretKey: string;
}) {
    const raw = [
        `Client-Id:${input.clientId}`,
        `Request-Id:${input.requestId}`,
        `Request-Timestamp:${input.timestamp}`,
        `Request-Target:${input.requestTarget}`,
        `Digest:${input.digest}`,
    ].join("\n");

    return crypto.createHmac("sha256", input.secretKey).update(raw).digest("base64");
}

export async function createDokuCheckout(input: {
    invoiceNumber: string;
    amount: number;
    email: string;
    name: string;
    description: string;
    returnUrl?: string;
}) {
    const { clientId, secretKey } = getDokuCredentials();
    const endpointPath = "/checkout/v1/payment";
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const payload = JSON.stringify({
        order: {
            invoice_number: input.invoiceNumber,
            amount: input.amount,
            currency: "IDR",
            callback_url: process.env.DOKU_WEBHOOK_URL,
            callback_url_cancel: input.returnUrl,
        },
        customer: {
            name: input.name,
            email: input.email,
        },
        payment: {
            payment_due_date: 60,
        },
        line_items: [
            {
                name: input.description,
                price: input.amount,
                quantity: 1,
            },
        ],
    });

    const digest = createDokuDigest(payload);
    const signature = createDokuSignature({
        clientId,
        requestId,
        requestTarget: endpointPath,
        digest,
        timestamp,
        secretKey,
    });

    const response = await fetch(`${DOKU_API_BASE}${endpointPath}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Client-Id": clientId,
            "Request-Id": requestId,
            "Request-Timestamp": timestamp,
            Signature: `HMACSHA256=${signature}`,
            Digest: digest,
        },
        body: payload,
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(body.response?.message || body.message || `DOKU checkout creation failed (${response.status})`);
    }

    return body as {
        response?: {
            payment?: {
                url?: string;
            };
            order?: {
                invoice_number?: string;
                amount?: number;
            };
        };
        virtual_account_info?: unknown;
    };
}

export function verifyDokuWebhookToken(headers: Headers) {
    const expectedToken = process.env.DOKU_WEBHOOK_TOKEN;
    if (!expectedToken) return true;
    return headers.get("x-callback-token") === expectedToken;
}
