<!-- GSD:project-start source:PROJECT.md -->

## Project

**Renjana LMS Phase 3 Improvements**

Renjana LMS is a multi-role legal training platform for Justitia Training Center. It supports event registrations, finance invoice reviews, learner portals, quiz completion tracking, attendance, evidence uploads, and automated A4 landscape PDF certificate generation.

**Core Value:** Ensure instructors can securely grade learner evidence and view scoped metrics while maintaining 100% test suite reliability.

### Constraints

- **Tech Stack**: Next.js 16.2 App Router, React 19, TypeScript 5, Prisma ORM, PostgreSQL, Vitest.
- **Access Gating**: All protected API route handlers must independently enforce role gating using helper scopes.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- TypeScript 5.x - All application source code (`src/` folder)
- JavaScript (ES modules and CommonJS) - Configuration files (e.g., `eslint.config.mjs`, `postcss.config.mjs`) and Prisma seed/backfill tooling

## Runtime

- Node.js 20.x (LTS) - Standard runtime for the backend and developer tooling. Docker builds use the `node:20-alpine` base image.
- npm 10.x - Default package manager
- Lockfile: `package-lock.json` present

## Frameworks

- Next.js 16.2.6 (App Router) - Full-stack React framework for layouts, routing, pages, and API route handlers.
- React 19.2.3 / React DOM 19.2.3 - Core UI library.
- Vitest 3.2.4 - Unit and integration test runner.
- @testing-library/react (Not explicitly declared in dependencies, vitest runs node-environment API/route and helper tests).
- TypeScript 5.x - Static typing and compiler.
- Tailwind CSS v4 / @tailwindcss/postcss v4 - Utility-first CSS styling engine.
- PostCSS - CSS preprocessor.
- ESLint 9.x - Code quality and analysis tool.

## Key Dependencies

- Prisma ORM 5.22.0 - Database schema definition, migration management, and database client generation (`@prisma/client`).
- NextAuth 5.0.0-beta.31 - Authentication and session management framework (custom credentials flow).
- @tanstack/react-query 5.90.21 - Client-side state synchronization, query caching, and mutations.
- Recharts 3.7.0 - Interactive charts and graphs (used in dashboard portals).
- Framer Motion 12.24.0 - UI transition and decorative animations.
- jsPDF 4.2.1 - PDF generation (used in certificate issuance).
- bcryptjs 3.0.3 - Server-side password hashing.
- PostgreSQL client - PostgreSQL driver for relational database interactions via Prisma.
- Lucide React 0.562.0 - Icon set.
- Radix UI primitives (`@radix-ui/react-label`, `@radix-ui/react-separator`, `@radix-ui/react-slot`) - Shared UI accessible primitive components.

## Configuration

- Environment variables configured via `.env` file for local development.
- Required keys:
- `next.config.ts` - Next.js compiler and standalone output settings.
- `tsconfig.json` - Compiler flags for bundler resolution (`@/*` alias).
- `eslint.config.mjs` - ESLint linter configuration.
- `postcss.config.mjs` - PostCSS runner configuration.
- `vitest.config.ts` - Vitest test options.

## Platform Requirements

- OS: Platform agnostic (Windows, macOS, Linux).
- Docker: Required for running the database stack locally (PostgreSQL + Adminer via `docker compose up -d`).
- Standalone output bundle hosted inside Docker containers.
- Node.js 20 runtime (alpine base).
- PostgreSQL database deployment.
- Writeable storage directories for file uploads:

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- kebab-case for all source code files (e.g. `auth-utils.ts`, `route-guard.tsx`).
- PascalCase for React component definitions only if specified by component names (though files themselves default to kebab-case).
- `*.test.ts` for Vitest tests alongside or under `tests/` directory.
- camelCase for all helper and business logic functions (e.g. `getServerUser`, `requireRole`).
- Standard HTTP methods in UPPERCASE for route handlers (e.g. `GET`, `POST`, `PUT`, `DELETE`).
- Event handlers prefixed with `handle` (e.g. `handleSubmit`, `handleSearch`).
- camelCase for local variable declarations.
- UPPER_SNAKE_CASE for global constants or config boundaries (e.g. `DEFAULT_PAGE_SIZE`, `ROLE_ROUTES`).
- No special prefixes (like underscore) for private properties; standard TS visibility decorators preferred.
- PascalCase for interfaces, types, and class declarations.
- Do NOT prefix interfaces with `I` (use `SessionUser`, not `ISessionUser`).
- PascalCase for enums, and UPPERCASE for enum values (e.g. `Role.ADMIN`, `EventStatus.DRAFT`).

## Code Style

- No standard Prettier config file is defined in the workspace. Match surrounding formatting conventions in existing files:
- ESLint v9 configuration with flat config syntax in `eslint.config.mjs`.
- Configured using `next/core-web-vitals` and standard TypeScript ESLint rules.
- To execute locally: `npm run lint`.

## Import Organization

- Keep clear separations with a blank line between external and internal imports.
- Alphabetize imports within each logical group.
- `@/*` alias maps directly to the `src/` directory (configured in `tsconfig.json`).

## Error Handling

- Throw clear errors in deep domain libraries (e.g., `src/lib/payment.ts`).
- Catch and format response payloads inside the API route handler controllers:
- Use `withRequestObservability` wrapper to auto-catch uncaught exceptions and prevent leaking raw db errors.
- Server endpoints should return a JSON object containing a clear `error` message string (e.g., `{ error: "Forbidden" }`) as client fetch wrappers (`src/lib/api.ts`) throw on non-2xx status codes and expose the error string directly to user toast overlays.

## Logging & Observability

- Custom log framework located in `src/lib/observability/`.
- `logger` handles stdout formatting.
- `errorMonitor` maps runtime exceptions.
- Wrap API handler execution blocks inside `withRequestObservability(req, async () => { ... }, { event: "event.name", user })`.
- Operations that affect user states, credentials, or payments must write database logs using `writeSecurityAuditLog(prisma, { userId, action, entity, entityId, metadata })`.

## Comments

- Explain the business context or "why" logic exists (e.g., "why next-auth is in beta").
- Maintain all existing code comments and JSDocs during code alterations.
- Avoid obvious comments describing basic code syntax.
- Format: `// TODO: description` (resolved/tracked in sprint checkpoints).

## Function Design

- Use guard clauses and return early to reduce nested code depth:
- Avoid using `any`. Ensure all inputs, options, and returns have explicit types or interfaces.
- Specify function return types explicitly when it increases codebase clarity.

## Module Design

- Named exports preferred for utilities and libraries (`export function name()`).
- Default exports are reserved for Next.js App Router configurations and page templates (`export default function Page()`).
- Keep client-side state transitions bounded inside TanStack Query React mutations.
- Always invalidate matching cached keys upon successful database writes:

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## Pattern Overview

- **App Router Model:** Separation of Client Components (`"use client"`) and Server Components (default).
- **Relational Data Modeling:** Strongly-typed schema mapped to a PostgreSQL database via Prisma ORM.
- **RBAC Middleware Gating:** Coarse-grained role-based route access controls enforced before page rendering.
- **API Gated Route Handlers:** RESTful endpoint routes with explicit auth/role enforcement policies inside the handlers.
- **Client Cache Synchronization:** State querying and invalidation via TanStack Query (React Query).

## Layers

- Purpose: intercept incoming page requests and apply coarse authorization filters.
- Contains: Route mapping checks, role-based redirects.
- Depends on: NextAuth session configuration.
- Used by: Next.js middleware loader (mapped from `src/proxy.ts` into Next.js routing execution).
- Purpose: Render pages, layouts, forms, tables, and dashboards.
- Contains:
- Depends on: Client-side fetching helpers (`src/lib/api.ts`), custom contexts.
- Purpose: Process HTTP requests (GET, POST, PUT, DELETE) and return structured JSON responses.
- Contains: Route-level authentication checks, query parsing, business logic invocation, and audit logs writing.
- Depends on: Prisma Client singleton (`src/lib/db.ts`), Auth utilities (`src/lib/auth-utils.ts`), observability wrappers (`src/lib/observability/route.ts`).
- Purpose: Interface with the PostgreSQL database.
- Contains: Schema configuration, index settings, model relations, migration histories, and the Prisma client singleton.
- Used by: Route handlers and Prisma seed scripts.
- Purpose: Encapsulate domain operations.
- Contains:
- Used by: API route handlers.

## Data Flow

### 1. Public Event Registration & Payment Flow

```mermaid

```

### 2. Protected Admin User Retrieval Flow

## Key Abstractions

- `requireRole(...)` / `requireAuth()` (`src/lib/auth-utils.ts`): Server-side policy helper for route controllers.
- `requireApiAuthPolicy(...)` (`src/lib/route-policy.ts`): Declarative request policy checker that enforces same-origin constraints, CSRF protection, rate limits, and roles in one call.
- `withRequestObservability(...)` (`src/lib/observability/route.ts`): Orchestrates API request context propagation, performance profiling (p95 tracking), and automatic exception instrumentation.
- `getInstructorScope(...)` (`src/lib/instructor-scope.ts`): Resolves database queries constraints for instructors so they only view learners and modules associated with classes they teach.

## Entry Points

- Location: `src/proxy.ts`
- Triggers: On every page route navigation.
- Responsibilities: Redirect unauthenticated requests to `/login`, redirect authenticated users to their respective home portals based on roles.
- Location: `src/app/api/**/route.ts`
- Triggers: Fetch calls from browser components.
- Responsibilities: Validate inputs, call domain services, execute CRUD on Prisma, and return standard JSON outputs.

## Error Handling

- **Validation check early return:**
- **Observability encapsulation:**

## Cross-Cutting Concerns

- Managed via `NextAuth` Credentials flow. Cookie-stored sessions mapped to JWT tokens containing user ID, email, role, and profile details.
- System metrics logged to standard output. High-impact operational changes write audit records (`AuditLog` model) in the database for tracking user/admin actions.
- Schema requirements validated at route boundaries. Custom file-upload filters (`src/lib/upload-security.ts`) inspect magic numbers, extensions, and file sizes.

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
