# Phase 16: Evidence Upload & Instructor Grading Audit - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Audit and verify the evidence upload and instructor grading capabilities. Ensure learners can upload files as evidence for modules and lessons, and instructors can view, grade, and comment on them securely under authentication/class-group gating.

</domain>

<decisions>
## Implementation Decisions

### Secure Evidence Storage & Access Gating (UX-002)
- **D-01:** Uploaded evidence files will be stored securely outside the `public/` directory (e.g., at `uploads/evidence` under the project root) to prevent unauthenticated direct download.
- **D-02:** A secure, gated API endpoint `GET /api/evidence/[id]/file` will be created to serve/stream the evidence files.
  - Access is restricted to:
    - The learner who uploaded the file.
    - Instructors who teach a class-group that the learner is enrolled in (verified via `getInstructorScope`).
    - Admins.

### Learner Upload UI (LRN-005)
- **D-03:** Implement a dedicated learner evidence upload page at `/dashboard/evidence` (removing the existing redirect to `/my-registrations`).
  - Supports drag-and-drop file upload.
  - Allowed formats: JPEG, PNG, WebP, and PDF.
  - Maximum file size: 10MB (validated by size and file signature).
  - Displays a history of the learner's submitted evidence files, their approval/review status, instructor grades, and comments.

### the agent's Discretion
- The exact layout design of `/dashboard/evidence` page, UI styling (vanilla CSS, glassmorphism, dynamic animations), and specific React Query cache keys/invalidation triggers are left to the agent's discretion.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Evidence Upload & Grading APIs
- `src/app/api/evidence/route.ts` — API route handler for list/upload evidence
- `src/app/api/evidence/[id]/route.ts` — API route handler for grading evidence
- `src/lib/server/upload-storage.ts` — File upload helper
- `src/lib/upload-security.ts` — File validation helper

### Portals UI
- `src/app/dashboard/evidence/page.tsx` — Learner evidence page (currently redirects)
- `src/app/instructor/feedback/page.tsx` — Instructor feedback/grading view

### Documentation & UAT
- `docs/skenario-uat.md` — UAT scenarios LRN-005, UX-002, and INS-002
- `docs/panduan-pengguna.md` — User guide detailing `/dashboard/evidence` and upload rules

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `validateUploadedFile` helper from `src/lib/upload-security.ts` to validate MIME types and signatures.
- `getInstructorScope` from `src/lib/instructor-scope.ts` to resolve class-group boundaries for instructors.
- `writeSecurityAuditLog` from `src/lib/audit.ts` to write security audit logs.
- Glassmorphic panels and styling tokens present in other dashboard routes.

### Established Patterns
- NextAuth user authentication validation inside route handlers via `requireApiAuthPolicy`.
- Role-based gating.

### Integration Points
- `/api/evidence` POST & GET route handler.
- `/api/evidence/[id]` PUT route handler.
- `/dashboard/evidence/page.tsx` replacing the current redirect.

</code_context>

<specifics>
## Specific Ideas

- Monas target coordinates are already validated in attendance; evidence upload should be accessible globally once enrolled.
- File size limit: exactly 10MB.
- Error for incorrect file types: `"File type not allowed. Allowed: JPEG, PNG, WebP, PDF"`.
- Error for > 10MB: `"File too large. Max 10MB"`.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 16-Evidence Upload & Instructor Grading Audit*
*Context gathered: 2026-06-07*
