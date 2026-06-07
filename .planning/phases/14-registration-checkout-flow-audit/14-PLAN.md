# Phase 14: Registration & Checkout Flow Audit - Plan

Audit and verify the event registration and checkout workflows to ensure that learners can register for events, complete payments via Midtrans, and have their payment status correctly updated. This plan implements **Option A (Time-based expiration)** as decided during the discussion phase.

## User Review Required

> [!IMPORTANT]
> - **Time-based Expiration Window**: Payments will be set with an expiration window of exactly 24 hours (`expiresAt` set to 24 hours in the future).
> - **Regeneration of Transactions**: If a user clicks "Bayar sekarang" (Pay Now) for an existing `PENDING` registration payment that has expired (the current time is past `expiresAt`), the system will automatically generate a new Midtrans transaction with a new order ID and update the status of the expired payment to `EXPIRED`.

## Open Questions

> [!NOTE]
> None. The scope and implementation strategy were fully clarified in the discussion phase.

---

## Proposed Changes

### Core Payment Workflow

#### [MODIFY] [payment-workflow.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/lib/domain/payment-workflow.ts)

- Update type `CheckoutRegistration`'s `payments` array to include the `expiresAt` field.
- Set `expiresAt` field to exactly 24 hours in the future when creating a new `RegistrationPayment`.
- Check if the existing `PENDING` payment has expired (`expiresAt` is non-null and in the past). If so, update the expired payment's status to `"EXPIRED"` and generate a new Midtrans transaction instead of reusing the old checkout URL.

---

### Tests

#### [MODIFY] [payment-workflow.test.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/tests/payment-workflow.test.ts)

- Update existing tests to support the updated parameters (e.g. passing a mocked `update` function for `registrationPayment`).
- Add a new unit test verifying that `createRegistrationCheckout` does not reuse an expired `PENDING` payment, updates its status to `"EXPIRED"`, and creates a new payment checkout transaction.

#### [MODIFY] [payment-checkout-route.test.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/tests/payment-checkout-route.test.ts)

- Update existing mocks in `payment-checkout-route.test.ts` to include the `expiresAt` field for the mock payment items.
- Ensure that the tests pass with the new expiration check logic.

---

## Verification Plan

### Automated Tests
We will run Vitest to verify all payment-related test suites:
- `npx vitest run tests/payment-workflow.test.ts`
- `npx vitest run tests/payment-checkout-route.test.ts`
- `npm run test` (to verify the entire test suite)
- `npm run lint` (to verify type safety and code quality)
- `npm run build` (to ensure compiling/bundling success)

### Manual Verification
- We will verify that database models correctly save the `expiresAt` timestamp.
- We will verify that attempting to checkout an expired payment redirects/generates a fresh Midtrans transaction URL.
- Once bug fixing is complete, we will build and spin up the Docker compose stack as mandated by the global developer rule.
