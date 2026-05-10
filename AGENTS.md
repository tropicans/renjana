# Repository Guidelines

## Project Overview
- Renjana LMS = multi-role legal training platform for Justitia Training Center.
- Stack: Next.js 16 App Router, React 19, TypeScript 5, Prisma, PostgreSQL, NextAuth credentials auth, TanStack Query.
- Product shape: public marketing + event/course catalog, learner registration and payment flow, gated portals for `ADMIN`, `INSTRUCTOR`, `MANAGER`, `FINANCE`, `LEARNER`.
- Main flow: public event/course browse -> event registration -> admin/finance review -> learner activation/class-group assignment -> course progress/quizzes/evaluation/certificate.

## Architecture & Data Flow
### Request flow
1. Browser hits App Router page in `src/app/**`.
2. `src/proxy.ts` handles coarse route gating and role redirects for page routes.
3. Client pages call `/api/**` via helpers in `src/lib/api.ts`.
4. Route handlers in `src/app/api/**` run server logic with Prisma via `src/lib/db.ts`.
5. Auth checks use `src/lib/auth.ts` and `src/lib/auth-utils.ts`.
6. Client cache/state uses React Query; mutations usually invalidate related query keys.

### Auth and access control
- NextAuth config: `src/lib/auth.ts`.
- Server auth helpers: `getServerUser`, `requireAuth`, `requireRole` in `src/lib/auth-utils.ts`.
- Client auth state: `src/lib/context/user-context.tsx`.
- Client route guard: `src/components/auth/route-guard.tsx`.
- Role route map lives in `src/proxy.ts` under `ROLE_ROUTES`.
- `/api/**` routes bypass proxy checks; route handlers themselves must enforce auth/role rules.

### Server/client boundary
- Default to Server Components in `src/app`.
- Use `"use client"` only for hooks, browser APIs, React Query, form state, interactive charts/tables, toasts, redirects.
- Shared provider stack mounted in `src/components/providers.tsx`: `SessionProvider` -> `QueryClientProvider` -> language/user/toast providers.

### Data model shape
- Prisma schema: `prisma/schema.prisma`.
- Core LMS models: `User`, `Course`, `Module`, `Lesson`, `Enrollment`, `Progress`, `Attendance`, `Evidence`, `Certificate`.
- Registration/event models: `Event`, `Registration`, `RegistrationPayment`, `RegistrationDocument`, `ClassGroup`, `Notification`, `Evaluation`, `Quiz`, `QuizAttempt`.
- Repo mixes classic LMS flows with event-driven training operations; preserve both when changing schema or APIs.

## Key Directories
- `src/app` — App Router pages, layouts, route handlers.
  - `src/app/api` — server endpoints by domain and role.
  - `src/app/admin`, `instructor`, `manager`, `finance`, `dashboard` — role portals.
  - `src/app/events`, `courses`, `learn`, `my-registrations` — public/learner flows.
- `src/components` — reusable UI and domain components.
  - `src/components/ui` — shared primitives; reuse before adding new ones.
  - role folders like `admin/`, `finance/`, `instructor/`, `learner/` hold feature UI.
- `src/lib` — auth, API client, domain helpers, notifications, RBAC/scope logic, context, i18n.
- `prisma` — schema, migrations, seeds, backfill scripts.
- `tests` — Vitest suites, mostly route/helper unit tests.
- `docs` — product, phase, deployment, UAT, and org-specific documentation.
- `public` — static assets plus runtime upload targets copied into container.

## Important Files
- `package.json` — canonical scripts.
- `next.config.ts` — standalone build output, remote image allowlist, turbopack root.
- `tsconfig.json` — strict mode, bundler resolution, `@/*` alias.
- `eslint.config.mjs` — flat ESLint with Next core-web-vitals + TypeScript presets.
- `src/proxy.ts` — route gating and role-based redirects.
- `src/lib/api.ts` — browser fetch wrapper and typed API helpers.
- `src/lib/auth.ts` — NextAuth credentials setup and JWT/session mapping.
- `src/lib/auth-utils.ts` — server-side auth enforcement helpers.
- `src/lib/db.ts` — Prisma singleton.
- `src/components/providers.tsx` — root client provider composition.
- `docker-entrypoint.sh` — production migration-before-start behavior.
- `docker-compose.yml` — app + postgres + adminer local/prod-like stack.

## Development Commands
### Core
- Install deps: `npm ci`
- Local dev: `npm run dev`
- Build: `npm run build`
- Start prod server: `npm run start`
- Lint: `npm run lint`

### Database and scripts
- Generate Prisma client: `npx prisma generate`
- Seed demo data: `npm run db:seed`
- Backfill preview: `npm run db:backfill:class-group-instructors`
- Backfill apply: `npm run db:backfill:class-group-instructors:apply`

### Tests
- Run all tests: `npm run test`
- Watch tests: `npm run test:watch`
- Run one file: `npx vitest run tests/registrations-route.test.ts`

### Docker
- Start stack: `docker compose up -d --build`
- Stop stack: `docker compose down`
- Logs: `docker compose logs -f`

## Runtime & Tooling Preferences
- Runtime: Node 20+; Docker uses `node:20-alpine`.
- Package manager: npm. Use `npm`, not `pnpm` or `bun`.
- App port: `3214` in dev, prod, Docker.
- Build mode: Next standalone output. Keep container/runtime compatibility in mind when changing server dependencies.
- Database: PostgreSQL through Prisma.
- Styling: Tailwind CSS v4, `tw-animate-css`, Radix, Lucide.
- Alias: `@/*` -> `src/*`.
- No Prettier config present. Match surrounding file style; do not mass-reformat.

## Code Conventions & Common Patterns
### TypeScript
- Strict mode on. Avoid `any`.
- Prefer explicit domain types/interfaces for shared API/data shapes.
- Use type-only imports when useful.
- Keep helper return types explicit when it clarifies server contracts.

### React / Next
- Prefer Server Components for route files until client behavior needed.
- Put interactive data fetching in client components with React Query.
- Keep route-level metadata/layout patterns consistent with existing `src/app/**/layout.tsx` files.
- Role layouts already wrap protected areas with `RouteGuard`; do not duplicate client guard logic unless route needs extra checks.

### API and server logic
- Route handlers live in `src/app/api/**/route.ts`.
- Existing pattern: parse request -> auth/role check -> Prisma query/mutation -> `NextResponse.json(...)`.
- `src/lib/api.ts` throws on non-OK responses. Server endpoints should return clear `error` messages because UI surfaces them.
- Keep role/scope logic centralized. Reuse helpers like `src/lib/instructor-scope.ts`, `src/lib/registration-access.ts`, `src/lib/auth-utils.ts` before inventing new access patterns.

### State and async patterns
- Preferred client data flow: `useQuery` for reads, `useMutation` for writes, invalidate query keys on success.
- Preserve loading/error/empty/success states in UI.
- Do not silently swallow recoverable errors.
- For persisted browser data, validate before use.

### UI patterns
- Reuse `src/components/ui/**` primitives first.
- Use `cn(...)` from `src/lib/utils.ts` for class merging.
- Keep responsive classes explicit on layout-heavy pages.
- Charts already use Recharts in role dashboards; follow existing chart/container patterns when extending analytics UI.

### Naming
- Components/types/interfaces: PascalCase.
- Functions/variables: camelCase.
- Constants: UPPER_SNAKE_CASE.
- Component filenames: kebab-case, example `register-form.tsx`.
- Route segments: lowercase; dynamic params like `[id]`, `[slug]`, `[courseId]`.

## Testing & QA
- Framework: Vitest (`vitest.config.ts`), Node environment.
- Test location: root `tests/*.test.ts`.
- Current suite focus: route handlers and helper modules, often with `vi.mock(...)` on Prisma/auth dependencies.
- No observed Playwright/Cypress/browser E2E setup.
- No observed coverage thresholds or coverage script.
- Useful examples:
  - `tests/registrations-route.test.ts`
  - `tests/instructor-scope.test.ts`
  - `tests/role-routing.test.ts`
- For non-trivial changes, run targeted Vitest file(s), then `npm run lint`, then `npm run build` when change can affect compile/runtime.

## Docker & Deployment Notes
- Payment gateway code uses provider-neutral routes in `src/app/api/payments/checkout/route.ts` and `src/app/api/payments/webhook/route.ts`, currently backed by Midtrans helper logic in `src/lib/payment.ts`.
- `docker-entrypoint.sh` runs `prisma migrate deploy` before starting `node server.js` from standalone build.
- Compose stack includes `lmsapp`, `postgres`, `adminer`.
- Writable upload paths created in image: `public/uploads/evidence`, `public/uploads/certificates`.
- When touching env-driven features, check `.env.example`, `README.md`, `docker-compose.yml`, and runtime code for drift before documenting changes.

## Documentation Drift and Cautions
- Old docs may lag repo state. Example: prior `AGENTS.md` claimed no tests; repo now has Vitest tests and scripts.
- README default demo users may differ from current seed data in `prisma/seed.ts`.
- Some docs still mention earlier architecture stages or mock-data assumptions. Prefer code and Prisma schema over prose when conflict appears.
- Docs under `docs/` contain org-specific details; avoid copying sensitive operational specifics into code comments or new public docs.

## Assistant Workflow Rules
- Search before reading large files. Read only needed sections.
- Before changing exported helpers, auth logic, or shared types, inspect consumers first.
- Before adding new pattern, search for existing helper/component and reuse it.
- Prefer minimal, local changes over parallel conventions.
- After changes, check affected callsites, tests, and docs for drift.

## Validation Checklist
1. Run targeted tests for changed logic: `npm run test -- --run <file>` or `npx vitest run <file>`.
2. Run `npm run lint`.
3. Run `npm run build` for changes touching app/runtime/build-time behavior.
4. Smoke test touched flows in `npm run dev` or Docker when change affects integrated behavior.
5. Confirm no unrelated file churn or stale docs remain.
