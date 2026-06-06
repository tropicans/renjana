# Codebase Concerns

**Analysis Date:** 2026-06-06

## Tech Debt

**API endpoint self-protection pattern:**
- Issue: Next.js API routes (`/api/**`) bypass the global middleware check in `src/proxy.ts`. Gating must be manually implemented within each route file.
- File: `src/proxy.ts` (route matcher ignores `/api/**`), and route handler files under `src/app/api/`.
- Why: NextAuth route handling and generic endpoints require bypass options in the top-level gate.
- Impact: Developer oversight when creating new API endpoints could accidentally expose sensitive data or mutations.
- Fix approach: Create a custom route wrapper or helper utility to ensure auth enforcement is applied by default to all files under `src/app/api/admin/` and `src/app/api/instructor/`.

**Local containerized file storage:**
- Issue: Uploaded student evidence files and issued certificates are written directly to local folder paths.
- Files: `public/uploads/evidence` and `public/uploads/certificates` in `src/lib/lesson-material-storage.ts` and `src/lib/certificate-service.ts`.
- Why: Simplicity of design during initial phases.
- Impact: Inability to scale horizontally with multiple runtime containers unless network-attached storage (NAS) or shared volumes are mounted. Containers are ephemeral; recreation deletes uploads.
- Fix approach: Migrate file storage to a cloud object storage service (e.g. AWS S3, Google Cloud Storage, Supabase Storage) with SDK bindings.

## Known Bugs

- None currently documented in active tracking logs.

## Security Considerations

**Transitive vulnerability in jsPDF:**
- Risk: `jspdf@4.2.1` relies on an older version of `dompurify` (`3.3.1` or below) which has reported Cross-Site Scripting (XSS) and sanitization bypass vulnerabilities.
- File: `src/lib/certificate-service.ts` (imports jsPDF).
- Current mitigation: Output is generated on the server, minimizing browser-based vector execution risks.
- Recommendations: Upgrade `jspdf` to a patched release line or pin/override the transitive `dompurify` version in `package.json` resolutions.

**Auth stack on beta package:**
- Risk: NextAuth is configured using `next-auth@5.0.0-beta.31` which is a pre-release package line. Beta dependencies in production carry security review lags and API stability risks.
- Files: `src/lib/auth.ts`, `src/lib/auth-utils.ts`, and `src/app/api/auth/[...nextauth]/route.ts`.
- Current mitigation: Basic credentials provider verification is isolated.
- Recommendations: Schedule migration to the stable Auth.js (NextAuth v5) release once available.

## Performance Bottlenecks

**Serial data fetching on client dashboards:**
- Problem: The main portal dashboards load metrics via multiple independent endpoint calls, causing request waterfalls.
- Files: client dashboards under `src/app/dashboard/` and `src/app/admin/`.
- Cause: React Query hooks are declared in isolated subcomponents.
- Improvement path: Consolidate data loaders or perform pre-fetching inside Server Components before mounting client layouts.

## Fragile Areas

**Midtrans Status Mapping boundaries:**
- File: `src/lib/payment.ts` (`mapMidtransTransactionToPaymentState` helper).
- Why fragile: Maps string results returned from Midtrans webhooks directly to internal state variables. Any change in Midtrans API status schemas or status names (e.g. `settlement`, `capture`) can block learner access or incorrectly verify registrations.
- Test coverage: Partially covered by Vitest suites (`tests/payment-webhook-route.test.ts`), but fragile to external API drift.

## Scaling Limits

**PostgreSQL single container instance:**
- Current capacity: DB runs inside a single Docker container, sharing CPU/Memory resources with the main app container.
- Limit: 50-100 concurrent active users doing learning quizzes and video tracking before hitting storage I/O limits.
- Symptoms: 504 Gateway Timeouts, high database CPU utilization.
- Scaling path: Migrate PostgreSQL to a managed cloud database provider (e.g. AWS RDS, GCP Cloud SQL) and configure connection pooling.

## Dependencies at Risk

**Prisma ORM major version lag:**
- Risk: Prisma ORM is locked to `prisma@5.22.0`. Major version drift (with Prisma 7+ active) increases future upgrade friction.
- Impact: Potential compatibility warnings with Node.js future LTS lines or new Postgres version features.
- Migration plan: Perform a staged upgrade of Prisma packages, validating schemas and running Vitest suites.

**TSPparticles stack overlap:**
- Risk: `@tsparticles/react`, `@tsparticles/engine`, and `@tsparticles/slim` are imported.
- Impact: Large bundle size footprint (on disk and build time) for a single cosmetic component (`src/components/ui/sparkles.tsx`).
- Migration plan: Standardize on lightweight Tailwind/CSS animations and remove particles dependencies.

## Test Coverage Gaps

**End-to-End Registration-to-Class workflow:**
- What's not tested: Integrations covering form submission, Midtrans webhook simulation, student assignment to class groups, and certificate generation in one flow.
- Risk: Changes in relations (e.g., instructors backfill or payment statuses) could break downstream operations unnoticed.
- Priority: Medium.

---

*Concerns audit: 2026-06-06*
*Update as issues are fixed or new ones discovered*
