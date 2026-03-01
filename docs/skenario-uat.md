# 🧪 Skenario User Acceptance Testing (UAT) - LMS Renjana

Dokumen ini berisi skenario pengujian UAT untuk memverifikasi fungsionalitas dan alur kerja utama di aplikasi LMS Renjana berdasarkan *Role-Based Access Control* (RBAC) dan fitur inti.

---

## 1. Modul Autentikasi & Otorisasi (RBAC)
**Deskripsi:** Memastikan pengguna hanya dapat mengakses portal yang diizinkan sesuai dengan peran (`Role`) mereka.

| ID | Skenario Pengujian | Langkah-langkah | Ekspektasi Hasil | Status (Pass/Fail) | Catatan |
|---|---|---|---|---|---|
| AUTH-001 | Login sebagai LEARNER | 1. Buka halaman login<br>2. Masukkan kredensial LEARNER<br>3. Klik Login | Berhasil login dan diarahkan ke `/dashboard`. | | |
| AUTH-002 | Akses tidak sah LEARNER | 1. Login sebagai LEARNER<br>2. Coba akses URL `/admin` atau `/manager` | Akses ditolak (dialihkan kembali atau mendapat pesan error/403). | | |
| AUTH-003 | Login dan Akses INSTRUCTOR | 1. Login sebagai INSTRUCTOR<br>2. Akses `/instructor`<br>3. Akses `/dashboard` | Berhasil mengakses `/instructor` dan `/dashboard`. | | |
| AUTH-004 | Login dan Akses MANAGER | 1. Login sebagai MANAGER<br>2. Akses `/manager`<br>3. Akses `/dashboard` | Berhasil mengakses `/manager` dan `/dashboard`. | | |
| AUTH-005 | Login dan Akses FINANCE | 1. Login sebagai FINANCE<br>2. Akses `/finance`<br>3. Akses `/dashboard` | Berhasil mengakses `/finance` dan `/dashboard`. | | |
| AUTH-006 | Login dan Akses ADMIN | 1. Login sebagai ADMIN<br>2. Akses `/admin`<br>3. Akses semua portal lainnya | ADMIN berhasil mengakses semua portal (`/dashboard`, `/instructor`, `/manager`, `/finance`, `/admin`). | | |
| AUTH-007 | Pergantian Tampilan (Learner View) | 1. Login sebagai ADMIN/INSTRUCTOR/MANAGER<br>2. Klik tombol "Learner View" di sidebar bawah | Tampilan berubah menjadi mode peserta reguler di `/dashboard`. | | |

---

## 2. Modul Pembelajaran Peserta (Learner Journey)
**Deskripsi:** Memastikan alur pembelajaran end-to-end bagi peserta (Learner) berjalan lancar.

| ID | Skenario Pengujian | Langkah-langkah | Ekspektasi Hasil | Status (Pass/Fail) | Catatan |
|---|---|---|---|---|---|
| LRN-001 | Pendaftaran Program (Enrollment) | 1. Login sebagai LEARNER<br>2. Buka katalog di `/courses`<br>3. Pilih program dan klik "Enroll/Daftar" | Peserta berhasil terdaftar pada program pelatihan dan program muncul di dasbor. | | |
| LRN-002 | Akses Materi Pembelajaran | 1. Buka program yang diikuti<br>2. Klik menuju materi (`/learn/[courseId]`) | Modul dan aktivitas (lessons) dapat diakses dan ditampilkan dengan benar. | | |
| LRN-003 | Pelacakan Kemajuan (Progress Tracking) | 1. Buka sebuah pelajaran<br>2. Klik "Tandai Selesai" | Progress bar pelatihan bertambah secara *real-time* (Optimistic UI update). | | |
| LRN-004 | Absensi Luring Berbasis GPS | 1. Buka `/dashboard/checkin`<br>2. Izinkan akses lokasi browser<br>3. Lakukan check-in | Jika dalam radius 500m dari lokasi pelatihan (cth: Monas), absensi berhasil. Jika tidak, muncul peringatan "Di luar jangkauan". | | |
| LRN-005 | Unggah Bukti (Evidence Upload) | 1. Buka `/dashboard/evidence`<br>2. Drag-and-drop file (PDF/Image, max 10MB)<br>3. Submit | File berhasil diunggah. Jika upload file > 10MB atau format salah, muncul error / ditolak. | | |
| LRN-006 | Penerbitan Sertifikat Otomatis | 1. Selesaikan semua materi (progress 100%)<br>2. Buka tab Sertifikat di `/dashboard/certificates` | Sertifikat kelulusan dalam PDF (Landscape A4) berhasil diterbitkan secara otomatis dan dapat diunduh. | | |

---

## 3. Modul Konsol Instruktur (Instructor Console)
**Deskripsi:** Memverifikasi fungsionalitas pemantauan untuk instruktur.

| ID | Skenario Pengujian | Langkah-langkah | Ekspektasi Hasil | Status (Pass/Fail) | Catatan |
|---|---|---|---|---|---|
| INS-001 | Lihat Ringkasan Statistik | 1. Login sebagai INSTRUCTOR<br>2. Buka navigasi `/instructor` | Halaman ringkasan (total learners, average completion) tampil. | | |
| INS-002 | Tinjau Progress Peserta | 1. Di `/instructor`, buka menu "Learners"<br>2. Cari nama peserta spesifik<br>3. Klik detail | Menampilkan progress belajar peserta tersebut per modul secara akurat (sesuai aksi dari LRN-003). | | |

---

## 4. Modul Dashboard Manajer (Manager Dashboard)
**Deskripsi:** Memverifikasi fungsionalitas pemantauan tingkat manajerial.

| ID | Skenario Pengujian | Langkah-langkah | Ekspektasi Hasil | Status (Pass/Fail) | Catatan |
|---|---|---|---|---|---|
| MGR-001 | Pantau Metrik Skills | 1. Login sebagai MANAGER<br>2. Buka menu "Skills" di `/manager` | Data metrik rata-rata progress per kompetensi / program tertampil. | | |
| MGR-002 | Identifikasi Peserta Berisiko | 1. Buka menu "Risks" di `/manager` | Menampilkan peserta berisiko tinggi (progress <30%) dan menengah (progress 30-70%). | | |
| MGR-003 | Lihat Efektivitas (Impact) | 1. Buka menu "Impact" di `/manager` | Menampilkan rasio kelulusan dan jumlah sertifikat diterbitkan. | | |

---

## 5. Modul Portal Keuangan (Finance Portal)
**Deskripsi:** Memverifikasi akses dan fungsionalitas Portal Keuangan.

| ID | Skenario Pengujian | Langkah-langkah | Ekspektasi Hasil | Status (Pass/Fail) | Catatan |
|---|---|---|---|---|---|
| FIN-001 | Pantau Transaksi & Invoices | 1. Login sebagai FINANCE<br>2. Akses `/finance`<br>3. Lihat riwayat transaksi dan estimasi pendapatan | Menampilkan data transaksi, faktur (invoices), dan estimasi keuangan secara tepat. | | |

---

## 6. Modul Panel Admin (Admin Panel)
**Deskripsi:** Memastikan fungsionalitas operasional harian berjalan dengan wewenang tertinggi.

| ID | Skenario Pengujian | Langkah-langkah | Ekspektasi Hasil | Status (Pass/Fail) | Catatan |
|---|---|---|---|---|---|
| ADM-001 | Manajemen Program (Course) | 1. Login sebagai ADMIN<br>2. Buka `/admin`<br>3. Buat program/modul/aktivitas baru | Program baru berhasil dibuat dan muncul di katalog `/courses`. | | |
| ADM-002 | Admin Enrollment (Manual) | 1. Di `/admin`, buka manajemen Enrollment<br>2. Daftarkan user (LEARNER) secara manual ke sebuah program | LEARNER tersebut otomatis terdaftar pada program tanpa harus enroll sendiri. | | |
| ADM-003 | Rekapitulasi Presensi | 1. Buka log rekapitulasi presensi luring | Data presensi dari check-in GPS (LRN-004) dapat dilihat & diekspor. | | |
| ADM-004 | Audit Log Compliance | 1. Buka menu "Audit Log" | Sistem menampilkan rekaman jejak audit pengguna dan aktivitas admin. | | |

---

## 7. Preferensi & UX Global
**Deskripsi:** Pengujian fitur global UI/UX dan keamanan.

| ID | Skenario Pengujian | Langkah-langkah | Ekspektasi Hasil | Status (Pass/Fail) | Catatan |
|---|---|---|---|---|---|
| UX-001 | Mode Tema (Dark/Light Mode) | 1. Klik ikon Toggle Tema di pojok kanan atas | Tema tampilan berubah sesuai mode dan tersimpan setelah halaman di-refresh. | | |
| UX-002 | Keamanan Enkripsi File Bukti | 1. Buka `/dashboard/evidence`<br>2. Intersep/cek path tautan file bukti yang diunggah | Jalur akses *(path)* ke file dienkripsi dan terlindungi. | | |
