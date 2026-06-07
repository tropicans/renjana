# Phase 16: Evidence Upload & Instructor Grading Audit - Research

## Standard Stack

- **Backend**: Next.js App Router API Handlers, Prisma ORM, PostgreSQL.
- **Frontend**: Next.js Client Components (`"use client"`), React Query (TanStack Query), Tailwind CSS v4, Lucide Icons, shadcn UI components (`button`, `card`, `input`, `label`, `toast`).
- **File System**: Node.js `fs/promises` for local file read/write operations.

---

## Codebase Analysis & Findings

### 1. Evidence Storage Location (UX-002)
- **Current State**: `src/lib/server/upload-storage.ts` defines `evidence` bucket:
  ```typescript
  evidence: {
      disk: ["public", "uploads", "evidence"],
      url: ["uploads", "evidence"],
  }
  ```
  This stores files under the `public/` directory, exposing them to direct unauthenticated access via `/uploads/evidence/...`.
- **Target Modification**: Change the `disk` array to `["uploads", "evidence"]` (removing `"public"`). The files will be saved in `uploads/evidence` under the project root, making them inaccessible via the public static asset server.

### 2. Gated API Access
- **Target Endpoint**: `GET /api/evidence/[id]/file/route.ts`
- **Security Check Sequence**:
  1. Auth check: `requireApiAuthPolicy(req, { sameOrigin: true })`.
  2. Database lookup: Query `prisma.evidence.findUnique` for the evidence record. If missing, return 404.
  3. Authorization validation:
     - If `user.role === "ADMIN"`: Approved.
     - If `evidence.userId === user.id`: Approved.
     - If `user.role === "INSTRUCTOR"`: Resolve scope via `getInstructorScope(user.id, user.name)`. Check if `evidence.userId` matches any learner ID in the instructor's scope.
     - Otherwise: return 403 Forbidden.
  4. Stream file: Read file from `uploads/evidence/${filename}` (extracted from `fileUrl`). Set `Content-Type` header based on `evidence.fileType` and stream content.

### 3. Learner UI (`/dashboard/evidence`)
- **Current State**: `src/app/dashboard/evidence/page.tsx` contains a Next.js redirect to `/my-registrations`.
- **Target modification**: Replace the redirect with a fully interactive page matching the `16-UI-SPEC.md` design contract:
  - Drag-and-drop upload zone.
  - History list showing submitted evidence records, grades, and comments.
  - Verification: file size <= 10MB, allowed types (JPEG, PNG, WebP, PDF).
  - API Integration: calls `POST /api/evidence` for uploading and `GET /api/evidence` for retrieving records.

### 4. Instructor Feedback Integration
- **Current State**: `src/app/instructor/feedback/page.tsx` links the "Lihat Dokumen" button directly to `selectedItem.fileUrl`.
- **Target Modification**: Update the link href to `/api/evidence/${selectedItem.id}/file` to force the viewer to authenticate through the secure gated route.

### 5. Evidence Deletion (Self-Cleaning Audit)
- **Target API**: Implement `DELETE /api/evidence/[id]/route.ts` (in `src/app/api/evidence/[id]/route.ts`).
  - Auth: learner must own the record.
  - State check: `rating` must be `null` (not yet graded). Graded evidence cannot be deleted.
  - File Cleanup: delete the file from the disk using `fs.unlink` before deleting the database record.

---

## Validation Architecture

### Automated Tests
- Create `tests/evidence-gated-file.test.ts` to test the secure file streaming endpoint.
- Expand `tests/evidence-grading.test.ts` to cover `DELETE /api/evidence/[id]` operations and check-group permissions.
- Validate Next.js standalone build: `npm run build`.
- Run typescript checks: `npx tsc --noEmit`.

### Manual Verification
- Deploy containers: `docker compose up -d --build`.
- Run UAT checks for `LRN-005` (Unggah Bukti), `INS-002` (Tinjau Progress), and `UX-002` (Keamanan Enkripsi).
