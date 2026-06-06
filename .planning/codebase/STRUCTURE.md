# Codebase Structure

**Analysis Date:** 2026-06-06

## Directory Layout

```
renjana/
├── .agent/              # GSD configuration, workflows, and skills
├── docs/                # Product requirement docs, solution designs, and deployment guides
├── prisma/              # Prisma schema, migrations, seed, and backfill scripts
├── public/              # Static assets (images, logos) and local upload folders
│   └── uploads/         # User-uploaded files (evidence, certificates)
├── src/                 # Main application source code
│   ├── app/             # Next.js App Router layout, page, and API route definitions
│   │   ├── admin/       # Administrator portal dashboard pages
│   │   ├── api/         # REST API endpoints (role-gated and public)
│   │   ├── courses/     # Public event/course directories and details
│   │   ├── dashboard/   # Learner portal dashboard pages
│   │   ├── events/      # Public event registrations and details
│   │   ├── finance/     # Finance portal dashboards and invoice views
│   │   ├── instructor/  # Instructor portal course/lesson management pages
│   │   ├── learn/       # Learning classroom interface for course progress
│   │   ├── login/       # Authentication entry point
│   │   ├── manager/     # Manager portal course/module approvals pages
│   │   └── my-registrations/ # Learner registration status histories
│   ├── components/      # Reusable React components
│   │   ├── ui/          # Shared basic interface primitives (Radix/Tailwind)
│   │   └── [role]/      # Domain components separated by user roles
│   ├── features/        # Complex vertical feature modules (if any)
│   └── lib/             # Core business utilities, services, hooks, and singletons
├── tests/               # Automated test suite (Vitest)
├── next.config.ts       # Next.js compiler and build configuration
├── package.json         # Project dependency manifest and command scripts
├── tsconfig.json        # TypeScript compiler configurations
└── vitest.config.ts     # Vitest runner settings
```

## Directory Purposes

**src/app/:**
- Purpose: Defines layout templates, routing structures, pages, and server-side route endpoints.
- Contains: `layout.tsx`, `page.tsx`, `route.ts`, and component styles.
- Subdirectories: Separated into role portals (`admin`, `instructor`, `manager`, `finance`, `dashboard`) and public pages (`events`, `courses`, `login`, `register`).

**src/components/:**
- Purpose: Stores presentation and interactive UI components.
- Contains: `*.tsx` React component files.
- Subdirectories:
  - `ui/` - Contains core design primitives (e.g. `button.tsx`, `dialog.tsx`, `input.tsx`).
  - Role subdirectories (`admin/`, `finance/`, `instructor/`, `learner/`, `manager/`) - Hold components specific to these functional areas.

**src/lib/:**
- Purpose: Contains application services, singletons, and utility functions.
- Contains: Business logic libraries, authentication hooks, and database client definitions.
- Key files:
  - `db.ts` - Singleton instance exporter of the Prisma Client.
  - `auth.ts` - Configuration definitions for NextAuth.
  - `auth-utils.ts` - Server-side authentication gating policies.
  - `payment.ts` - REST client integrations for Midtrans payments.
  - `api.ts` - Typed client wrapper for fetching internal backend APIs.

**prisma/:**
- Purpose: Manages database definitions and mutations.
- Contains: Prisma database schema and SQL/TS seeding scripts.
- Key files:
  - `schema.prisma` - DB tables, model relations, index declarations, and role enums.
  - `seed.ts` - Seeding logic for default roles, courses, and dummy data.

**tests/:**
- Purpose: Automated test suites.
- Contains: Vitest `*.test.ts` test files.
- Key files:
  - `role-routing.test.ts` - Gating redirects tests.
  - `instructor-scope.test.ts` - Class scope tests for instructors.
  - `registrations-route.test.ts` - Course registration handler tests.

**public/uploads/:**
- Purpose: Local file system upload destinations.
- Contains: Learner uploaded documents and generated PDF certificates.
- Committed: No (specifically excluded in `.dockerignore` and `.gitignore`).

## Key File Locations

**Entry Points:**
- `src/proxy.ts` - Authentication/Authorization middleware gate.
- `src/app/page.tsx` - Root landing page routing endpoint.
- `src/app/layout.tsx` - Global root layout.

**Configuration:**
- `package.json` - Dependency declarations and scripts.
- `next.config.ts` - Next.js config settings.
- `tsconfig.json` - TS compiler mapping paths.
- `eslint.config.mjs` - ESLint linter parameters.
- `.env.example` - Environment variable templates.

**Core Logic:**
- `src/lib/db.ts` - Database wrapper.
- `src/lib/auth.ts` - Authentication configs.
- `src/lib/payment.ts` - Payment gateway connector.

**Testing:**
- `vitest.config.ts` - Test suite runtime configs.
- `tests/` - Directory containing Vitest specs.

**Documentation:**
- `AGENTS.md` - Agent rules and repository outlines.
- `README.md` - Getting started instructions.
- `docs/developer-guide.md` - Comprehensive engineering handbook.

## Naming Conventions

**Files:**
- `kebab-case.ts / kebab-case.tsx` - All files under `src/app`, `src/lib`, `src/components`, and `tests` (e.g. `auth-utils.ts`, `route-guard.tsx`).
- `*.test.ts` - Vitest test files matching source code targets.

**Directories:**
- `kebab-case` - Standard directory names (e.g., `class-groups`, `my-registrations`).
- `[param]` - Next.js App Router dynamic segment folders (e.g., `[slug]`, `[id]`).

**Special Patterns:**
- `index.ts` - Barely used; imports are resolved via direct path mappings (e.g. `@/lib/auth-utils`).

## Where to Add New Code

**New Feature:**
- Public route page: `src/app/[feature-name]/page.tsx`
- Private route page: `src/app/[role]/[feature-name]/page.tsx`
- Feature components: `src/components/[role]/[feature-name]-form.tsx`
- Feature tests: `tests/[feature-name].test.ts`

**New API Endpoint:**
- Endpoint definition: `src/app/api/[domain]/[sub-domain]/route.ts`
- Handler logic: call helpers from `src/lib/[domain].ts` or direct Prisma mutations inside `route.ts`.
- Endpoint tests: `tests/[domain]-route.test.ts`

**New Utility or Service:**
- Implementation: `src/lib/[utility-name].ts`
- API client bindings: add typings and functions to `src/lib/api.ts`.
- Utility tests: `tests/[utility-name].test.ts`

## Special Directories

**public/uploads/evidence/**
- Purpose: Temporary target destination for student upload documents (KTP, Photos, etc.).
- Source: Uploaded at runtime via evidence route handlers.
- Committed: No (ignored).

**public/uploads/certificates/**
- Purpose: Target destination for generated PDF certificates.
- Source: Generated by jsPDF at runtime.
- Committed: No (ignored).

**.next/**
- Purpose: Next.js compiler output directory.
- Source: Generated via `npm run build` or `npm run dev`.
- Committed: No (ignored).

---

*Structure analysis: 2026-06-06*
*Update when directory structure changes*
