# Phase 14: Registration & Checkout Flow Audit - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Audit and verify the event registration and checkout workflows to ensure that learners can register for events, complete payments via Midtrans, and have their payment status correctly updated.

</domain>

<decisions>
## Implementation Decisions

### Handling Expired/Cancelled Transactions
- **D-01:** We will use a time-based expiration strategy. When a payment is created, we will set an expiration time (e.g., 24 hours).
- **D-02:** When the "Bayar sekarang" (Pay Now) action is triggered (or during checkout check), we will check if the current time exceeds the `expiresAt` field of the existing `PENDING` payment. If the payment is expired, we will automatically generate a new Midtrans transaction with a new order ID instead of reusing the old checkout URL.

### the agent's Discretion
- The implementation of specific error handling and database state updates for expired payments is left to the agent's discretion, provided it keeps the database in a clean state and gives the user a seamless checkout flow.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Payments & Checkout
- `src/lib/payment.ts` — Midtrans integration helpers, webhook verification, and status mapping
- `src/lib/domain/payment-workflow.ts` — Business logic for creating checkout and processing webhooks
- `src/app/api/payments/checkout/route.ts` — Endpoint to initiate checkout for a registration
- `src/app/api/payments/webhook/route.ts` — Webhook endpoint to receive status updates from Midtrans

### Registrations & UI
- `src/app/events/[slug]/register/page.tsx` — Registration page where checkout is initiated
- `src/app/my-registrations/page.tsx` — List of registrations with pay-now actions and status info
- `src/lib/domain/registration-rules.ts` — Domain rules for registration state transitions (e.g., payable states, class access)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `createMidtransCheckout` and `fetchMidtransTransactionStatus` in `src/lib/payment.ts` to interact with Midtrans.
- `mapMidtransTransactionToPaymentState` in `src/lib/payment.ts` to map statuses.
- `createRegistrationCheckout` and `applyWebhookPaymentUpdate` in `src/lib/domain/payment-workflow.ts` for database state updates.

### Established Patterns
- NextAuth session and API route protection using `requireApiAuthPolicy`.
- Database operations wrapped with `withRequestObservability` for logging and telemetry.

### Integration Points
- Checking `expiresAt` in `createRegistrationCheckout` before deciding to reuse a pending transaction.
- Correctly setting the `expiresAt` value in `registrationPayment.create` using the current timestamp + 24 hours (or the expires_at timestamp returned by Midtrans if configured).

</code_context>

<specifics>
## Specific Ideas
- No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas
- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 14-registration-checkout-flow-audit*
*Context gathered: 2026-06-07*
