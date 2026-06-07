# Phase 18: NextAuth & Middleware Gating Audit - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Audit and secure NextAuth session redirects, restore global middleware RBAC route gating, and verify both page and API routes independently enforce authorization policies. Specifically, split the NextAuth configuration to enable compatibility with Next.js Edge middleware runtime at `src/middleware.ts` to restore server-side route gating.

</domain>

<decisions>
## Implementation Decisions

### NextAuth Configuration Split & Edge Gating
- **D-01:** Split NextAuth configuration into `src/lib/auth.config.ts` (Edge-compatible configuration containing callbacks and basic options) and `src/lib/auth.ts` (database-enabled configuration containing Credentials provider queries and bcrypt password verification).
- **D-02:** Create `src/middleware.ts` in the project root/src directory to export the Edge-safe `auth` middleware from `src/lib/auth.config.ts`, restoring server-side route-gating before page renders.
- **D-03:** Refactor `src/proxy.ts` (or import it from `src/middleware.ts`) to enforce the route protection logic at the server level.

### Gating redirects & Fallbacks
- **D-04:** Redirect authenticated users who request an out-of-scope portal page directly to their respective home dashboard (e.g. `ADMIN` to `/admin`, `LEARNER` to `/dashboard`, etc.), preserving the current fallback routing logic.

### API Route Protection Policy
- **D-05:** Maintain local endpoint policy enforcement inside individual `/api/**` handlers using `requireApiAuthPolicy` or `requireRole`. Keep `/api/**` bypassed in the global page middleware to allow sandbox payment webhooks or public registration endpoints to be processed without complex exclusion rules.

### Session Expiration Configuration
- **D-06:** Follow default NextAuth JWT session expiration policies (30 days max age, sliding window updates).

### the agent's Discretion
- The exact file layout of `auth.config.ts` and precise route checks configuration in `middleware.ts` (reusing `src/proxy.ts` logic) are left to the agent's discretion.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Auth Configurations & Middleware
- `src/proxy.ts` — Existing route protection and fallback redirect rules
- `src/lib/auth.ts` — NextAuth Credentials provider configuration
- `src/lib/auth-utils.ts` — Server-side auth validation helpers
- `src/lib/route-policy.ts` — Declarative API request policies

### UI Protection Components
- `src/components/auth/route-guard.tsx` — Client-side route-guard wrapper

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `requireApiAuthPolicy` from `src/lib/route-policy.ts`
- `requireRole` and `requireAuth` from `src/lib/auth-utils.ts`
- `getDashboardUrl` from `src/lib/dashboard-routing.ts`

### Established Patterns
- Client-side gating via `RouteGuard` inside `protected-console-layout.tsx`.
- API handlers using `requireApiAuthPolicy(req, { sameOrigin: true, roles: ["..."] })`.

### Integration Points
- `src/middleware.ts` — Root middleware interceptor (running on Edge Runtime).
- `src/lib/auth.config.ts` — Edge-safe NextAuth credentials/JWT structure.

</code_context>

<specifics>
## Specific Ideas

- Check if `middleware.ts` successfully prevents page flash or unauthenticated layout rendering in the browser.
- Ensure that the NextAuth configuration split does not break existing test cases covering route-policy or auth-utils.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 18-NextAuth & Middleware Gating Audit*
*Context gathered: 2026-06-07*
