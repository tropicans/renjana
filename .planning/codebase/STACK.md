# Technology Stack

**Analysis Date:** 2026-06-06

## Languages

**Primary:**
- TypeScript 5.x - All application source code (`src/` folder)

**Secondary:**
- JavaScript (ES modules and CommonJS) - Configuration files (e.g., `eslint.config.mjs`, `postcss.config.mjs`) and Prisma seed/backfill tooling

## Runtime

**Environment:**
- Node.js 20.x (LTS) - Standard runtime for the backend and developer tooling. Docker builds use the `node:20-alpine` base image.

**Package Manager:**
- npm 10.x - Default package manager
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.2.6 (App Router) - Full-stack React framework for layouts, routing, pages, and API route handlers.
- React 19.2.3 / React DOM 19.2.3 - Core UI library.

**Testing:**
- Vitest 3.2.4 - Unit and integration test runner.
- @testing-library/react (Not explicitly declared in dependencies, vitest runs node-environment API/route and helper tests).

**Build/Dev:**
- TypeScript 5.x - Static typing and compiler.
- Tailwind CSS v4 / @tailwindcss/postcss v4 - Utility-first CSS styling engine.
- PostCSS - CSS preprocessor.
- ESLint 9.x - Code quality and analysis tool.

## Key Dependencies

**Critical:**
- Prisma ORM 5.22.0 - Database schema definition, migration management, and database client generation (`@prisma/client`).
- NextAuth 5.0.0-beta.31 - Authentication and session management framework (custom credentials flow).
- @tanstack/react-query 5.90.21 - Client-side state synchronization, query caching, and mutations.
- Recharts 3.7.0 - Interactive charts and graphs (used in dashboard portals).
- Framer Motion 12.24.0 - UI transition and decorative animations.
- jsPDF 4.2.1 - PDF generation (used in certificate issuance).
- bcryptjs 3.0.3 - Server-side password hashing.

**Infrastructure:**
- PostgreSQL client - PostgreSQL driver for relational database interactions via Prisma.
- Lucide React 0.562.0 - Icon set.
- Radix UI primitives (`@radix-ui/react-label`, `@radix-ui/react-separator`, `@radix-ui/react-slot`) - Shared UI accessible primitive components.

## Configuration

**Environment:**
- Environment variables configured via `.env` file for local development.
- Required keys:
  - `DATABASE_URL` - PostgreSQL connection string.
  - `NEXTAUTH_SECRET` - Long random string for session signing.
  - `NEXTAUTH_URL` - Base URL of the application.
  - `NODE_ENV` - Production vs Development environment flag.
  - `NEXT_PUBLIC_PAYMENT_PROVIDER` - "MIDTRANS" for payment gateway configuration.
  - `MIDTRANS_SERVER_KEY` - Server-side authentication key for Midtrans.
  - `MIDTRANS_CLIENT_KEY` - Client-side key for Midtrans integrations.
  - `MIDTRANS_API_BASE_URL` - Base URL for Midtrans Snap API.
  - `MIDTRANS_CORE_API_BASE_URL` - Base URL for Midtrans Core API.

**Build:**
- `next.config.ts` - Next.js compiler and standalone output settings.
- `tsconfig.json` - Compiler flags for bundler resolution (`@/*` alias).
- `eslint.config.mjs` - ESLint linter configuration.
- `postcss.config.mjs` - PostCSS runner configuration.
- `vitest.config.ts` - Vitest test options.

## Platform Requirements

**Development:**
- OS: Platform agnostic (Windows, macOS, Linux).
- Docker: Required for running the database stack locally (PostgreSQL + Adminer via `docker compose up -d`).

**Production:**
- Standalone output bundle hosted inside Docker containers.
- Node.js 20 runtime (alpine base).
- PostgreSQL database deployment.
- Writeable storage directories for file uploads:
  - `public/uploads/evidence`
  - `public/uploads/certificates`

---

*Stack analysis: 2026-06-06*
*Update after major dependency changes*
