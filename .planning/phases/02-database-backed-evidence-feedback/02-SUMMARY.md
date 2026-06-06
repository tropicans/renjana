---
phase: 02-database-backed-evidence-feedback
plan: 02
subsystem: api-ui
tags: [next.js, prisma, react-query, vitest]

# Dependency graph
requires:
  - 01-instructor-stats-scoping
provides:
  - Database-backed grading and comments for evidence
  - Live instructor feedback pending list UI
  - Tab-safe document preview target=_blank
affects:
  - 03-test-suite-recovery

# Tech tracking
tech-stack:
  added: []
  patterns: [React Query client-side cache invalidation, withRequestObservability API gating, writeSecurityAuditLog]

key-files:
  created:
    - src/app/api/evidence/[id]/route.ts
    - tests/evidence-grading.test.ts
  modified:
    - prisma/schema.prisma
    - src/lib/api.ts
    - src/app/api/evidence/route.ts
    - src/app/instructor/feedback/page.tsx

key-decisions:
  - "Added rating and comment fields directly to the Evidence model for simpler schema design and high query performance."
  - "Enforced server-side filtering by rating: null by default on GET /api/evidence with a backward-compatible optional req parameter."
  - "Configured document links to open in a new tab via target='_blank' for optimal mobile/desktop compatibility."

patterns-established:
  - "Pattern 1: API mutation gating using requireRole('INSTRUCTOR', 'ADMIN') coupled with writeSecurityAuditLog for accountability."

requirements-completed:
  - FEEDB-01
  - FEEDB-02
  - FEEDB-03
  - FEEDB-04
  - FEEDB-05

# Metrics
duration: 30min
completed: 2026-06-06
---

# Phase 2: Database-Backed Evidence Feedback Summary

**Implement database-backed grading, comments, list filtering, and frontend UI integration for learner evidence review.**

## Performance

- **Duration:** 30 min
- **Started:** 2026-06-06T19:53:00+07:00
- **Completed:** 2026-06-06T20:23:00+07:00
- **Tasks:** 6
- **Files modified/created:** 6

## Accomplishments
- Updated Prisma schema to support `rating` and `comment` fields on the `Evidence` model and successfully migrated the local PostgreSQL database.
- Implemented `PUT /api/evidence/[id]` grading route secured by `INSTRUCTOR` / `ADMIN` role checks, input validation (1-5 rating), request observability, and security audit log integration.
- Updated `GET /api/evidence` route to filter by `rating: null` by default to list only pending items, with a backward-compatible query parsing check (`req?: Request`) to support older unit tests.
- Added a full test suite in `tests/evidence-grading.test.ts` verifying API list filters, role access gating, input validation, and security log calls.
- Fully integrated the frontend `src/app/instructor/feedback/page.tsx` with React Query hooks connected to the live endpoints, rendering dynamic lists and triggering feedback mutations with automatic cache invalidation on success.
- Rendered document links with a clean "Lihat Dokumen" button pointing to `fileUrl` opening in a new tab.

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Database Schema** - `5e4768e` (feat)
2. **Task 2: Update API GET handler** - `0a41d51` (feat)
3. **Task 3: Implement API PUT handler** - `3035cb3` (feat)
4. **Task 4: Update API Helper and types** - `4699ee3` (feat)
5. **Task 5: Add Unit and Integration Tests** - `5ce9b66` (test)
6. **Task 6: Integrate live API into Feedback UI** - `51d52ce` (feat)
7. **Task 7: Fix GET handler backward compatibility** - `8583cf2` (fix)

## Files Created/Modified
- `prisma/schema.prisma` - Added rating and comment fields to Evidence.
- `src/app/api/evidence/route.ts` - Supported default filter by rating: null with req?: Request backward compatibility.
- `src/app/api/evidence/[id]/route.ts` - New PUT endpoint for grading evidence.
- `src/lib/api.ts` - Updated ApiEvidence model and exposed gradeEvidence.
- `tests/evidence-grading.test.ts` - New unit and integration test suite.
- `src/app/instructor/feedback/page.tsx` - Rewrote page to bind live query data and mutate rating/comments.

## Decisions Made
- None - followed context Decisions exactly as written.

## Deviations from Plan
- Made `req` parameter optional in `GET /api/evidence` to maintain compatibility with older unit tests that call the endpoint without a Request argument.

## Issues Encountered
- Legacy unit tests (e.g. `tests/instructor-scope.test.ts`) called `GET()` route handler without parameters, which crashed when URL parsing was introduced. Making `req?: Request` optional and defaulting `all` to `true` when `req` is undefined resolved the issues.

## User Setup Required
None.

## Next Phase Readiness
- Database-backed evidence grading is fully implemented, verified, and integrated.
- Ready for Phase 3: Test Suite Recovery.

---
*Phase: 02-database-backed-evidence-feedback*
*Completed: 2026-06-06*
