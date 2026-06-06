---
wave: 1
depends_on: []
requirements:
  - STAT-01
  - STAT-02
files_modified:
  - src/app/api/instructor/stats/route.ts
  - src/app/api/evidence/route.ts
  - tests/instructor-scope.test.ts
autonomous: true
---

# Plan: Phase 1 — Instructor Stats & Scoping

## Goal
Enforce secure data scoping on evidence statistics and evidence lists for the `INSTRUCTOR` role, ensuring that instructors can only view or count records belonging to learners in Class Groups they teach, while keeping global, unscoped access for administrative (`ADMIN`) roles.

<threat_model>
### Secure Scoping and Access Control for Instructor Dashboard & Evidence API
- **Threat**: Unauthorized Data Access / Privilege Escalation (Instructors viewing evidence/statistics of learners not in their class groups).
  - **Mitigation**: Gating API endpoint checks. The requesting user's identity is resolved from the NextAuth session, and their role is verified (`requireAuth()`). For the `INSTRUCTOR` role, the dataset is restricted to learners in their assigned class groups by querying only `userId`s resolved by `getInstructorScope`.
- **Threat**: Administrative Over-restriction (Blocking administrators from viewing global statistics or evidence).
  - **Mitigation**: Admin bypass logic. If the user's role is `ADMIN`, no filters are applied, allowing unscoped global read access.
- **Threat**: Empty Scope Resource Exhaustion (Instructors without classes causing unnecessary slow Prisma database joins/queries).
  - **Mitigation**: Quick short-circuiting. If `getInstructorScope` returns no scoped learners, the handlers immediately return empty datasets without invoking Prisma queries on `enrollment`, `attendance`, or `evidence`.
</threat_model>

## Tasks

### Wave 1

<task id="01-01-01" name="Implement scoped totalEvidences count in stats API">
  <read_first>
    - [src/app/api/instructor/stats/route.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/instructor/stats/route.ts)
    - [src/lib/instructor-scope.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/lib/instructor-scope.ts)
  </read_first>
  <action>
    In `src/app/api/instructor/stats/route.ts`, replace the hardcoded `totalEvidences: 0` in the `INSTRUCTOR` response stats block with a dynamic count query. Retrieve unique learner IDs from the fetched enrollments array (`enrollments.map((e) => e.userId)`). Perform a `prisma.evidence.count` query with a `where: { userId: { in: learnerIds } }` filter. If the list of learner IDs is empty, default the count to 0 without querying the database.
  </action>
  <acceptance_criteria>
    - Source check: `src/app/api/instructor/stats/route.ts` contains a `prisma.evidence.count` call matching `userId: { in: learnerIds }` (or similar array lookup).
    - Source check: Hardcoded `totalEvidences: 0` is replaced with the dynamic query result variable.
    - Behavior check: If `learnerIds` length is 0, database count is skipped and `0` is returned.
  </acceptance_criteria>
</task>

<task id="01-01-02" name="Implement scoped evidence list in evidence API">
  <read_first>
    - [src/app/api/evidence/route.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/evidence/route.ts)
    - [src/lib/instructor-scope.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/lib/instructor-scope.ts)
  </read_first>
  <action>
    In `src/app/api/evidence/route.ts`, separate the `INSTRUCTOR` and `ADMIN` role access checks in the `GET` handler. For the `ADMIN` role, return all evidence unscoped. For the `INSTRUCTOR` role, import and call `getInstructorScope(user!.id, user!.name)` to retrieve the instructor's class scoping. Extract `learnerIds` from the scope's `enrollmentPairs`. If the instructor has no scoped learners, immediately return `NextResponse.json({ evidences: [] })` without querying the database. Otherwise, query `prisma.evidence.findMany` with `where: { userId: { in: learnerIds } }`, ordered by `uploadedAt: "desc"`, including `user: { select: { id: true, fullName: true, email: true } }`.
  </action>
  <acceptance_criteria>
    - Source check: `src/app/api/evidence/route.ts` imports `getInstructorScope` from `@/lib/instructor-scope`.
    - Source check: Gated logic checks `role === "ADMIN"` separately from `role === "INSTRUCTOR"`.
    - Source check: `INSTRUCTOR` block calls `prisma.evidence.findMany` with `where: { userId: { in: learnerIds } }`.
    - Behavior check: If `learnerIds.length === 0`, database query is skipped and an empty list is returned instantly.
  </acceptance_criteria>
</task>

<task id="01-01-03" name="Update and add unit/integration tests">
  <read_first>
    - [tests/instructor-scope.test.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/tests/instructor-scope.test.ts)
    - [src/app/api/evidence/route.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/evidence/route.ts)
    - [src/app/api/instructor/stats/route.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/instructor/stats/route.ts)
  </read_first>
  <action>
    Update `tests/instructor-scope.test.ts` to mock and verify the new scoping behaviors:
    1. Add `findMany: vi.fn()` to `mocks.prisma.evidence` in `vi.hoisted`.
    2. Import `GET as evidenceGet` from `@/app/api/evidence/route`.
    3. Update the existing test `"returns zero evidence and scoped aggregates for instructor stats"` to assert that `body.stats.totalEvidences` returns the dynamic mocked count of `3` from `mocks.prisma.evidence.count`.
    4. Add a test `"GET /api/evidence as INSTRUCTOR with scoped learners"` verifying that `prisma.evidence.findMany` is called with `where: { userId: { in: [...] } }`.
    5. Add a test `"GET /api/evidence as INSTRUCTOR with empty scope"` verifying that `prisma.evidence.findMany` is not called and the response is `{ evidences: [] }`.
    6. Add a test `"GET /api/evidence as ADMIN (unscoped global access)"` verifying that `prisma.evidence.findMany` is called with no `userId` scoping.
  </action>
  <acceptance_criteria>
    - Test execution: `npx vitest run tests/instructor-scope.test.ts` passes with exit code 0.
    - Test coverage covers: Stats endpoint evidence count check, Evidence list scoping for instructor, Empty scope short-circuiting, and Admin unscoped access.
  </acceptance_criteria>
</task>

## Verification Criteria

### Automated Tests
- Running `npx vitest run tests/instructor-scope.test.ts` executes successfully.
- Running the full test suite `npm run test` executes successfully.

### Manual Verification
- No manual verification required (all scopes are covered by unit/integration tests).

## Must Haves
- **D-01**: Implement early return/short-circuiting for empty scope to save DB calls in `/api/instructor/stats` and `/api/evidence`.
- **D-02**: Correctly filter database-backed data for `INSTRUCTOR` roles to their scoped learners regardless of enrollment status.
- **D-03**: Retain unscoped full data access for `ADMIN` roles in `/api/evidence`.

## Artifacts this phase produces
No new symbols or files are created in this phase. Existing API handlers and tests are updated:
- Modified function: `GET` route handler in [src/app/api/instructor/stats/route.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/instructor/stats/route.ts)
- Modified function: `GET` route handler in [src/app/api/evidence/route.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/evidence/route.ts)
- Modified file: [tests/instructor-scope.test.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/tests/instructor-scope.test.ts)
