# Roadmap: Renjana LMS Phase 3 Improvements

## Overview

This roadmap defines the phases required to transition the Renjana LMS instructor dashboard and feedback views from mocked/hardcoded systems to database-backed functionalities, while restoring the test suite's full reliability.

## Phases

- [ ] **Phase 1: Instructor Stats & Scoping** - Secure and scope evidence statistics and listings for instructors.
- [ ] **Phase 2: Database-Backed Evidence Feedback** - Implement grading, review, and saving feedback for learner evidence.
- [ ] **Phase 3: Test Suite Recovery** - Fix failing tests in document review and registration submit rules.

## Phase Details

### Phase 1: Instructor Stats & Scoping
**Goal**: Secure and scope evidence statistics and listings for instructors.
**Depends on**: Nothing
**Requirements**: STAT-01, STAT-02
**Success Criteria**:
  1. `GET /api/instructor/stats` queries the actual database count for `totalEvidences` scoped to the instructor's learners.
  2. `GET /api/evidence` filters retrieved records to only return evidence uploaded by the instructor's scoped learners when accessed by an instructor.
**Plans**: 1 plan

Plans:
- [ ] 01-01: Update stats and evidence API endpoints for instructor scoping.

### Phase 2: Database-Backed Evidence Feedback
**Goal**: Implement grading, review, and saving feedback for learner evidence.
**Depends on**: Phase 1
**Requirements**: FEEDB-01, FEEDB-02, FEEDB-03, FEEDB-04, FEEDB-05
**Success Criteria**:
  1. PUT endpoint `/api/evidence/[id]` successfully records rating (1-5) and comments in the `Evidence` model in the database.
  2. Instructor feedback page fetches real submissions from `/api/evidence` with functional document links, hides graded ones, and triggers feedback mutations.
**Plans**: 1 plan

Plans:
- [ ] 02-01: Create grading API endpoint and wire up the instructor feedback UI.

### Phase 3: Test Suite Recovery
**Goal**: Fix failing tests in document review and registration submit rules.
**Depends on**: Phase 2
**Requirements**: TEST-01, TEST-02
**Success Criteria**:
  1. All 198+ automated tests in the test suite pass with 100% success rate.
**Plans**: 1 plan

Plans:
- [ ] 03-01: Correct assertions in document review and registration submission tests.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Instructor Stats & Scoping | 0/1 | Not started | - |
| 2. Database-Backed Evidence Feedback | 0/1 | Not started | - |
| 3. Test Suite Recovery | 0/1 | Not started | - |

---
*Roadmap defined: 2026-06-06*
*Last updated: 2026-06-06 after initial definition*
