# Phase 3: Test Suite Recovery - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-06
**Phase:** 3-Test Suite Recovery
**Areas discussed:** Penyelarasan Pesan Eror Batasan Peninjauan Dokumen Pendaftaran, Penyelarasan Status dan Aturan Pengiriman Pendaftaran

---

## Penyelarasan Pesan Eror Batasan Peninjauan Dokumen Pendaftaran

| Option | Description | Selected |
|--------|-------------|----------|
| Perbarui asersi pengujian (test assertions) agar sesuai dengan implementasi API saat ini ("Payment proof documents must be reviewed by Finance" & "This action only applies to payment proof documents") | Menjaga kode produksi tetap utuh dan memperbarui pengujian lama agar selaras dengan implementasi backend terbaru. | ✓ |
| Ubah logika domain API (src/lib/domain/registration-workflow.ts) agar mengembalikan pesan eror lama sesuai dengan ekspektasi pengujian asli | Mempertahankan status pengujian lama dan mengubah string eror yang dikembalikan oleh API. | |

**User's choice:** Perbarui asersi pengujian (test assertions) agar sesuai dengan implementasi API saat ini ("Payment proof documents must be reviewed by Finance" & "This action only applies to payment proof documents")
**Notes:** Menyelaraskan asersi pengujian agar sesuai dengan eror ril yang dikeluarkan API.

---

## Penyelarasan Status dan Aturan Pengiriman Pendaftaran

| Option | Description | Selected |
|--------|-------------|----------|
| Perbarui asersi pengujian (test assertions) agar mengharapkan status 409 Conflict dengan pesan eror "Registration can no longer be edited" sesuai dengan perilaku controller saat ini | Mengakui dan menyelaraskan pengujian dengan perilaku controller saat ini di mana status "SUBMITTED" langsung di-upsert sebelum validasi dilakukan. | ✓ |
| Refaktor controller (src/app/api/registrations/route.ts) agar tidak langsung mengubah status menjadi "SUBMITTED" sebelum validasi, sehingga mengembalikan status 400 dengan pesan eror dokumen wajib yang kurang, dan perbarui pengujian agar memvalidasi eror dokumen tersebut | Melakukan perbaikan struktural pada handler pendaftaran agar validasi dijalankan secara bersih terlebih dahulu sebelum ada perubahan status database. | |

**User's choice:** Perbarui asersi pengujian (test assertions) agar mengharapkan status 409 Conflict dengan pesan eror "Registration can no longer be edited" sesuai dengan perilaku controller saat ini
**Notes:** Memperbarui asersi status pendaftaran yang gagal agar mengharapkan 409 sesuai dengan kode route handler saat ini.

---

## the agent's Discretion

Menentukan teknik penyusunan ulang asersi pengujian dan pembersihan mocks pada tests/registration-submit-rules.test.ts agar kompatibel dengan early return 409 dari endpoint API.

## Deferred Ideas

None
