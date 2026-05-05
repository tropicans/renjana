import { afterEach, describe, expect, it } from "vitest";
import { mapMidtransTransactionToPaymentState, verifyMidtransWebhookSignature } from "@/lib/payment";
import crypto from "node:crypto";

describe("payment helper", () => {
    afterEach(() => {
        delete process.env.MIDTRANS_SERVER_KEY;
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
});
