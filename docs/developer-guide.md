# Renjana LMS Developer Guide

## 1. Setup

### Prerequisites
- Node.js 20+
- npm
- Docker Desktop or compatible Docker engine
- PostgreSQL only if running app outside Docker

### Local development
```bash
npm ci
npx prisma generate
npm run dev
```

App runs on `http://localhost:3214`.

If database schema not yet applied:
```bash
npx prisma db push
npm run db:seed
```

Useful commands:
```bash
npm run lint
npm run test
npx vitest run tests/<file>.test.ts --exclude=.next/**
npm run build
```

### Docker development / prod-like setup
```bash
docker compose up -d --build
```

Services from `docker-compose.yml`:
- `renjana-lmsapp` → app on `3214`
- `renjana-postgres` → PostgreSQL on host port `25432`
- `renjana-adminer` → Adminer on `8888`

First-time database bootstrap inside container:
```bash
docker exec -it renjana-lmsapp npx prisma db push
docker exec -it renjana-lmsapp npx prisma db seed
```

### Seed and backfill scripts
```bash
npm run db:seed
npm run db:backfill:class-group-instructors
npm run db:backfill:class-group-instructors:apply
```

## 2. Architecture

### Stack
- Next.js 16 App Router
- React 19
- TypeScript 5
- Prisma + PostgreSQL
- NextAuth v5 beta with Credentials provider and JWT session strategy
- TanStack Query for client-side server state
- Tailwind CSS v4 + Radix UI primitives

### High-level shape
Project combines:
- public marketing pages
- event and course catalog
- learner registration and payment flow
- multi-role portals for `ADMIN`, `INSTRUCTOR`, `MANAGER`, `FINANCE`, `LEARNER`
- LMS flow for lessons, progress, attendance, quizzes, evaluations, certificates

### Request flow
1. Browser requests App Router page in `src/app/**`.
2. `src/proxy.ts` enforces coarse page access for non-API routes.
3. Client components call `/api/**` using helpers from `src/lib/api.ts` and feature client API modules.
4. Route handlers in `src/app/api/**` run server logic.
5. Prisma access goes through `src/lib/db.ts`.
6. Auth and RBAC enforced in route handlers via `src/lib/auth-utils.ts` or `src/lib/route-policy.ts`.
7. Request logging, tracing, metrics, and error capture go through `src/lib/observability/**`.

### Auth and access control
Observed layers:
- `src/lib/auth.ts`
  - NextAuth Credentials provider
  - bcrypt password verification
  - JWT stores `id` and `role`
  - session exposes `session.user.id` and `session.user.role`
- `src/lib/auth-utils.ts`
  - `getServerUser()`
  - `requireAuth()`
  - `requireRole(...roles)`
- `src/lib/route-policy.ts`
  - `requireApiAuthPolicy(request, options)`
  - combines auth, optional same-origin enforcement, optional rate limit
- `src/proxy.ts`
  - protects page routes by prefix
  - API routes intentionally bypass proxy and must self-protect inside route handlers

### Client/provider stack
`src/components/providers.tsx` mounts:
1. `SessionProvider`
2. `QueryClientProvider`
3. `LanguageProvider`
4. `UserProvider`
5. `ToastProvider`
6. `NotificationsProvider`

Default React Query behavior observed:
- `staleTime: 30s`
- `retry: 1`

### Data layer
`prisma/schema.prisma` defines core domains:
- identity: `User`
- learning: `Course`, `Module`, `Lesson`, `Enrollment`, `Progress`
- event operations: `Event`, `Registration`, `RegistrationDocument`, `RegistrationPayment`, `ClassGroup`
- instructional proof: `Attendance`, `Evidence`
- assessment: `Quiz`, `QuizAttempt`, `Evaluation`
- outcomes: `Certificate`, `Notification`, `AuditLog`

### Domain split worth knowing
Not full clean architecture yet. Current repo has useful domain seams:
- `src/lib/domain/payment-workflow.ts` → payment checkout + webhook state transition logic
- `src/lib/domain/certificate-readiness.ts` → admin registration readiness read model
- `src/features/client/api/*.ts` → feature-scoped frontend API layer; recent example `admin-events.ts`

## 3. Environment Variables

Observed env vars from code and runtime config:

| Variable | Required | Used by | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Yes | Prisma, app, Docker | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | NextAuth, request security, payments checkout | Base app URL, allowed same-origin source, payment return URL |
| `NEXTAUTH_SECRET` | Yes | NextAuth | Session/JWT secret |
| `AUTH_TRUST_HOST` | Yes in Docker/proxy setups | NextAuth runtime | Trust forwarded host headers |
| `NODE_ENV` | Yes | Prisma logging, metrics route, Next runtime | Environment mode |
| `NEXT_PUBLIC_PAYMENT_PROVIDER` | Optional | payment UI/server | Enable payment flow; observed supported value `MIDTRANS` |
| `MIDTRANS_SERVER_KEY` | Required when Midtrans enabled | server payment integration, webhook verification | Backend auth to Midtrans |
| `MIDTRANS_CLIENT_KEY` | Optional currently | runtime config only | Reserved for client-side provider use |
| `MIDTRANS_API_BASE_URL` | Optional | payment checkout | Midtrans Snap API base URL; code restricts host to official Midtrans domains |
| `MIDTRANS_CORE_API_BASE_URL` | Optional | webhook/status sync | Midtrans Core API base URL; code restricts host to official Midtrans domains |
| `METRICS_TOKEN` | Optional but recommended in production | `/api/metrics` | Bearer token protection for Prometheus-style metrics endpoint |

### Example local `.env`
```env
DATABASE_URL="postgresql://renjana:renjana_dev@localhost:25432/renjana_db"
NEXTAUTH_SECRET="replace-with-long-random-secret"
NEXTAUTH_URL="http://localhost:3214"
AUTH_TRUST_HOST=true
NODE_ENV=development
NEXT_PUBLIC_PAYMENT_PROVIDER="MIDTRANS"
MIDTRANS_SERVER_KEY=""
MIDTRANS_CLIENT_KEY=""
MIDTRANS_API_BASE_URL="https://app.sandbox.midtrans.com"
MIDTRANS_CORE_API_BASE_URL="https://api.sandbox.midtrans.com"
METRICS_TOKEN=""
```

### Docker env behavior
`docker-compose.yml` sets production-style defaults for app container:
- `NODE_ENV=production`
- in-network `DATABASE_URL` using hostname `postgres`
- `NEXTAUTH_URL=http://localhost:3214`
- `AUTH_TRUST_HOST=true`
- Midtrans sandbox endpoints

## 4. API Flow

### Public page flow
1. User opens public route like `/events`, `/courses`, `/course/[id]`.
2. Page or client component calls public route handler such as `/api/events` or `/api/courses`.
3. Route reads Prisma directly and returns JSON.

Example: `src/app/api/events/route.ts`
- filters public event statuses
- supports `search` and `featured`
- aggregates lesson counts/duration for linked course
- returns `{ events: [...] }`

### Protected page flow
1. User enters role area like `/admin`, `/finance`, `/manager`, `/dashboard`.
2. `src/proxy.ts` checks session and route prefix.
3. Page renders.
4. Client calls `/api/**`.
5. API handler does its own auth check again using `requireRole` or `requireApiAuthPolicy`.

This double layer intentional:
- proxy protects page navigation
- API route protects data mutation/read access

### Mutating API pattern
Common server shape in repo:
1. parse request body or query
2. auth / role / same-origin / rate-limit check
3. Prisma query or domain helper call
4. `NextResponse.json(...)`
5. observability wrapper logs start/complete/error and tracing headers

Observed helper split:
- `requireRole(...)` for simple role checks
- `requireApiAuthPolicy(req, { roles, sameOrigin, rateLimit })` for stronger policy enforcement on mutating routes
- `withRequestObservability(req, handler, { event, user })` for request logs/metrics/error capture

### Payment flow
Observed checkout path:
1. Learner hits `POST /api/payments/checkout`.
2. Route uses `requireApiAuthPolicy` with same-origin + rate limit.
3. Route loads registration and validates ownership.
4. `src/lib/domain/payment-workflow.ts:createRegistrationCheckout()`
   - reuses existing pending invoice when possible
   - else creates Midtrans checkout via `src/lib/payment.ts`
   - creates `registrationPayment`
   - marks registration `paymentStatus = PENDING`
5. Response returns payment URL/token payload.

Observed webhook path pieces:
- signature verification in `src/lib/payment.ts`
- provider status fetch from Midtrans Core API
- state mapping to internal payment status
- audit log and notification emission in payment workflow domain helper

### Frontend API layer
Current pattern mixed but moving toward feature modules:
- `src/lib/api.ts` still central helper and many shared types
- `src/features/client/api/*.ts` contains feature-specific fetch/mutation functions
- recent extracted example: `src/features/client/api/admin-events.ts`

### Observability flow
`src/lib/observability/route.ts`:
- creates request context with request id / trace id / span id
- logs `.start` and `.complete`
- records HTTP metrics
- catches errors and returns structured `500`
- applies tracing headers to response

`/api/metrics` serves Prometheus-style metrics text.

## 5. Deployment

### Container strategy
`Dockerfile` uses 3 stages:
1. `deps` → `npm ci`
2. `builder` → copy source, `prisma generate`, `next build`
3. `runner` → minimal runtime with standalone Next output

Important runtime details:
- base image `node:20-alpine`
- Prisma engines copied into runtime image
- app runs as non-root user `nextjs`
- writable upload dirs created:
  - `public/uploads/evidence`
  - `public/uploads/certificates`
- container exposes port `3214`

### Production startup
Container command runs `docker-entrypoint.sh`.

Observed startup behavior:
1. `prisma migrate deploy`
2. if Prisma returns `P3005`, entrypoint prints notice and skips automatic migration because DB needs one-time baseline
3. otherwise migration failure stops container
4. starts `node server.js`

### Compose deployment
`docker-compose.yml` defines:
- app service build from local Dockerfile
- Postgres 16 with persistent volume `postgres_data`
- Adminer for DB inspection
- health checks for Postgres and app
- bridge network `renjana_network`

### Recommended release checks
Observed commands already valid for this repo:
```bash
npm run lint
npm run build
npx vitest run tests/<touched>.test.ts --exclude=.next/**
docker compose up -d --build
```

## 6. Known Issues

Observed from current repo and recent verification:

1. `README.md` drift
   - README says Next.js `16.1.6`
   - `package.json` currently uses `^16.2.6`
   - treat code/config as source of truth

2. `.next` can duplicate tests after build
   - `vitest run` without exclusion can pick built test files under `.next/standalone/tests`
   - use `--exclude=.next/**` for targeted runs when build artifacts exist

3. ESLint warning still present
   - file: `src/app/api/payments/webhook/route.ts`
   - issue: `webhookUpdate` assigned but unused
   - warning only, not build blocker

4. Turbopack / NFT trace warning during build
   - trace observed through:
     - `next.config.ts`
     - `src/lib/server/upload-storage.ts`
     - `src/app/api/evidence/route.ts`
   - build still succeeds

5. Metrics endpoint weak by default in non-production
   - if `METRICS_TOKEN` unset, `/api/metrics` allowed outside production and returns `404` instead of `401` when blocked in production
   - set `METRICS_TOKEN` in production

6. Auth config not fully mirrored in `.env.example`
   - `AUTH_TRUST_HOST` used in Docker/runtime docs but absent from `.env.example`
   - `METRICS_TOKEN` also absent from `.env.example`

7. Payment feature gated by server key, not provider flag alone
   - UI checks `NEXT_PUBLIC_PAYMENT_PROVIDER === "MIDTRANS"`
   - server enablement requires both provider flag and `MIDTRANS_SERVER_KEY`
   - partial config can show payment-oriented UI while checkout route returns gateway-not-configured response

## 7. Dependency Explanation

### Runtime dependencies
- `next`
  - framework, App Router, route handlers, standalone production build
- `react`, `react-dom`
  - UI runtime
- `next-auth`
  - credentials auth, JWT session handling, `auth()` helper for proxy/server
- `@prisma/client`
  - generated Prisma client used by app runtime
- `bcryptjs`
  - password hash comparison in credentials login
- `@tanstack/react-query`
  - client-side caching, mutations, invalidation
- `lucide-react`
  - icon set used across dashboards/forms
- `recharts`
  - chart rendering in role dashboards
- `jspdf`
  - certificate/PDF generation workflows
- `@radix-ui/react-*`
  - accessible UI primitives
- `class-variance-authority`, `clsx`, `tailwind-merge`
  - component variant and class composition helpers
- `framer-motion`
  - animation in interactive UI sections
- `@tsparticles/*`
  - particle/background visual effects
- `dotenv`
  - env loading for script/runtime contexts

### Dev dependencies
- `prisma`
  - schema, migrations, generate, CLI
- `typescript`
  - compile-time type checks
- `tsx`
  - run seed/backfill TS scripts directly
- `vitest`
  - unit/integration-style test runner for route/helper tests
- `eslint`, `eslint-config-next`
  - linting
- `tailwindcss`, `@tailwindcss/postcss`, `tw-animate-css`
  - styling toolchain
- `@types/*`
  - TS type packages

### Why split deps this way
Current package layout keeps runtime image small enough for standalone deploy while leaving build/test tools in builder stage only. Prisma client generated during build, then copied into runner image with needed engines.

## 8. Suggested Developer Conventions

Grounded in current repo patterns:
- prefer Server Components unless page needs browser-only behavior
- protect every `/api/**` handler inside route file; proxy does not secure API routes
- reuse `requireApiAuthPolicy` for mutating endpoints with same-origin and rate limit needs
- wrap non-trivial routes in `withRequestObservability`
- prefer feature-scoped frontend API modules under `src/features/client/api/` for new work
- keep Prisma access centralized through route/domain helpers, not client components
- run targeted Vitest, lint, build after non-trivial changes
