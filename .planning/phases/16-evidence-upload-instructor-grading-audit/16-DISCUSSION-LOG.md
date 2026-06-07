# Phase 16: Evidence Upload & Instructor Grading Audit - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 16-evidence-upload-instructor-grading-audit
**Areas discussed:** Evidence Access & Storage Security

---

## Evidence Access & Storage Security (UX-002)

| Option | Description | Selected |
|--------|-------------|----------|
| Option A | Store files in a non-public folder and serve them via a secure gated API endpoint. | ✓ |
| Option B | Keep files in public folder and serve them via obfuscated public UUID URLs. | |

**User's choice:** Option A.
**Notes:** Storing files outside of the public directory and streaming them through a custom API route enforces correct authentication/authorization checks.

---

## the agent's Discretion

- Learner Upload UI design layout and specific visual enhancements for `/dashboard/evidence` (vanilla CSS, glassmorphism, dynamic animations).
- Choice of React Query keys and query invalidation strategies.

## Deferred Ideas

- None — discussion stayed within phase scope.
