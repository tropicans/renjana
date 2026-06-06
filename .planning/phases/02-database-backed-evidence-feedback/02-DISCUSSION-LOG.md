# Phase 2: Database-Backed Evidence Feedback - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-06
**Phase:** 2-Database-Backed Evidence Feedback
**Areas discussed:** Perubahan Schema Database, Penyaringan Evidence yang Belum Dinilai, Tampilan Detail Submission dan Tautan Dokumen

---

## Perubahan Schema Database

| Option | Description | Selected |
|--------|-------------|----------|
| Menambahkan field opsional 'rating' (Int) dan 'comment' (String) langsung ke model Evidence (Sederhana dan cepat) | (Recommended) Menambahkan field opsional `rating` dan `comment` langsung ke model `Evidence` | ✓ |
| Membuat model baru 'EvidenceFeedback' dengan relasi 1-to-1 ke model Evidence (Lebih modular tapi menambah kompleksitas join) | Membuat model baru `EvidenceFeedback` dengan relasi 1-to-1 ke model `Evidence` | |

**User's choice:** Menambahkan field opsional 'rating' (Int) dan 'comment' (String) langsung ke model Evidence (Sederhana dan cepat).
**Notes:** Menambahkan langsung ke model `Evidence` untuk performa tinggi dan kesederhanaan implementasi.

---

## Penyaringan Evidence yang Belum Dinilai

| Option | Description | Selected |
|--------|-------------|----------|
| Di server-side - API secara default hanya mengembalikan evidence yang belum dinilai (rating null), dengan opsi parameter '?all=true' jika butuh riwayat (Lebih efisien) | (Recommended) Di server-side - API secara default hanya mengembalikan evidence yang belum dinilai (`rating: null`), dengan opsi parameter `?all=true` | ✓ |
| Di client-side - API mengembalikan seluruh evidence dan frontend menyaring data yang belum memiliki rating | Di client-side - API mengembalikan seluruh evidence dan frontend melakukan filtering | |
| Di server-side secara kaku - API hanya mengembalikan data yang belum dinilai tanpa opsi parameter tambahan apapun | Di server-side secara kaku - API hanya mengembalikan data yang belum dinilai tanpa parameter tambahan | |

**User's choice:** Di server-side - API secara default hanya mengembalikan evidence yang belum dinilai (rating null), dengan opsi parameter '?all=true' jika butuh riwayat (Lebih efisien).
**Notes:** Mengoptimalkan performa data transfer dengan filtering di server-side secara default, namun menyediakan fallback parameter `?all=true` untuk melihat riwayat lengkap.

---

## Tampilan Detail Submission dan Tautan Dokumen

| Option | Description | Selected |
|--------|-------------|----------|
| Membuka tab browser baru - Menampilkan tombol "Lihat Dokumen" yang langsung membuka fileUrl di tab baru (Sederhana, aman, dan kompatibel dengan browser seluler) | (Recommended) Membuka tab browser baru - Menampilkan tombol "Lihat Dokumen" yang langsung membuka `fileUrl` di tab baru | ✓ |
| Inline Preview - Membuat panel preview inline (misal iframe atau image tag) di sisi kanan form review (Pengalaman pengguna lebih premium, tapi butuh penanganan error jika file gagal dimuat) | Inline Preview - Membuat panel preview inline di sisi kanan form review | |

**User's choice:** Membuka tab browser baru - Menampilkan tombol "Lihat Dokumen" yang langsung membuka fileUrl di tab baru (Sederhana, aman, dan kompatibel dengan browser seluler).
**Notes:** Menggunakan tab baru (`target="_blank"`) untuk membuka `fileUrl` demi menjamin kompatibilitas visual yang stabil dan reliabilitas di berbagai perangkat (mobile & desktop).

---

## the agent's Discretion

- Penentuan desain UI/styling form bintang rating dan textarea komentar dengan menggunakan kelas CSS Tailwind untuk keindahan dan responsivitas layout.
- Cara penanganan pembaruan state cache di frontend setelah mutasi sukses (misalnya menggunakan React Query cache invalidation).

## Deferred Ideas

None — discussion stayed within phase scope.
