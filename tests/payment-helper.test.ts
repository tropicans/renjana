import { afterEach, describe, expect, it } from "vitest";
import { getMidtransBaseUrlsForTest, mapMidtransTransactionToPaymentState, verifyMidtransWebhookSignature } from "@/lib/payment";
import crypto from "node:crypto";

describe("payment helper", () => {
    afterEach(() => {
        delete process.env.MIDTRANS_SERVER_KEY;
        delete process.env.MIDTRANS_API_BASE_URL;
        delete process.env.MIDTRANS_CORE_API_BASE_URL;
    });

    it("maps verified statuses", () => {
        expect(mapMidtransTransactionToPaymentState({ transactionStatus: "settlement" })).toBe("VERIFIED");
        expect(mapMidtransTransactionToPaymentState({ transactionStatus: "capture", fraudStatus: "accept" })).toBe("VERIFIED");
    });

    it("maps pending statuses", () => {
        expect(mapMidtransTransactionToPaymentState({ transactionStatus: "pending" })).toBe("PENDING");
        expect(mapMidtransTransactionToPaymentState({ transactionStatus: "authorize" })).toBe("PENDING");
        expect(mapMidtransTransactionToPaymentState({ transactionStatus: "capture", fraudStatus: "challenge" })).toBe("PENDING");
    });

    it("maps rejected statuses", () => {
        expect(mapMidtransTransactionToPaymentState({ transactionStatus: "deny" })).toBe("REJECTED");
        expect(mapMidtransTransactionToPaymentState({ transactionStatus: "cancel" })).toBe("REJECTED");
        expect(mapMidtransTransactionToPaymentState({ transactionStatus: "expire" })).toBe("REJECTED");
        expect(mapMidtransTransactionToPaymentState({ transactionStatus: "failure" })).toBe("REJECTED");
    });

    it("verifies midtrans webhook signature", () => {
        process.env.MIDTRANS_SERVER_KEY = "server-key";
        const orderId = "ORDER-1";
        const statusCode = "200";
        const grossAmount = "150000.00";
        const signatureKey = crypto.createHash("sha512").update(`${orderId}${statusCode}${grossAmount}server-key`).digest("hex");

        expect(verifyMidtransWebhookSignature({
            order_id: orderId,
            status_code: statusCode,
            gross_amount: grossAmount,
            signature_key: signatureKey,
        })).toBe(true);

        expect(verifyMidtransWebhookSignature({
            order_id: orderId,
            status_code: statusCode,
            gross_amount: grossAmount,
            signature_key: "bad-signature",
        })).toBe(false);
    });

    it("accepts only trusted https midtrans hosts", () => {
        process.env.MIDTRANS_API_BASE_URL = "https://app.midtrans.com";
        process.env.MIDTRANS_CORE_API_BASE_URL = "https://api.sandbox.midtrans.com";

        expect(getMidtransBaseUrlsForTest()).toEqual({
            apiBase: "https://app.midtrans.com",
            coreApiBase: "https://api.sandbox.midtrans.com",
        });
    });

    it("rejects insecure or untrusted midtrans hosts", () => {
        process.env.MIDTRANS_API_BASE_URL = "http://app.sandbox.midtrans.com";
        process.env.MIDTRANS_CORE_API_BASE_URL = "https://evil.example";

        expect(() => getMidtransBaseUrlsForTest()).toThrow(/Midtrans base URL must use HTTPS/);

        process.env.MIDTRANS_API_BASE_URL = "https://app.sandbox.midtrans.com";
        expect(() => getMidtransBaseUrlsForTest()).toThrow(/host is not allowed/);
    });
});
