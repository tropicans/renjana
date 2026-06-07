# Phase 17: Certificate PDF Generation Audit - Discussion Log

## Areas Discussed & Decisions

### 1. Secure Gated Certificate Serving
- **Question**: Who should be authorized to download the certificate file?
- **Options**:
  - *Option A*: Only the owner **Learner** and **Admin** (Recommended).
  - *Option B*: Owner **Learner**, **Admin**, and the course's **Instructor** / **Manager**.
- **Decision**: **Option A**. Standard privacy limits file downloads strictly to the earner learner and admins.

### 2. PDF Download Header & Behavior
- **Question**: When a user clicks "Download PDF" on the dashboard, what should the browser do?
- **Options**:
  - *Option A*: Direct download: set `Content-Disposition: attachment; filename="..."` (Recommended).
  - *Option B*: Open inline: set `Content-Disposition: inline; filename="..."` (opens in a new browser tab/viewer).
- **Decision**: **Option A**. Forces direct download, matching the "Download PDF" CTA and ensuring a smooth user experience.

### 3. Admin Certificate Actions & Regeneration
- **Question**: Should we allow admins to regenerate a certificate if a learner's details change?
- **Options**:
  - *Option A*: Yes, support a force-regeneration trigger on the admin endpoint (`POST /api/admin/certificates/[enrollmentId]?force=true`) which overwrites the database record and unlinks/replaces the old file on disk (Recommended).
  - *Option B*: No, once issued, certificates cannot be regenerated.
- **Decision**: **Option A**. This handles real-world scenarios where names or profile details are corrected after the certificate is initially generated.

---

*Log recorded: 2026-06-07*
