# Dependency Upgrade Plan

Date: 2026-05-09

Scope:
- `next-auth@5.0.0-beta.31`
- `jspdf@4.2.1` with transitive `dompurify`
- `prisma@5.22.0`
- `@prisma/client@5.22.0`

Goal:
- reduce runtime and maintenance risk without breaking auth, certificate generation, or database access
- sequence upgrades by blast radius and verification cost

## Current Code Surfaces

### Auth surface
Primary file:
- `src/lib/auth.ts`

Observed behavior:
- credentials provider only
- custom rate limiting inside `authorize(...)`
- Prisma user lookup by email
- bcrypt password compare
- JWT session strategy
- custom `jwt` and `session` callbacks that attach `id` and `role`
- exports `handlers`, `signIn`, `signOut`, `auth`

Downstream usage observed in:
- `src/lib/auth-utils.ts`
- `src/proxy.ts`
- `src/components/providers.tsx`
- auth forms using `signIn` from `next-auth/react`

Break risk:
- session shape drift
- middleware/proxy auth wrapper drift
- credentials authorize signature drift
- route guard regressions

### PDF / certificate surface
Primary file:
- `src/lib/certificate-service.ts`

Observed behavior:
- creates `jsPDF` document entirely from explicit text drawing
- no HTML rendering path
- emits `arraybuffer`
- writes PDF to managed upload storage
- persists Prisma certificate record

Break risk:
- output API changes in `jsPDF`
- buffer/output shape changes
- font/layout drift in generated certificate

### Prisma surface
Primary files:
- `src/lib/db.ts`
- `prisma/schema.prisma`
- many route handlers under `src/app/api/**`
- Prisma scripts under `prisma/*.ts`

Observed usage pattern:
- standard Prisma Client queries and mutations
- singleton client in app runtime
- explicit `npx prisma generate` in prebuild and Docker build
- `docker-entrypoint.sh` runs `prisma migrate deploy`

Break risk:
- generated client location/runtime changes across major
- CLI behavior changes in build/deploy scripts
- schema incompatibility or stricter typing surfacing latent bugs

## Recommended Sequence

### Step 1. Upgrade `jspdf` first
Reason:
- smallest blast radius
- isolated single service path
- directly targets runtime vulnerability chain

Plan:
1. check current latest safe `jspdf` line and whether patched `dompurify` lands transitively
2. upgrade only `jspdf`
3. inspect lockfile to confirm resolved `dompurify` version
4. verify certificate generation path

Acceptance:
- `npm audit` no longer reports `jspdf -> dompurify` issue, or risk is explicitly reduced with observed new version [inference if advisory persists]
- `src/lib/certificate-service.ts` compiles unchanged or with minimal API edits
- certificate-generation tests pass if added/updated
- build passes

Suggested verification:
- add focused unit test around `generateCertificateRecord()` mocking upload + Prisma create
- run `npm run build`

Rollback boundary:
- revert only `jspdf` and lockfile if PDF generation output or API breaks

### Step 2. Upgrade `next-auth` on dedicated branch/slice
Reason:
- auth is critical path
- current package is prerelease and should not move in same slice as Prisma

Plan:
1. decide target explicitly:
   - preferred: stable Auth.js/NextAuth path supported by current Next.js version
   - alternative: newer vetted v5 release if stable and docs confirm production support
2. read official migration guide for chosen target
3. upgrade package only
4. adapt `src/lib/auth.ts` contract if required
5. verify server auth helpers and middleware behavior
6. verify client `signIn` / `useSession` flow

Acceptance:
- login success path still works for active user with valid password
- inactive user still blocked
- invalid password still rejected
- JWT session still carries `user.id` and `user.role`
- `src/proxy.ts` route gating still works
- targeted auth tests pass
- build passes

Suggested verification set:
- `tests/admin-user-role-default.test.ts`
- `tests/auth-register-rate-limit.test.ts`
- any tests touching `requireRole`, `getServerUser`, or request auth policy
- manual smoke in browser for `/login` and protected page redirect

Rollback boundary:
- revert auth package + touched auth files only

### Step 3. Upgrade Prisma pair last
Reason:
- biggest blast radius
- touches build, runtime, scripts, and deploy chain
- best done after auth and PDF risk trimmed

Plan:
1. read Prisma v7 upgrade guide fully
2. upgrade `prisma` and `@prisma/client` together
3. run `prisma generate`
4. fix compile/type issues surfaced in routes/helpers/tests
5. verify build scripts, Docker build, and entrypoint migration behavior
6. rerun focused data route tests, then full app build

Acceptance:
- `npx prisma generate` succeeds locally and in Docker build
- `npm run build` succeeds
- `docker compose up -d --build` succeeds
- critical route/helper tests pass
- no schema or migration drift introduced unintentionally

Suggested verification set:
- tests covering registration, payment, instructor-scope, manager learners, evaluation/certificate linkage
- `npm run lint`
- `npm run build`
- `docker compose up -d --build`

Rollback boundary:
- revert Prisma pair and any generated-lockfile changes if build/deploy path breaks

## Safe Execution Rules

1. Do not upgrade `next-auth` and Prisma in same commit.
2. Do not combine behavior refactors with dependency upgrade commits.
3. For auth and Prisma, take clean cutover per package slice; avoid mixed compatibility shims unless unavoidable.
4. After each slice:
   - inspect lockfile resolved versions
   - rerun targeted tests
   - rerun `npm run build`
5. For Prisma slice, include Docker rebuild because deploy path depends on generated client and CLI.

## Minimal Order of Operations

1. `jspdf`
2. `next-auth`
3. `prisma` + `@prisma/client`

## Immediate Next Commands

### `jspdf`
```bash
npm install jspdf@latest
npm audit
npm run build
```

### `next-auth`
```bash
npm install next-auth@latest
npm run lint
npm run build
```

### Prisma
```bash
npm install prisma@latest @prisma/client@latest
npx prisma generate
npm run lint
npm run build
docker compose up -d --build
```

Do not run those three upgrades together.