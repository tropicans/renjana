# Midtrans Migration Plan

## Goal
Replace current DOKU checkout flow with Midtrans while preserving existing registration, finance review, notification, and class-assignment behavior.

## Feasibility
Yes, feasible.

Current integration is already isolated enough:
- provider helper: `src/lib/doku.ts`
- checkout endpoint: `src/app/api/payments/doku/checkout/route.ts`
- webhook endpoint: `src/app/api/payments/doku/webhook/route.ts`
- client API call: `src/lib/api.ts`
- UI gating/messages: `src/app/events/[slug]/register/page.tsx`, `src/app/my-registrations/page.tsx`
- payment records already generic enough: `RegistrationPayment.provider`, `externalId`, `invoiceId`, `invoiceUrl`, `metadata` in `prisma/schema.prisma`

Midtrans docs support needed flow:
- backend creates Snap transaction token / redirect URL
- frontend opens Midtrans payment page
- backend handles webhook status updates
- backend should verify notification authenticity via `signature_key` and optionally GET status API

## Recommended Migration Shape
Clean cutover to Midtrans. Do not keep dual DOKU/Midtrans logic unless business explicitly needs parallel rollout.

Reason:
- current code assumes one active gateway via `NEXT_PUBLIC_PAYMENT_PROVIDER`
- UI text and document rules branch on one provider only
- dual mode adds drift risk in webhook handling, env docs, tests, and operator workflows

## Scope
### 1. Payment provider backend
Replace DOKU-specific helper with Midtrans helper module.

Files:
- replace or rename `src/lib/doku.ts`
- add Midtrans env parsing, enabled flag, auth header builder, Snap create-transaction request, webhook verification, optional status lookup helper

Planned behaviors:
- create Midtrans Snap transaction using backend API with unique `order_id`
- return redirect URL or token-derived checkout URL shape used by frontend
- verify webhook via `SHA512(order_id + status_code + gross_amount + ServerKey)` against `signature_key`
- map Midtrans statuses to current internal statuses:
  - `capture` or `settlement` with acceptable fraud result -> `VERIFIED`
  - `pending` -> `PENDING`
  - `deny`, `cancel`, `expire`, `failure` -> `REJECTED`
  - ignore or record refund states unless business asks for refund workflow now
- persist full provider payload in `metadata`

### 2. API routes
Replace DOKU routes with Midtrans routes.

Files:
- `src/app/api/payments/doku/checkout/route.ts`
- `src/app/api/payments/doku/webhook/route.ts`
- `src/lib/api.ts`

Planned changes:
- move route path to provider-neutral form if possible, preferred:
  - `src/app/api/payments/checkout/route.ts`
  - `src/app/api/payments/webhook/route.ts`
- update `createRegistrationPaymentCheckout()` to call neutral endpoint, not `/api/payments/doku/checkout`
- checkout route should search existing pending Midtrans payment before creating new one
- webhook route should update `RegistrationPayment`, `Registration.paymentStatus`, audit logs, and learner notifications same as now
- optional hardening: after webhook signature passes, confirm latest transaction state with Midtrans GET status API before marking `VERIFIED`

### 3. Frontend registration and payment UX
Keep same learner UX shape unless business asks for redesign.

Files:
- `src/app/events/[slug]/register/page.tsx`
- `src/app/my-registrations/page.tsx`

Planned changes:
- replace `process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === "DOKU"` checks with provider-neutral helper or `=== "MIDTRANS"`
- update learner copy from DOKU wording to generic payment checkout wording or Midtrans wording
- keep current behavior that removes manual `PAYMENT_PROOF` upload when gateway checkout is enabled
- keep pay-now button opening provider checkout URL in new tab/window unless Snap embedded popup is explicitly requested

## 4. Configuration and docs
Update runtime config and docs to match cutover.

Files:
- `.env.example`
- `docker-compose.yml`
- `README.md`
- `AGENTS.md`

Planned env set:
- `NEXT_PUBLIC_PAYMENT_PROVIDER=MIDTRANS`
- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_CLIENT_KEY` only if frontend Snap.js/embed is chosen
- `MIDTRANS_API_BASE_URL` or derive from sandbox/production mode
- `MIDTRANS_SNAP_BASE_URL` if needed for redirect creation
- `MIDTRANS_WEBHOOK_URL` if app explicitly sends finish/notification URLs in create-transaction payload
- optional `MIDTRANS_IS_PRODUCTION=true|false`

Note:
Current compose/example files still carry DOKU variables. Those must be fully removed or clearly deprecated during cutover.

### 5. Tests
Update and expand tests around provider behavior.

Files likely affected:
- `tests/registration-authority.test.ts`
- `tests/registrations-route.test.ts`
- add provider-focused tests for checkout and webhook handlers

Planned test coverage:
- checkout blocked when Midtrans config missing
- checkout creates payment record with `provider: "MIDTRANS"`
- existing pending payment is reused
- webhook rejects invalid signature
- webhook maps `settlement` / `capture` to `VERIFIED`
- webhook maps `pending` to `PENDING`
- webhook maps `deny` / `cancel` / `expire` / `failure` to `REJECTED`
- audit log and notification side effects still fire once on status change

## Design Decisions To Lock Before Build
### Recommended defaults
1. Use Midtrans Snap Redirect flow first, not embedded popup.
   - lowest UI churn
   - closest match to current `invoiceUrl` open-in-new-tab behavior
2. Use provider-neutral route paths (`/api/payments/checkout`, `/api/payments/webhook`).
   - avoids baking gateway name into app surface again
3. Verify webhook authenticity with signature check and then GET status for final confirmation before marking success.
   - safer for finance-critical flow
4. Keep current internal payment states (`PENDING`, `UPLOADED`, `VERIFIED`, `REJECTED`) unchanged.
   - minimizes downstream breakage in admin/finance dashboards and rules

## Impacted Areas
- learner registration submission flow
- learner pay-now flow
- payment webhook ingestion
- finance/admin downstream approval flow
- docs and environment setup
- automated tests

Not expected to require Prisma schema migration unless business wants extra Midtrans-specific fields. Current `metadata` JSON field can hold provider payload.

## Risks
- webhook authenticity mistakes can mis-mark payments
- Midtrans status model differs from DOKU; wrong mapping can block class access or approve unpaid learners
- frontend callback data must not be trusted without backend verification
- docs/config drift likely because DOKU strings exist in multiple files

## Execution Steps
1. Add provider-neutral payment helper for Midtrans.
2. Replace checkout endpoint with neutral endpoint backed by Midtrans Snap create-transaction API.
3. Replace webhook endpoint with Midtrans verification + status mapping.
4. Update frontend API caller and UI copy/provider checks.
5. Remove DOKU env/docs references; add Midtrans env/docs.
6. Update/add Vitest coverage for checkout and webhook flows.
7. Run targeted tests, `npm run lint`, `npm run build`.
8. Smoke test checkout creation and webhook processing in sandbox.

## Validation Plan
- unit tests for helper and webhook mapping
- route tests for checkout/webhook success and rejection paths
- `npm run lint`
- `npm run build`
- sandbox manual test:
  - create registration
  - open Midtrans checkout
  - complete sandbox payment
  - confirm webhook updates `RegistrationPayment.status` and `Registration.paymentStatus`
  - confirm learner notification appears
  - confirm admin/finance screens show expected verified state

## Sources
- Midtrans Snap integration guide: https://docs.midtrans.com/docs/snap-snap-integration-guide
- Midtrans webhooks/authenticity: https://docs.midtrans.com/docs/https-notification-webhooks
- Midtrans status API: https://docs.midtrans.com/docs/get-status-api-requests
