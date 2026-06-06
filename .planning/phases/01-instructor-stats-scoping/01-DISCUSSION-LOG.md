# Phase 1: Instructor Stats & Scoping - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-06
**Phase:** 1-Instructor Stats & Scoping
**Areas discussed:** Penanganan Instruktur Tanpa Kelas (Empty Scope), Definisi Learner yang Di-scope, Akses Global Admin pada API Evidence

---

## Penanganan Instruktur Tanpa Kelas (Empty Scope)

| Option | Description | Selected |
|--------|-------------|----------|
| Langsung mengembalikan data kosong secara instan | Tanpa melakukan query database jika instruktur belum memiliki kelas (Lebih efisien) | ✓ |
| Tetap menjalankan query database dengan filter kosong | Prisma 'in: []' | |
| Mengembalikan error | Misalnya 400 Bad Request atau 404 Not Found | |

**User's choice:** Langsung mengembalikan data kosong secara instan tanpa melakukan query database (Lebih efisien).
**Notes:** Menghindari roundtrip database yang tidak perlu dan mengoptimalkan performa response saat dasbor dimuat.

---

## Definisi Learner yang Di-scope

| Option | Description | Selected |
|--------|-------------|----------|
| Semua learner yang terdaftar di Class Group instruktur | Tanpa melihat status enrollment (aktif/selesai/lainnya) | ✓ |
| Hanya learner dengan enrollment berstatus aktif | ACTIVE atau COMPLETED saja | |
| Hanya learner yang pendaftarannya sudah disetujui | APPROVED secara finansial dan administratif | |

**User's choice:** Semua learner yang terdaftar di Class Group instruktur, tanpa melihat status enrollment (aktif/selesai/lainnya).
**Notes:** Memastikan instruktur memiliki akses historis penuh dan visibilitas progres terhadap semua peserta yang pernah/sedang di kelasnya.

---

## Akses Global Admin pada API Evidence

| Option | Description | Selected |
|--------|-------------|----------|
| ADMIN melihat seluruh data secara global | Sesuai role RBAC standard tanpa pembatasan | ✓ |
| ADMIN di-scope berdasarkan kelas yang diajarnya saja jika terdaftar sebagai instruktur | Jika tidak mengajar kelas, baru melihat global | |
| ADMIN dibatasi hanya melihat kelas yang diajarnya saja | Tidak bisa melihat data kelas lain sama sekali | |

**User's choice:** ADMIN tetap melihat seluruh data evidence secara global tanpa pembatasan (Sesuai role RBAC standard).
**Notes:** Mempertahankan kemampuan administrasi penuh bagi administrator platform.

---

## the agent's Discretion

Tidak ada item khusus yang diserahkan sepenuhnya kepada agen, semua keputusan utama telah dikonfirmasi dan disetujui.

## Deferred Ideas

Tidak ada ide yang didefer (ditunda) karena jalannya diskusi sepenuhnya sesuai dengan batasan scope awal Phase 1.
