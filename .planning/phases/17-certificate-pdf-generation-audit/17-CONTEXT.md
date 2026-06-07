# Phase 17: Certificate PDF Generation Audit - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Validate and audit landscape A4 certificate PDF generation and download triggers. Relocate certificate file storage outside the public static directory, enforce gated download checks, and implement admin force-regeneration capabilities.

</domain>

<decisions>
## Implementation Decisions

### Secure Certificate Storage & Gated Download (UX-003)
- **D-01:** Relocate issued certificate files from the public folder by updating the `certificates` bucket disk configuration in `src/lib/server/upload-storage.ts` to `["uploads", "certificates"]`.
- **D-02:** Implement a secure gated file serving endpoint `GET /api/certificates/[enrollmentId]/file` to stream certificate PDFs.
  - Access is restricted to:
    - The learner who owns the enrollment (`enrollment.userId === user.id`).
    - Admins.
  - Returns `403 Forbidden` if unauthorized, `404 Not Found` if missing.

### Download Header & Behavior (LRN-006)
- **D-03:** Serve certificate files from `GET /api/certificates/[enrollmentId]/file` with the following headers:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="certificate-${enrollmentId.slice(0, 8)}.pdf"` (forces direct download on device).
- **D-04:** Update the download button in `src/app/dashboard/certificates/page.tsx` to point to `/api/certificates/${enrollment.id}/file` instead of direct `certificate.pdfUrl`.

### Admin Regeneration Capability (ADM-006)
- **D-05:** Update the admin certificate generation endpoint `POST /api/admin/certificates/[enrollmentId]` to support a `?force=true` query parameter.
  - If a certificate already exists and `force=true`:
    - Delete/unlink the old certificate file on disk.
    - Generate a new certificate PDF using the updated learner/course details.
    - Update the database record (`pdfUrl`) or replace it.
    - Write a security audit log trace `writeSecurityAuditLog` for regeneration.

### the agent's Discretion
- The exact name of the file generated on disk and precise database update transaction strategy are left to the agent's discretion.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Certificate Core Logic
- `src/lib/certificate-service.ts` — PDF generation & file saving logic
- `src/lib/certificate-eligibility.ts` — Eligibility validation rules (post-test, evaluations)

### Route Handlers
- `src/app/api/certificates/[enrollmentId]/route.ts` — Learner certificate metadata route
- `src/app/api/admin/certificates/[enrollmentId]/route.ts` — Admin certificate creation route

### Portals UI
- `src/app/dashboard/certificates/page.tsx` — Learner certificates list & download trigger
- `src/app/admin/registrations/page.tsx` — Admin registrations list & issue certificate trigger

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `saveManagedUpload` from `src/lib/server/upload-storage.ts`
- `getCertificateEligibility` / `getAdminCertificateEligibility` from `src/lib/certificate-eligibility.ts`
- `writeSecurityAuditLog` from `src/lib/audit.ts`

### Established Patterns
- NextAuth session checks and route protection policies using `requireApiAuthPolicy`.
- fs/promises `unlink` and `readFile` for physical file operations.

</code_context>

<specifics>
## Specific Ideas

- Ensure that if file is missing from disk during deletion/replacement, the DB update still goes through.
- Admin registrations page has an issue button that calls `POST /api/admin/certificates/[enrollmentId]`.

</specifics>

<deferred>
## Deferred Ideas

- None.

</deferred>

---

*Phase: 17-Certificate PDF Generation Audit*
*Context gathered: 2026-06-07*
