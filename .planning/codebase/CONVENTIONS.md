# Coding Conventions

**Analysis Date:** 2026-06-06

## Naming Patterns

**Files:**
- kebab-case for all source code files (e.g. `auth-utils.ts`, `route-guard.tsx`).
- PascalCase for React component definitions only if specified by component names (though files themselves default to kebab-case).
- `*.test.ts` for Vitest tests alongside or under `tests/` directory.

**Functions:**
- camelCase for all helper and business logic functions (e.g. `getServerUser`, `requireRole`).
- Standard HTTP methods in UPPERCASE for route handlers (e.g. `GET`, `POST`, `PUT`, `DELETE`).
- Event handlers prefixed with `handle` (e.g. `handleSubmit`, `handleSearch`).

**Variables:**
- camelCase for local variable declarations.
- UPPER_SNAKE_CASE for global constants or config boundaries (e.g. `DEFAULT_PAGE_SIZE`, `ROLE_ROUTES`).
- No special prefixes (like underscore) for private properties; standard TS visibility decorators preferred.

**Types:**
- PascalCase for interfaces, types, and class declarations.
- Do NOT prefix interfaces with `I` (use `SessionUser`, not `ISessionUser`).
- PascalCase for enums, and UPPERCASE for enum values (e.g. `Role.ADMIN`, `EventStatus.DRAFT`).

## Code Style

**Formatting:**
- No standard Prettier config file is defined in the workspace. Match surrounding formatting conventions in existing files:
  - 4-space indentation for TypeScript files.
  - Semicolons required.
  - Double quotes for string literals where surrounding files use them (standard TS compiler settings).

**Linting:**
- ESLint v9 configuration with flat config syntax in `eslint.config.mjs`.
- Configured using `next/core-web-vitals` and standard TypeScript ESLint rules.
- To execute locally: `npm run lint`.

## Import Organization

**Order:**
1. External core packages (e.g. `react`, `next/server`).
2. Database and ORM singletons (e.g. `@/lib/db`).
3. Internal utilities, scopes, and helper modules (e.g. `@/lib/auth-utils`, `@/lib/payment`).
4. Relative imports (e.g. `../route`, `./utils`).
5. Type imports (e.g. `import type { SessionUser }`).

**Grouping:**
- Keep clear separations with a blank line between external and internal imports.
- Alphabetize imports within each logical group.

**Path Aliases:**
- `@/*` alias maps directly to the `src/` directory (configured in `tsconfig.json`).

## Error Handling

**Patterns:**
- Throw clear errors in deep domain libraries (e.g., `src/lib/payment.ts`).
- Catch and format response payloads inside the API route handler controllers:
  ```typescript
  try {
      // business logic
  } catch (err) {
      errorMonitor.record(err);
      return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
  ```
- Use `withRequestObservability` wrapper to auto-catch uncaught exceptions and prevent leaking raw db errors.

**Error Types:**
- Server endpoints should return a JSON object containing a clear `error` message string (e.g., `{ error: "Forbidden" }`) as client fetch wrappers (`src/lib/api.ts`) throw on non-2xx status codes and expose the error string directly to user toast overlays.

## Logging & Observability

**Framework:**
- Custom log framework located in `src/lib/observability/`.
- `logger` handles stdout formatting.
- `errorMonitor` maps runtime exceptions.

**Patterns:**
- Wrap API handler execution blocks inside `withRequestObservability(req, async () => { ... }, { event: "event.name", user })`.
- Operations that affect user states, credentials, or payments must write database logs using `writeSecurityAuditLog(prisma, { userId, action, entity, entityId, metadata })`.

## Comments

**When to Comment:**
- Explain the business context or "why" logic exists (e.g., "why next-auth is in beta").
- Maintain all existing code comments and JSDocs during code alterations.
- Avoid obvious comments describing basic code syntax.

**TODO Comments:**
- Format: `// TODO: description` (resolved/tracked in sprint checkpoints).

## Function Design

**Early Exit:**
- Use guard clauses and return early to reduce nested code depth:
  ```typescript
  const { user, error } = await requireRole("ADMIN");
  if (error) return error;
  // proceed with admin work
  ```

**Strict Types:**
- Avoid using `any`. Ensure all inputs, options, and returns have explicit types or interfaces.
- Specify function return types explicitly when it increases codebase clarity.

## Module Design

**Exports:**
- Named exports preferred for utilities and libraries (`export function name()`).
- Default exports are reserved for Next.js App Router configurations and page templates (`export default function Page()`).

**State Mutability:**
- Keep client-side state transitions bounded inside TanStack Query React mutations.
- Always invalidate matching cached keys upon successful database writes:
  ```typescript
  queryClient.invalidateQueries({ queryKey: ["key"] });
  ```

---

*Convention analysis: 2026-06-06*
*Update when patterns change*
