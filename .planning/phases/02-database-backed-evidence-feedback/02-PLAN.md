---
wave: 1
depends_on: []
requirements:
  - FEEDB-01
  - FEEDB-02
  - FEEDB-03
  - FEEDB-04
  - FEEDB-05
files_modified:
  - prisma/schema.prisma
  - src/lib/api.ts
  - src/app/api/evidence/route.ts
  - src/app/api/evidence/[id]/route.ts
  - src/app/instructor/feedback/page.tsx
  - tests/evidence-grading.test.ts
autonomous: true
---

# Plan: Phase 2 — Database-Backed Evidence Feedback

## Goal
Implement database-backed grading, review, and saving feedback for learner evidence submissions. Store rating and comments on the database, create a PUT API endpoint at `/api/evidence/[id]`, filter pending submissions in GET `/api/evidence` by default, and replace mock data with live React Query logic on the instructor portal.

<threat_model>
### Secure Grading and Scoping for Evidence API
- **Threat**: Unauthorized Grading (Learners or unauthenticated users attempting to rate or comment on evidence).
  - **Mitigation**: Access control check at API boundary. Use `requireRole("INSTRUCTOR", "ADMIN")` to verify role access, returning a `403 Forbidden` response for unauthorized roles.
- **Threat**: Input Manipulation (Providing invalid rating integers or comment payloads).
  - **Mitigation**: Validate that the payload contains `rating` as a number between 1 and 5. Sanitize comments. Return `400 Bad Request` if invalid.
- **Threat**: Lack of Accountability / Traceability (Instructors changing ratings without an audit trail).
  - **Mitigation**: Audit logging. Use `writeSecurityAuditLog` to log `GRADE_EVIDENCE` changes in the database, capturing the actor, target evidence ID, and final rating/comment.
</threat_model>

## Tasks

### Wave 1

<task id="02-01-01" name="Update Database Schema and generate Prisma Client">
  <read_first>
    - [prisma/schema.prisma](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/prisma/schema.prisma)
  </read_first>
  <action>
    Add `rating Int?` and `comment String?` fields directly to the `Evidence` model in `prisma/schema.prisma`. Then, execute `npx prisma db push` to push the schema changes to the local PostgreSQL database, followed by `npx prisma generate` to update the Prisma client types.
  </action>
  <acceptance_criteria>
    - Source check: `prisma/schema.prisma` contains `rating Int?` and `comment String?` within the `Evidence` model.
    - CLI check: `npx prisma db push` executes successfully.
    - CLI check: `npx prisma generate` executes successfully.
  </acceptance_criteria>
</task>

<task id="02-01-02" name="Update API GET handler to support pending review filter">
  <read_first>
    - [src/app/api/evidence/route.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/evidence/route.ts)
  </read_first>
  <action>
    Modify `GET` in `src/app/api/evidence/route.ts` to read the query parameter `all` from the URL. If `all` is not equal to `true`, add a filter `rating: null` to the `where` clause of the Prisma query for all user roles (ADMIN, INSTRUCTOR, and default learners) to list only pending/ungraded evidence.
  </action>
  <acceptance_criteria>
    - Source check: `GET` function signature takes `req: Request`.
    - Source check: Contains `const { searchParams } = new URL(req.url);` and `const all = searchParams.get("all") === "true";`.
    - Behavior check: Querying `GET /api/evidence` without `?all=true` filters by `rating: null`.
    - Behavior check: Querying `GET /api/evidence?all=true` returns all records (unfiltered by rating).
  </acceptance_criteria>
</task>

<task id="02-01-03" name="Implement API PUT handler for evidence grading">
  <read_first>
    - [src/app/api/evidence/route.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/evidence/route.ts)
  </read_first>
  <action>
    Create a new file `src/app/api/evidence/[id]/route.ts` with a `PUT` handler. Enforce authentication using `requireRole("INSTRUCTOR", "ADMIN")`. Wrap execution in `withRequestObservability`. Read `rating` and `comment` from the request JSON. Validate that `rating` is an integer between 1 and 5. Update the `Evidence` record in the database. Call `writeSecurityAuditLog(prisma, { userId, action: "GRADE_EVIDENCE", entity: "EVIDENCE", entityId, metadata: { rating, comment } })`. Return the updated evidence object.
  </action>
  <acceptance_criteria>
    - Source check: `src/app/api/evidence/[id]/route.ts` exists and implements `PUT`.
    - Source check: PUT handler enforces `requireRole("INSTRUCTOR", "ADMIN")`.
    - Source check: Validates rating is a number from 1 to 5, returning 400 for invalid inputs.
    - Source check: Calls `writeSecurityAuditLog` on success.
  </acceptance_criteria>
</task>

<task id="02-01-04" name="Update API Helper and types in frontend api client">
  <read_first>
    - [src/lib/api.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/lib/api.ts)
  </read_first>
  <action>
    Modify `ApiEvidence` in `src/lib/api.ts` to include optional `rating` (number) and `comment` (string) properties. Add and export a new asynchronous function `gradeEvidence(id: string, rating: number, comment: string)` which performs a `PUT` request to `/api/evidence/${id}` with `{ rating, comment }` JSON body.
  </action>
  <acceptance_criteria>
    - Source check: `ApiEvidence` interface has `rating?: number | null;` and `comment?: string | null;`.
    - Source check: `gradeEvidence` is exported and performs a `PUT` request to `/api/evidence/${id}` returning `Promise<{ evidence: ApiEvidence }>`.
  </acceptance_criteria>
</task>

<task id="02-01-05" name="Add Unit and Integration Tests for Evidence Grading and Filtering">
  <read_first>
    - [tests/instructor-scope.test.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/tests/instructor-scope.test.ts)
  </read_first>
  <action>
    Create a new test file `tests/evidence-grading.test.ts` to test:
    1. `GET /api/evidence` defaults to `rating: null` filtering.
    2. `GET /api/evidence?all=true` bypasses the filter.
    3. `PUT /api/evidence/[id]` validates that user is authenticated as instructor/admin.
    4. `PUT /api/evidence/[id]` validates rating bounds (1-5).
    5. `PUT /api/evidence/[id]` updates database and writes security audit log.
  </action>
  <acceptance_criteria>
    - CLI check: `npx vitest run tests/evidence-grading.test.ts` passes with 0 failures.
  </acceptance_criteria>
</task>

<task id="02-01-06" name="Integrate live API into Instructor Feedback page UI">
  <read_first>
    - [src/app/instructor/feedback/page.tsx](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/instructor/feedback/page.tsx)
  </read_first>
  <action>
    Modify `src/app/instructor/feedback/page.tsx`:
    1. Import `useQuery`, `useMutation`, and `useQueryClient` from `@tanstack/react-query`.
    2. Import `fetchEvidences` and `gradeEvidence` from `@/lib/api`.
    3. Replace `mockPendingFeedback` with `useQuery` querying key `["evidences-pending"]`.
    4. Implement `useMutation` for submitting feedback. On success, invalidate key `["evidences-pending"]` and reset form state (rating, comment, selected item).
    5. Render the list dynamically based on the fetched data, displaying the student's name (`evidence.user.fullName`) and the date (`new Date(evidence.uploadedAt).toLocaleDateString()`).
    6. For the document/evidence link, render a "Lihat Dokumen" button that opens `evidence.fileUrl` in a new tab (`target="_blank"`).
  </action>
  <acceptance_criteria>
    - Source check: Mock data `mockPendingFeedback` is completely removed.
    - Source check: Query key `["evidences-pending"]` is invalidated upon successful mutation.
    - Source check: The link opening is configured with `target="_blank"`.
  </acceptance_criteria>
</task>

## Verification Criteria

### Automated Tests
- `npx vitest run tests/evidence-grading.test.ts` passes successfully.
- `npm run test` (full suite) passes successfully.
- `npm run lint` completes without errors.
- `npm run build` completes successfully.

### Manual Verification
1. Login as an instructor and navigate to `/instructor/feedback`.
2. Verify that only pending reviews (records without rating/comment) are displayed.
3. Select an item, click "Lihat Dokumen" and ensure it opens the upload link in a new tab.
4. Input star rating and comment, click "Submit Feedback", and verify the list auto-updates (the item is removed from list).

## Must Haves
- **D-01**: Stores `rating` and `comment` fields directly in the `Evidence` database model.
- **D-02**: Server-side filtering in `/api/evidence` defaulting to `rating: null` unless `?all=true` query is sent.
- **D-03**: Tautan dokumen membuka `fileUrl` di tab baru (`target="_blank"`).
- **D-04**: Access control gating `/api/evidence/[id]` (PUT) restricting access to `INSTRUCTOR` or `ADMIN` roles.
- **D-05**: Audit logging of the grading event through `writeSecurityAuditLog`.

## Artifacts this phase produces
- **New File**: [src/app/api/evidence/[id]/route.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/evidence/%5Bid%5D/route.ts) — API endpoint PUT handler.
- **New File**: [tests/evidence-grading.test.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/tests/evidence-grading.test.ts) — unit and integration tests.
- **Modified File**: [prisma/schema.prisma](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/prisma/schema.prisma) — DB schema updates.
- **Modified File**: [src/lib/api.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/lib/api.ts) — type additions and API fetcher helper.
- **Modified File**: [src/app/api/evidence/route.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/evidence/route.ts) — GET route update.
- **Modified File**: [src/app/instructor/feedback/page.tsx](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/instructor/feedback/page.tsx) — frontend view component integration.
