# 📚 Dokumentasi Aplikasi LMS Renjana
## Panduan Pengguna dan Pemahaman Sistem

---

## 1. Gambaran Umum Aplikasi

**LMS Renjana** adalah platform pembelajaran digital yang dirancang khusus untuk pelatihan dan sertifikasi profesional di bidang hukum. Aplikasi ini memungkinkan peserta untuk mengikuti program pelatihan secara terstruktur (Daring, Luring, atau Hybrid), melacak kemajuan belajar, mencatat kehadiran berbasis lokasi, dan memperoleh sertifikasi resmi secara otomatis.

### 5 Portal Terintegrasi:

Sistem LMS Renjana menggunakan otorisasi berbasis peran (Role-Based Access Control) yang mendistribusikan pengguna ke 5 portal berbeda:

| Portal | URL Akses | Fungsi | Peran Wajib |
|--------|-----------|--------|-------------|
| **Dashboard Peserta** | `/dashboard` | Area belajar peserta, absensi GPS, upload bukti, sertifikat | `LEARNER` (Semua peran bisa akses) |
| **Konsol Instruktur** | `/instructor` | Pemantauan progres kelas, peserta, dan statistik pengajar | `INSTRUCTOR` atau `ADMIN` |
| **Dashboard Manajer** | `/manager` | Analitik performa tim, skills coverage, identifikasi peserta berisiko | `MANAGER` atau `ADMIN` |
| **Portal Keuangan** | `/finance` | Estimasi pendapatan, transaksi, invoices, dan pricing | `FINANCE` atau `ADMIN` |
| **Panel Admin** | `/admin` | Manajemen master: Program, Enrollments, Pengguna, Audit Log | `ADMIN` |

---

## 2. Fitur Inti dan Alur Kerja (Workflows)

Aplikasi memiliki siklus pembelajaran end-to-end yang telah terotomatisasi sepenuhnya.

### 2.1 Alur Peserta Baru (Learner Journey)

1. **Pendaftaran & Akses**
   - Pengguna mendaftar dan login (menggunakan NextAuth).
   - Setelah login, pengguna diarahkan ke `/dashboard`.
   - Peserta dapat melihat katalog program di `/courses` dan mendaftar (Enroll).

2. **Proses Belajar (Self-Paced & Hybrid)**
   - Akses materi melalui `/learn/[courseId]`.
   - Modul memiliki beberapa aktivitas/pelajaran (Lessons).
   - Peserta menekan tombol "Tandai Selesai" untuk menyelesaikan materi. Progress bar akan bertambah secara otomatis.
   - **Absensi Luring:** Untuk sesi tatap muka, peserta membuka `/dashboard/checkin`. Sistem akan mendeteksi **GPS (Geolocation)** peserta; jika berada dalam radius 500 meter dari lokasi pelatihan (Monas, Jakarta), check-in berhasil dicatat.
   - **Upload Bukti:** Peserta dapat mengunggah bukti tugas atau kegiatan di `/dashboard/evidence` (mendukung Drag-and-Drop, max 10MB PDF/Image).

3. **Sertifikasi Otomatis**
   - Saat progress peserta mencapai 100%, sistem akan secara **otomatis menerbitkan Sertifikat Kelulusan**.
   - Sertifikat digital berformat PDF (Landscape A4) dapat diunduh di `/dashboard/certificates`.

### 2.2 Alur Supervisor/Manager

1. **Pemantauan Kinerja Karyawan**
   - Manager HR login dan diarahkan ke `/manager`.
   - Di menu **Skills**, Manager dapat melihat metrik rata-rata progress per kompetensi/program.
   - Di menu **Risks**, sistem secara algoritmik menandai peserta yang berisiko tertinggal (High Risk: progress < 30% dan Medium Risk: 30-70%) agar dapat segera di-follow up.
   - Di menu **Impact**, Manager melihat efektivitas pelatihan dari rasio kelulusan dan jumlah sertifikat yang diterbitkan.

### 2.3 Alur Instruktur & Admin

- **Instruktur:** Mengakses `/instructor` untuk melihat ringkasan statistik (total learners, average completion). Melalui menu Learners, instruktur bisa mencari dan meninjau progress spesifik setiap peserta per modul.
- **Admin:** Mengakses `/admin` untuk operasional harian. Admin dapat membuat/mengedit program pelatihan baru (beserta modul dan aktivitasnya), merekapitulasi presensi, dan meng-enroll pengguna secara manual (Admin Enrollment). Semua aksi admin dan pengguna terekam di menu **Audit Log** untuk kepatuhan (compliance).

> **💡 Tips UX:** Admin, Instructor, Manager, dan Finance memiliki privilese tambahan. Mereka dapat berpindah kembali ke tampilan Peserta kapan saja dengan menekan tombol **"Learner View"** di sudut bawah kiri layar (Sidebar).

---

## 3. Matriks Hak Akses (RBAC) Terupdate

Sistem dilindungi oleh *Middleware* (`proxy.ts`). Berikut adalah matriks hak akses absolut:

| Route Path | LEARNER | INSTRUCTOR | MANAGER | FINANCE | ADMIN |
|------------|:-------:|:----------:|:-------:|:-------:|:-----:|
| `/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/instructor`| ❌ | ✅ | ❌ | ❌ | ✅ |
| `/manager` | ❌ | ❌ | ✅ | ❌ | ✅ |
| `/finance` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/admin` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/*` | Dibatasi sesuai endpoint & kepemilikan data (Ownership) | ✅ |

---

## 4. Keamanan & Preferensi

1. **Keamanan Sesi**
   - Token sesi aman dengan NextAuth.
   - Perlindungan middleware untuk rute pribadi.
   - Otorisasi berlapis di tingkat rute API (Backend).

2. **Mode Tema (Dark/Light)**
   - Tersedia di sudut kanan atas seluruh portal. Klik ikon bulan/matahari untuk berganti tema. Preferensi ini otomatis tersimpan di sesi browser (menggunakan `next-themes`).

3. **Perlindungan Data Luring**
   - File *Evidence* dienkripsi jalurnya dan dibatasi jenis formatnya (PDF, JPEG, PNG, WEBP) untuk menghindari *malicious uploads*.

---

## 5. Ringkasan Platform

**LMS Renjana** menyediakan ekosistem pembelajaran digital yang sepenuhnya ditenagai API *real-time* (menggunakan React Query & Prisma):

✅ **Absensi GPS** — Mencegah pemalsuan kehadiran fisik  
✅ **Tracking Super Kilat** — Progress UI yang merespons seketika menggunakan Optimistic Updates  
✅ **Sertifikat PDF Instan** — Dihasilkan murni di sisi browser pengguna agar hemat *server cost*  
✅ **5 Persona Pengguna** — Dashboard spesifik yang menjawab kebutuhan setiap stakeholders  

---

*Versi: 1.1 | Tanggal: 28 Februari 2026 (Refleksi Rilis Fase 2 Lengkap)*
