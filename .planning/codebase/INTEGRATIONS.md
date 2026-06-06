# External Integrations

**Analysis Date:** 2026-06-06

## APIs & External Services

**Payment Processing:**
- Midtrans - Sandbox/Production payment gateway used for course registration checkout and webhook handling.
  - SDK/Client: REST API integrations via `fetch` calls in `src/lib/payment.ts`.
  - Auth: Server key authorization via Basic authentication header in environment variable `MIDTRANS_SERVER_KEY`.
  - Endpoints used:
    - Snap API (`/snap/v1/transactions`) - For creating payment checkout sessions (retrieving tokens and redirect URLs).
    - Core API (`/v2/{orderId}/status`) - For fetching current payment status in verification flows.

**Email/SMS:**
- No third-party SMTP/SMS API is currently integrated in `package.json` (planned for future communication features). Notifications are stored in-app (User notifications model).

**External APIs:**
- None (previously supported DOKU payment provider has been deprecated and cut over to Midtrans).

## Data Storage

**Databases:**
- PostgreSQL - Primary relational data store.
  - Connection: Configured via environment variable `DATABASE_URL`.
  - Client: Prisma ORM v5.22.0.
  - Migrations: Handled via `prisma migrate deploy` at runtime in Docker environment, and `npx prisma migrate` in local development.
  - Schema Path: `prisma/schema.prisma`.

**File Storage:**
- Local Disk - Uploaded evidence and certificates are stored in standard directories inside the container.
  - Folders:
    - `public/uploads/evidence` (evidence uploads by learners)
    - `public/uploads/certificates` (issued certificates)
  - Security: Upload security filters applied in `src/lib/upload-security.ts`.

**Caching:**
- None - Queries are executed directly against the PostgreSQL database. TanStack React Query maintains an in-memory client-side cache, but no Redis or server-side cache is active.

## Authentication & Identity

**Auth Provider:**
- NextAuth (Auth.js v5 beta) - Handles session management, login, logout, and token refresh.
  - Strategy: JWT-based sessions.
  - Providers: Custom Credentials Provider (email and password verify via `bcryptjs`).
  - Configuration: `src/lib/auth.ts` and `src/lib/auth-utils.ts`.
  - Token/Session Access: Gated pages check sessions via `auth()` helper in `src/proxy.ts`, client-side pages use `SessionProvider` / `useSession()`.

**OAuth Integrations:**
- None currently configured in the Credentials provider settings.

## Monitoring & Observability

**Error Tracking & Request Context:**
- Custom Observability Layer - Handles error tracking and request instrumentation.
  - Implementation: `src/lib/observability/route.ts` provides `withRequestObservability` wrapper.
  - Error Logging: Errors are logged to stdout/stderr via `src/lib/observability/error-monitor.ts`.
  - Request Context: In-context correlation IDs tracked via `src/lib/observability/request-context.ts`.

**Analytics:**
- In-App Analytics - User activity audit logs are recorded directly in the PostgreSQL database.
  - Model: `AuditLog` in Prisma schema.
  - Actions recorded: Create/Update actions, user logins, payment approvals, role modifications, and admin configurations.
  - Writer: `writeSecurityAuditLog` helper in `src/lib/audit.ts`.

**Logs:**
- Standalone standard output (stdout) - Application logs are printed to console stdout/stderr, captured by Docker logging driver or local terminal.

## CI/CD & Deployment

**Hosting:**
- Docker Container - Standard deployment environment. The application runs Next.js in `standalone` output mode inside a Docker Alpine image.
- Compose: `docker-compose.yml` configures Postgres and App containers.
- Ports: Host port mapped to container port `3214`.

**CI Pipeline:**
- GitHub Actions - Triggered on pull request comments or issue comments.
  - Configuration: `.github/workflows/opencode.yml`.
  - Tools: Runs code audits/verifications via `anomalyco/opencode`.

## Environment Configuration

**Development:**
- Required Env Vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (usually pointing to `http://localhost:3214`), and Midtrans API sandbox credentials.
- Secrets Location: `.env` file (listed in `.gitignore`).
- Sandbox Services: Midtrans Sandbox environment (`https://app.sandbox.midtrans.com` and `https://api.sandbox.midtrans.com`).

**Production:**
- Secrets Management: Passed as environment variables to the Docker container (defined in `.env.production` or injected by container orchestration).
- Database: Persistent production PostgreSQL database.
- Target URL: Configured via `NEXTAUTH_URL`.

## Webhooks & Callbacks

**Incoming:**
- Midtrans Payments Webhook - `/api/payments/webhook`
  - Purpose: Captures payment status updates (e.g. `settlement`, `capture`, `pending`, `deny`, `expire`, `cancel`).
  - Verification: SHA512 signature check using order details and `MIDTRANS_SERVER_KEY` (`verifyMidtransWebhookSignature` in `src/lib/payment.ts`).
  - Handled Events: Triggers class group assignments, notification triggers, and registration state transitions.

**Outgoing:**
- None.

---

*Integration audit: 2026-06-06*
*Update when adding/removing external services*
