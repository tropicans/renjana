# Phase 18: NextAuth & Middleware Gating Audit - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 18-NextAuth & Middleware Gating Audit
**Areas discussed:** NextAuth Edge Gating, Gating Redirects, API Route Gating, Session Config

---

## NextAuth Edge Gating (Server Gating vs Client Gating)

| Option | Description | Selected |
|--------|-------------|----------|
| Option A (Recommended) | Split NextAuth configuration into Edge-compatible `auth.config.ts` and database-enabled `auth.ts`. Create `src/middleware.ts` to restore server-side route-gating before page renders. | ✓ |
| Option B | Maintain client-side only gating via the React `RouteGuard` component, and leave server-side pages unprotected by middleware. | |

**User's choice:** Option A (Recommended)
**Notes:** User agreed with recommended approach.

---

## Unauthorized Page Gating Redirects & Fallbacks

| Option | Description | Selected |
|--------|-------------|----------|
| Option A (Recommended) | Silently redirect unauthorized users directly to their respective homepage dashboard (e.g. `/admin`, `/instructor`, `/finance`, `/dashboard`). | ✓ |
| Option B | Redirect them to a custom `403 Access Denied` error page. | |

**User's choice:** Option A (Recommended)
**Notes:** User agreed with recommended approach.

---

## API Route Gating Policy (/api/**)

| Option | Description | Selected |
|--------|-------------|----------|
| Option A (Recommended) | Maintain local endpoint gating via `requireApiAuthPolicy` / `requireRole` wrappers. | ✓ |
| Option B | Enforce directory-level route protection in `middleware.ts` (e.g. automatically block `/api/admin/**`). | |

**User's choice:** Option A (Recommended)
**Notes:** User agreed with recommended approach.

---

## Session Expiration Configuration

| Option | Description | Selected |
|--------|-------------|----------|
| Option A (Recommended) | Follow default NextAuth JWT session settings (30 days max age). | ✓ |
| Option B | Enforce a stricter security policy (e.g. 7 days max age). | |

**User's choice:** Option A (Recommended)
**Notes:** User agreed with recommended approach.

---

## the agent's Discretion

- Splitting details of `auth.config.ts` and configuration of `middleware.ts`.

## Deferred Ideas

- None.
