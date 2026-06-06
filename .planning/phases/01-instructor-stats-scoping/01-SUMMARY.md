---
phase: 01-instructor-stats-scoping
plan: 01
subsystem: api
tags: [next.js, prisma, vitest]

# Dependency graph
requires: []
provides:
  - Secure scoped totalEvidences count in stats API for instructors
  - Secure scoped evidence listing in evidence API for instructors
affects:
  - 02-evidence-grading-and-metrics

# Tech tracking
tech-stack:
  added: []
  patterns: [instructor scoping via getInstructorScope helper]

key-files:
  created: []
  modified:
    - src/app/api/instructor/stats/route.ts
    - src/app/api/evidence/route.ts
    - tests/instructor-scope.test.ts

key-decisions:
  - "Used getInstructorScope helper to filter totalEvidences count dynamically or short-circuit to 0 when scope is empty."
  - "Used getInstructorScope helper in /api/evidence route to secure evidence listing for instructors, with admin bypass."

patterns-established:
  - "Pattern 1: Secure API scoping by fetching instructor learner IDs and short-circuiting empty sets."

requirements-completed:
  - STAT-01
  - STAT-02

# Metrics
duration: 45min
completed: 2026-06-06
---

# Phase 1: Instructor Stats & Scoping Summary

**Secure scoping of learner evidence and statistics count for the INSTRUCTOR role with full administrator bypass and empty-set query optimization**

## Performance

- **Duration:** 45 min
- **Started:** 2026-06-06T19:00:00+07:00
- **Completed:** 2026-06-06T19:45:00+07:00
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Implemented secure scoping for instructor dashboard stats, resolving and counting unique learner evidences dynamically.
- Implemented secure scoping for the GET `/api/evidence` endpoint, filtering results to the instructor's scoped learners while preserving global access for administrators.
- Added extensive test coverage for both endpoints in `tests/instructor-scope.test.ts` (and verified they pass in the standalone build output as well).

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement scoped totalEvidences count in stats API** - `bc35daa` (feat)
2. **Task 2: Implement scoped evidence list in evidence API** - `adb62ee` (feat)
3. **Task 3: Update and add unit/integration tests** - `1712806` (test)

## Files Created/Modified
- `src/app/api/instructor/stats/route.ts` - Integrated dynamic `totalEvidences` query count.
- `src/app/api/evidence/route.ts` - Scoped evidence retrieval by instructor's assigned learner scope.
- `tests/instructor-scope.test.ts` - Added stats verification and three new scoping tests for `/api/evidence`.

## Decisions Made
- None - followed plan as specified.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
- Next.js standalone build stores a snapshot of files (including tests) under `.next/standalone`. The test runner runs tests in both places, meaning source code updates without a rebuild caused tests in `.next/standalone` to fail. Performing a full build (`npm run build`) synchronized the directories and resolved the failures.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Scoped instructor metrics and evidence listing completed and fully covered by tests.
- Ready for the next phase.

---
*Phase: 01-instructor-stats-scoping*
*Completed: 2026-06-06*
