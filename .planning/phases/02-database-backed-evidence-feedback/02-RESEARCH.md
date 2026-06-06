# Phase 2: Database-Backed Evidence Feedback - Research

## Temuan & Arsitektur

### 1. Database Schema (`prisma/schema.prisma`)
- Model `Evidence` saat ini terletak di baris 233-245 di `prisma/schema.prisma`.
- Perubahan yang diperlukan:
  - Menambahkan field `rating Int?` untuk menyimpan nilai rating interaktif instruktur (1-5).
  - Menambahkan field `comment String?` untuk menyimpan komentar tertulis dari instruktur.
- Migrasi Database:
  - Gunakan `npx prisma migrate dev --name add_evidence_feedback` untuk membuat file migrasi baru di lingkungan lokal, atau `npx prisma db push` untuk pengujian lokal cepat.

### 2. API Endpoint `/api/evidence` (GET)
- Terletak di `src/app/api/evidence/route.ts`.
- Fungsi `GET` perlu diperbarui agar:
  - Mengambil parameter `all` dari query URL: `const { searchParams } = new URL(req.url); const all = searchParams.get("all") === "true";`
  - Jika `!all`, lakukan query filter pada Prisma dengan `rating: null` untuk mengembalikan submission yang belum dinilai saja.
  - Parameter ini berlaku untuk semua peran (Admin, Instruktur, Learner).

### 3. API Endpoint Baru `/api/evidence/[id]` (PUT)
- Buat folder baru `src/app/api/evidence/[id]/` dan file `route.ts`.
- Endpoint ini digunakan untuk mengirimkan penilaian:
  - Hanya boleh diakses oleh pengguna dengan peran `INSTRUCTOR` dan `ADMIN`. Gunakan `requireRole("INSTRUCTOR", "ADMIN")` dari `@/lib/auth-utils`.
  - Gunakan wrapper `withRequestObservability` dari `@/lib/observability/route` untuk logging audit dan pelacakan performa.
  - Lakukan validasi input: `rating` harus berupa integer antara 1 dan 5, dan `comment` opsional (tetapi jika diberikan harus berupa string).
  - Lakukan mutasi database dengan `prisma.evidence.update` untuk menyimpan `rating` dan `comment`.
  - Tulis audit log keamanan menggunakan `writeSecurityAuditLog(prisma, { userId, action: "GRADE_EVIDENCE", entity: "EVIDENCE", entityId, metadata })`.

### 4. Integrasi Frontend (`src/app/instructor/feedback/page.tsx`)
- Halaman saat ini menggunakan data mock `mockPendingFeedback`.
- Gantilah dengan memanggil API `/api/evidence` (secara default mengambil `rating: null` yang berarti pending review).
- Gunakan React Query (`useQuery` dan `useMutation`) untuk fetching data dan mutasi submit feedback:
  - Query Key yang digunakan: `["evidences", "pending"]`.
  - Mutation memanggil helper `gradeEvidence(id, rating, comment)`.
  - Setelah mutasi sukses, invalidate query `["evidences", "pending"]` dan tampilkan toast sukses.
- Kompatibilitas Dokumen:
  - Tautan fileUrl diakses melalui tombol "Lihat Dokumen" dengan atribut `target="_blank"`.

## Rencana Validasi
- **Automated Tests**:
  - Buat file tes Vitest baru di `tests/evidence-grading.test.ts` untuk menguji API handler PUT `/api/evidence/[id]` dan GET `/api/evidence` dengan mock data prisma dan NextAuth.
- **Manual Verification**:
  - Jalankan dev server, masuk sebagai instruktur, pastikan daftar submission yang ditampilkan hanya yang belum dinilai.
  - Klik salah satu submission, masukkan rating bintang 4 dan komentar, lalu klik Submit.
  - Pastikan daftar ter-refresh otomatis dan item yang baru dinilai hilang dari daftar pending.
