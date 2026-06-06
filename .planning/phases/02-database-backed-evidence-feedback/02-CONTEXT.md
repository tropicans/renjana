# Phase 2: Database-Backed Evidence Feedback - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementing database-backed grading, review, and saving feedback for learner evidence submissions. Involves updating the database schema to store rating and comments, creating a `PUT` API endpoint at `/api/evidence/[id]`, modifying `GET /api/evidence` to filter pending submissions, and replacing the mocked feedback dashboard in the instructor portal with a fully functional UI linked to the live endpoints.

</domain>

<decisions>
## Implementation Decisions

### Perubahan Schema Database
- **D-01:** Menambahkan field opsional `rating Int?` dan `comment String?` langsung pada model `Evidence` di `prisma/schema.prisma` untuk menyimpan nilai rating (1-5) dan komentar instruktur secara terintegrasi dan berkinerja tinggi.

### Penyaringan Evidence yang Belum Dinilai
- **D-02:** Penyaringan data dilakukan di sisi server (server-side filtering). Endpoint `GET /api/evidence` secara default hanya akan mengembalikan data evidence yang belum dinilai (`rating: null`). Jika parameter `?all=true` diberikan, API akan mengembalikan seluruh riwayat (termasuk yang sudah dinilai).

### Tampilan Detail Submission dan Tautan Dokumen
- **D-03:** Tautan dokumen evidence ditampilkan sebagai tombol "Lihat Dokumen" yang akan membuka url file (`fileUrl`) di tab browser baru (`target="_blank"`), memastikan kompatibilitas dan stabilitas tampilan di perangkat seluler maupun desktop.

### the agent's Discretion
- Penentuan desain UI/styling form bintang rating dan textarea komentar dengan menggunakan kelas CSS Tailwind untuk keindahan dan responsivitas layout.
- Cara penanganan pembaruan state cache di frontend setelah mutasi sukses (misalnya menggunakan React Query cache invalidation).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database Schema
- [schema.prisma](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/prisma/schema.prisma) — Berisi model `Evidence` yang perlu diperbarui.

### Target API Endpoints
- [route.ts](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/evidence/route.ts) — Route handler GET untuk list evidence (perlu ditambahkan filter `rating: null`).
- [route.ts (new id endpoint)](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/evidence/[id]/route.ts) — New endpoint untuk menangani `PUT` grading evidence.

### Frontend Views
- [page.tsx](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/instructor/feedback/page.tsx) — Halaman dashboard review dan grading bagi instruktur.

### Requirements & Roadmap
- [ROADMAP.md](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/.planning/ROADMAP.md) — Rencana milestone dan sukses kriteria Phase 2.
- [REQUIREMENTS.md](file:///C:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/.planning/REQUIREMENTS.md) — Definisi kebutuhan FEEDB-01 sampai FEEDB-05.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- React Query mutation hooks dan fetching utilities di `src/lib/api.ts` untuk memicu integrasi endpoint API.
- Star icons dari `lucide-react` untuk komponen visual rating interaktif.

### Established Patterns
- Menggunakan wrapper `withRequestObservability` untuk logging performa dan logging audit security jika terjadi mutasi data.
- API route params dynamic directory structure (misal `[id]/route.ts`).

### Integration Points
- `/api/evidence/[id]` (PUT): Endpoint baru untuk memperbarui field `rating` dan `comment` pada model `Evidence`.
- `src/app/instructor/feedback/page.tsx`: Menyambungkan data list pending review ke query React Query yang mengambil data dari `/api/evidence`.

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

*Phase: 2-Database-Backed Evidence Feedback*
*Context gathered: 2026-06-06*
