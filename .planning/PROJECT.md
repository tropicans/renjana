# Renjana LMS Phase 3 Improvements

## What This Is

Renjana LMS is a multi-role legal training platform for Justitia Training Center. It supports event registrations, finance invoice reviews, learner portals, quiz completion tracking, attendance, evidence uploads, and automated A4 landscape PDF certificate generation.

## Core Value

Ensure instructors can securely grade learner evidence and view scoped metrics while maintaining 100% test suite reliability.

## Current Milestone: v2.0 Landing Page Intro & Learner Dashboard Enhancements

**Goal:** Implement introductory educational content on the landing page and build a comprehensive visual Learner Dashboard with progress tracking, timeline, and automated insights.

**Target features:**
- Landing Page: Introduction to digital/flexible learning, LMS/LXP, and definitions of learning methods (Mandiri, hybrid, Online, Offline).
- User Identity & Achievement: Display user profile info and high-level progress statistics.
- Visual Progress Tracking: Progress bar, module status, and interactive timeline/milestones.
- Continue Learning Card: Active learning card with "Continue Learning" action and automatic reminder to resume.
- Analytics & Insights: Interactive learning trends graph and automatic insight messages.

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

### Active

- [ ] **INTRO-01**: Add landing page content introducing digital/flexible learning, LMS/LXP, and definitions of learning methods (Mandiri, hybrid, Online, Offline).
- [ ] **LEARN-01**: Display user identity/profile details and high-level learning status/achievement statistics on the learner dashboard.
- [ ] **LEARN-02**: Build a visual timeline or milestone track representing course/module progress.
- [ ] **LEARN-03**: Create a "Continue Learning Card" with progress bar, module status, and automatic resume reminders.
- [ ] **LEARN-04**: Add learning trend charts and automated insights (e.g. drop-off alerts at specific modules) on the learner dashboard.

### Out of Scope

- [ ] Complete learner-facing evidence upload UI — deferred to future phases (learner evidence is currently verified via registrations and direct admin review).
- [ ] Admin Dashboard trends & download features (deferred to v3.0).
- [ ] Instructor Dashboard trends & module updates features (deferred to v3.0).
- [ ] Webinar/PKPA/Mediator activity registration and certificate flow (deferred to v3.0).

## Context

The codebase contains some mock UI and hardcoded API responses for the instructor role, which were addressed in v1.0. For v2.0, the landing page is simple and the learner dashboard is basic, displaying static numbers rather than a visual learning path or dynamic insights. We need to implement these new interfaces and the necessary data support.

## Constraints

- **Tech Stack**: Next.js 16.2 App Router, React 19, TypeScript 5, Prisma ORM, PostgreSQL, Vitest.
- **Access Gating**: All protected API route handlers must independently enforce role gating using helper scopes.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Implement Evidence grading | Allow instructors to review and save rating/comments directly to the database | ✓ Completed in v1.0 |
| Visual Learning Path / Timeline | Provide learners with visual progress indicator instead of just a number | — Pending |

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
*Last updated: 2026-06-06 after v2.0 initialization*
