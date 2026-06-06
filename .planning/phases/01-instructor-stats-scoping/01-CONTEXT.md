# Phase 1: Instructor Stats & Scoping - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Securing and scoping evidence statistics and listings for the instructor role. Ensures that endpoints `/api/instructor/stats` and `/api/evidence` return database-backed data filtered to only return and count records belonging to learners who are registered in Class Groups taught by the requesting instructor, while maintaining global unscoped access for administrative (ADMIN) roles.

</domain>

<decisions>
## Implementation Decisions

### Penanganan Instruktur Tanpa Kelas (Empty Scope)
- **D-01:** Jika instruktur tidak memiliki data kelas atau learner yang di-scope (empty scope), API `/api/instructor/stats` dan `/api/evidence` harus langsung mengembalikan data kosong secara instan (stats bernilai 0, list evidence berupa array kosong `[]`) tanpa memicu query database (Prisma) demi efisiensi performa.

### Definisi Learner yang Di-scope
- **D-02:** Scoped learner diidentifikasi berdasarkan seluruh pendaftaran (registrations) di Class Group yang diajar oleh instruktur tersebut (menggunakan helper `getInstructorScope`), tanpa memfilter status enrollment (aktif/selesai/lainnya), agar instruktur tetap memiliki visibilitas historis atas seluruh progres learner di kelasnya.

### Akses Global Admin pada API Evidence
- **D-03:** Endpoint `/api/evidence` untuk role `ADMIN` tetap mengembalikan seluruh data secara global tanpa pembatasan scope (unscoped), mempertahankan hak akses penuh administratif platform.

### the agent's Discretion
- Penentuan struktur optimal query database (Prisma query filters) untuk mencocokkan user ID dari scoped learner ke evidence (menggunakan database `userId` pada model `Evidence`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scoping & Auth Logic
- [instructor-scope.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/lib/instructor-scope.ts) — Berisi utilitas penyaring scope data instruktur (`getInstructorScope`).
- [auth-utils.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/lib/auth-utils.ts) — Mengontrol otentikasi server (`requireAuth`).

### Target API Endpoints
- [stats/route.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/instructor/stats/route.ts) — API endpoint untuk statistik dasbor instruktur.
- [evidence/route.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/evidence/route.ts) — API endpoint untuk mengambil dan mengunggah evidence.

### Requirements & Roadmap
- [ROADMAP.md](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/.planning/ROADMAP.md) — Rencana milestone dan sukses kriteria Phase 1.
- [REQUIREMENTS.md](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/.planning/REQUIREMENTS.md) — Definisi kebutuhan STAT-01 dan STAT-02.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getInstructorScope(userId, userName)`: Digunakan untuk mengambil daftar `enrollmentPairs` yang menghubungkan `userId` (learner) dan `courseId` yang diajar instruktur.

### Established Patterns
- Menggunakan `requireAuth()` untuk otentikasi role-based gating di dalam handler route API.
- Mengembalikan response JSON standar yang berisi data, atau `{ error: "..." }` jika gagal.

### Integration Points
- `/api/instructor/stats` (GET): Mengganti hardcoded `totalEvidences: 0` dengan hasil count evidence riil database dari scoped learner.
- `/api/evidence` (GET): Menambahkan logic penyaringan data evidence berdasarkan `userId` jika role-nya adalah `INSTRUCTOR`.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 1-Instructor Stats & Scoping*
*Context gathered: 2026-06-06*
