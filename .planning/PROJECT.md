# Renjana LMS Phase 3 Improvements

## What This Is

Renjana LMS is a multi-role legal training platform for Justitia Training Center. It supports event registrations, finance invoice reviews, learner portals, quiz completion tracking, attendance, evidence uploads, and automated A4 landscape PDF certificate generation.

## Core Value

Ensure instructors can securely grade learner evidence and view scoped metrics while maintaining 100% test suite reliability.

## Current Milestone: v3.0 Role Flow Audit & Bug Fixes

**Goal:** Audit and verify the existing flows for every role (ADMIN, INSTRUCTOR, MANAGER, FINANCE, LEARNER) to check whether any bugs or issues exist, and resolve them.

**Target features:**
- Admin Portal: Verify class assignment, event configuration, and registration flows.
- Instructor Portal: Validate scoped evidence viewing, grading, feedback interface, and dashboard stats.
- Manager Portal: Verify learning metrics, risk metrics, and overview charts.
- Finance Portal: Validate registration invoices, payment statuses, and audit checks.
- Learner Portal: Verify catalog registrations, lesson completion reader, pre/post quizzes, and visual progress timeline.

## Requirements

### Validated

- ✓ Next.js 16.2.6 standalone runtime configuration — existing
- ✓ NextAuth custom credentials authentication and JWT gating — existing
- ✓ PostgreSQL schema relations with Prisma ORM — existing
- ✓ Midtrans Snap payments integrations and webhooks verification — existing
- ✓ On-demand landscape A4 certificate generator with jsPDF — existing
- ✓ FEAT-01: Instructor statistics totalEvidences database count query (v1.0)
- ✓ FEAT-02: Instructor-scoped evidence access control checks on GET /api/evidence (v1.0)
- ✓ FEAT-03: Instructor database-backed grading/feedback PUT /api/evidence/[id] (v1.0)
- ✓ FEAT-04: Instructor feedback UI integration for real evidence rating and grading (v1.0)
- ✓ TEST-01: Restored registration document review boundaries tests (v1.0)
- ✓ TEST-02: Restored registration submit rules tests (v1.0)
- ✓ INTRO-01: Landing page educational content on LMS/LXP and learning methods (v2.0)
- ✓ LEARN-01: Display user profile details and summary statistics on dashboard (v2.0)
- ✓ LEARN-02: Visual timeline module and lesson progress subway map (v2.0)
- ✓ LEARN-03: Continue Learning Card banner with last active Indonesian formatted date (v2.0)
- ✓ LEARN-04: Recharts progress indicators and dynamic context insights (v2.0)

### Active

- [ ] **AUDIT-01**: Audit and fix any bugs/issues in the ADMIN portal flows.
- [ ] **AUDIT-02**: Audit and fix any bugs/issues in the INSTRUCTOR portal flows.
- [ ] **AUDIT-03**: Audit and fix any bugs/issues in the MANAGER portal flows.
- [ ] **AUDIT-04**: Audit and fix any bugs/issues in the FINANCE portal flows.
- [ ] **AUDIT-05**: Audit and fix any bugs/issues in the LEARNER portal flows.

### Out of Scope

- [ ] Complete learner-facing evidence upload UI — deferred to future milestones.
- [ ] Webinar/PKPA/Mediator activity registration and certificate flow (deferred to future milestones).

## Context

In Milestone v1.0 and v2.0, the core instructor evidence review features and learner visual dashboard enhancements were implemented and verified. For Milestone v3.0, we will perform a comprehensive end-to-end audit across all LMS roles to identify, debug, and resolve any functional, access gating, visual, or performance issues.

## Constraints

- **Tech Stack**: Next.js 16.2 App Router, React 19, TypeScript 5, Prisma ORM, PostgreSQL, Vitest.
- **Access Gating**: All protected API route handlers must independently enforce role gating using helper scopes.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Implement Evidence grading | Allow instructors to review and save rating/comments directly to the database | ✓ Completed in v1.0 |
| Visual Learning Path / Timeline | Provide learners with visual progress indicator instead of just a number | ✓ Completed in v2.0 |
| End-to-End Role Audit | Systematically verify and resolve issues across all 5 roles | — Pending |

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
*Last updated: 2026-06-07 after v3.0 initialization*
