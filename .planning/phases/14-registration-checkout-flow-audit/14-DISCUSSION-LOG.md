# Phase 14: Registration & Checkout Flow Audit - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 14-registration-checkout-flow-audit
**Areas discussed:** Handling Expired/Cancelled Transactions

---

## Handling Expired/Cancelled Transactions

| Option | Description | Selected |
|--------|-------------|----------|
| Option A | Time-based expiration: We set a strict expiration window in our database (e.g., 24 hours) when creating a payment. If a user clicks "Bayar sekarang" and the current time is past the expiration, we automatically generate a new Midtrans transaction with a new order ID. | ✓ |
| Option B | API-based validation: Before reusing a pending payment, we fetch the status from Midtrans (`fetchMidtransTransactionStatus`). If Midtrans returns `expire`, `cancel`, or `failure`, we update our database status to `REJECTED` and generate a new transaction. | |
| Option C | Simple overwrite: We always allow generating a new order ID and payment link whenever the user clicks "Bayar sekarang", replacing any previous pending payment without reusing it. | |

**User's choice:** Option A (Time-based expiration).
**Notes:** 24 hours is a standard expiration time for Midtrans payment links. We will compare the current time against the payment's `expiresAt` field when checking whether to reuse or recreate a transaction.

---

## the agent's Discretion
- The implementation of error handling and exact check logic on `createRegistrationCheckout` is left to the agent's discretion.

## Deferred Ideas
- None — discussion stayed within phase scope.
