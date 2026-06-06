# Renjana LMS Phase 3 Improvements

## What This Is

Renjana LMS is a multi-role legal training platform for Justitia Training Center. It supports event registrations, finance invoice reviews, learner portals, quiz completion tracking, attendance, evidence uploads, and automated A4 landscape PDF certificate generation.

## Core Value

Ensure instructors can securely grade learner evidence and view scoped metrics while maintaining 100% test suite reliability.

## Requirements

### Validated

- ✓ Next.js 16.2.6 standalone runtime configuration — existing
- ✓ NextAuth custom credentials authentication and JWT gating — existing
- ✓ PostgreSQL schema relations with Prisma ORM — existing
- ✓ Midtrans Snap payments integrations and webhooks verification — existing
- ✓ On-demand landscape A4 certificate generator with jsPDF — existing

### Active

- [ ] **FEAT-01**: Retrieve actual database count for `totalEvidences` in instructor stats endpoint instead of returning hardcoded 0.
- [ ] **FEAT-02**: Enforce secure access controls on `GET /api/evidence` to return only evidence uploaded by learners scoped to the instructor.
- [ ] **FEAT-03**: Support database-backed grading and comment feedback on `Evidence` uploads via PUT method on `/api/evidence/[id]`.
- [ ] **FEAT-04**: Replace mock instructor feedback UI to fetch real learner evidence submissions and submit actual grade/comments.
- [ ] **TEST-01**: Repair failing document review boundaries tests in `tests/registration-document-review-boundaries.test.ts`.
- [ ] **TEST-02**: Repair failing registration submit rules tests in `tests/registration-submit-rules.test.ts`.

### Out of Scope

- [ ] Complete learner-facing evidence upload UI — deferred to future phases (learner evidence is currently verified via registrations and direct admin review).

## Context

The codebase contains some mock UI and hardcoded API responses for the instructor role. Additionally, several pre-existing tests in the test suite are failing due to slight differences in error message expectations and HTTP status codes returned by registration routes.

## Constraints

- **Tech Stack**: Next.js 16.2 App Router, React 19, TypeScript 5, Prisma ORM, PostgreSQL, Vitest.
- **Access Gating**: All protected API route handlers must independently enforce role gating using helper scopes.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Implement Evidence grading | Allow instructors to review and save rating/comments directly to the database | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-06 after initialization*
