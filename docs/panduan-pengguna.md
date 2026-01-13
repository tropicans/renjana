# 📚 Dokumentasi Aplikasi LMS Renjana
## Panduan Pengguna dan Pemahaman Sistem

---

## 1. Gambaran Umum Aplikasi

**LMS Renjana** adalah platform pembelajaran digital yang dirancang khusus untuk pelatihan dan sertifikasi profesional di bidang hukum. Aplikasi ini memungkinkan peserta untuk mengikuti program pelatihan secara terstruktur, melacak kemajuan belajar, dan memperoleh sertifikasi resmi.

### Komponen Utama Sistem:
| Komponen | Fungsi |
|----------|--------|
| **Portal Publik** | Halaman informasi, katalog kursus, dan pendaftaran |
| **Dashboard Peserta** | Area belajar dan pelacakan progres |
| **Konsol Instruktur** | Pengelolaan kelas dan penilaian |
| **Panel Admin** | Manajemen program dan pengguna |
| **Dashboard Manajer** | Pemantauan kinerja tim |
| **Konsol Keuangan** | Pengelolaan transaksi dan pembayaran |

---

## 2. Tujuan dan Masalah yang Diselesaikan

### Masalah yang Diselesaikan:

| Masalah | Solusi Renjana |
|---------|----------------|
| Pelatihan hukum sulit diakses | Platform online 24/7 |
| Sulit melacak kemajuan belajar | Progress tracking otomatis |
| Koordinasi instruktur-peserta rumit | Sistem terpusat terintegrasi |
| Laporan pelatihan manual | Dashboard real-time |
| Administrasi keuangan terpisah | Modul keuangan terintegrasi |

### Tujuan Utama:
1. **Aksesibilitas** — Pelatihan dapat diakses kapan saja dan di mana saja
2. **Transparansi** — Kemajuan belajar dapat dipantau secara real-time
3. **Efisiensi** — Proses administrasi terotomatisasi
4. **Standarisasi** — Kurikulum dan sertifikasi terstandar
5. **Akuntabilitas** — Setiap aktivitas tercatat dalam sistem

---

## 3. Konsep Cara Kerja Aplikasi

### Siklus Pembelajaran:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   DAFTAR → ENROLL → BELAJAR → SELESAIKAN → SERTIFIKASI    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Penjelasan Siklus:

1. **Pendaftaran (Register)**
   - Pengguna membuat akun dengan email dan kata sandi
   - Sistem memverifikasi dan mengaktifkan akun

2. **Pendaftaran Kursus (Enroll)**
   - Pengguna memilih program dari katalog
   - Melakukan pembayaran (jika berbayar)
   - Sistem mendaftarkan peserta ke program

3. **Proses Belajar**
   - Peserta mengakses materi modul per modul
   - Menyelesaikan aktivitas (video, kuis, tugas)
   - Sistem mencatat setiap kemajuan

4. **Penyelesaian**
   - Semua aktivitas harus diselesaikan
   - Nilai minimum harus tercapai
   - Sistem memvalidasi kelengkapan

5. **Sertifikasi**
   - Sistem menerbitkan sertifikat digital
   - Sertifikat dapat diunduh dan diverifikasi

---

## 4. Alur Proses Utama (Workflow Naratif)

### 4.1 Alur Peserta Baru

> **Siti** adalah seorang praktisi hukum yang ingin mendapatkan sertifikasi mediator.

1. Siti mengunjungi website Renjana dan melihat katalog program
2. Ia menemukan "Pelatihan Sertifikasi Mediator" dan membaca detailnya
3. Siti memutuskan untuk mendaftar dan membuat akun baru
4. Setelah login, ia kembali ke halaman program dan klik "Daftar Sekarang"
5. Sistem mencatat pendaftarannya dan program muncul di dashboard
6. Siti mulai belajar dari Modul 1, menonton video dan mengerjakan kuis
7. Setiap kali menyelesaikan aktivitas, ia menandainya "Selesai"
8. Progress bar di dashboard terus bertambah seiring kemajuannya
9. Setelah semua modul selesai, sistem menampilkan ucapan selamat
10. Siti dapat mengunduh sertifikatnya dari halaman sertifikat

### 4.2 Alur Instruktur

> **Pak Budi** adalah instruktur untuk program mediator.

1. Pak Budi login dan diarahkan ke Dashboard Instruktur
2. Ia melihat daftar kelas yang diampu beserta jumlah peserta
3. Mengklik salah satu kelas untuk melihat detail peserta
4. Dapat melihat progress masing-masing peserta
5. Memberikan feedback pada tugas yang dikumpulkan
6. Mengisi absensi untuk sesi live/tatap muka
7. Sistem otomatis mengirim notifikasi ke peserta terkait

### 4.3 Alur Administrator

> **Admin Dewi** bertanggung jawab atas operasional platform.

1. Admin Dewi login ke Panel Admin
2. Dapat melihat statistik keseluruhan: jumlah peserta, program aktif, dll
3. Mengelola program: membuat baru, mengedit, atau menonaktifkan
4. Mengelola pendaftaran: menyetujui, menolak, atau memproses
5. Melihat log aktivitas untuk audit dan keamanan
6. Mengelola lokasi pelatihan untuk program offline/hybrid

---

## 5. Peran dan Hak Pengguna

### Matriks Hak Akses:

| Fitur | Peserta | Instruktur | Admin | Manager | Finance |
|-------|:-------:|:----------:|:-----:|:-------:|:-------:|
| Lihat Katalog | ✅ | ✅ | ✅ | ✅ | ✅ |
| Daftar Kursus | ✅ | ❌ | ❌ | ❌ | ❌ |
| Akses Materi | ✅ | ✅ | ❌ | ❌ | ❌ |
| Kelola Kelas | ❌ | ✅ | ✅ | ❌ | ❌ |
| Nilai Peserta | ❌ | ✅ | ❌ | ❌ | ❌ |
| Kelola Program | ❌ | ❌ | ✅ | ❌ | ❌ |
| Lihat Laporan Tim | ❌ | ❌ | ❌ | ✅ | ❌ |
| Kelola Keuangan | ❌ | ❌ | ❌ | ❌ | ✅ |

### Deskripsi Peran:

| Peran | Tanggung Jawab |
|-------|----------------|
| **Peserta (Learner)** | Mengikuti pelatihan, menyelesaikan aktivitas, mengumpulkan bukti belajar |
| **Instruktur** | Mengajar, menilai, memberikan feedback, mencatat kehadiran |
| **Administrator** | Mengelola sistem, program, dan pengguna |
| **Manager** | Memantau progress tim, menganalisis dampak pelatihan |
| **Finance** | Mengelola pembayaran, faktur, dan laporan keuangan |

---

## 6. Cara Penggunaan Aplikasi (User Journey)

### 6.1 Untuk Peserta

#### Langkah 1: Masuk ke Aplikasi
1. Buka website Renjana
2. Klik tombol "Masuk" di pojok kanan atas
3. Masukkan email dan kata sandi
4. Klik "Masuk"

#### Langkah 2: Menjelajahi Katalog
1. Klik menu "Pelatihan" di navigasi
2. Gunakan filter kategori jika diperlukan
3. Klik kartu program untuk melihat detail

#### Langkah 3: Mendaftar Program
1. Di halaman detail program, klik "Daftar Sekarang"
2. Konfirmasi pendaftaran
3. Program akan muncul di Dashboard

#### Langkah 4: Mulai Belajar
1. Dari Dashboard, klik "Lanjutkan Belajar"
2. Panel kiri menampilkan daftar modul dan aktivitas
3. Klik aktivitas untuk membuka konten
4. Klik "Tandai Selesai" setelah menyelesaikan

#### Langkah 5: Memantau Kemajuan
1. Progress bar menunjukkan persentase penyelesaian
2. Aktivitas yang selesai ditandai dengan centang hijau
3. Dashboard menampilkan ringkasan statistik

### 6.2 Untuk Instruktur

#### Memantau Peserta
1. Login → otomatis ke Dashboard Instruktur
2. Klik nama kelas untuk melihat daftar peserta
3. Lihat progress masing-masing peserta

#### Memberikan Feedback
1. Buka halaman "Feedback"
2. Pilih peserta dan aktivitasnya
3. Tulis komentar dan berikan nilai
4. Simpan feedback

### 6.3 Mengubah Bahasa
1. Klik tombol bahasa di header (ID/EN)
2. Tampilan akan berubah sesuai pilihan
3. Preferensi tersimpan otomatis

### 6.4 Mengubah Tema (Terang/Gelap)
1. Klik ikon bulan/matahari di header
2. Tampilan berubah antara mode terang dan gelap
3. Preferensi tersimpan otomatis

---

## 7. Respons Sistem terhadap Aksi Pengguna

### Tabel Aksi dan Respons:

| Aksi Pengguna | Respons Sistem |
|---------------|----------------|
| Login dengan kredensial benar | Diarahkan ke Dashboard sesuai peran |
| Login dengan kredensial salah | Pesan error "Email atau kata sandi salah" |
| Klik "Daftar Sekarang" (belum login) | Diarahkan ke halaman Login |
| Klik "Daftar Sekarang" (sudah login) | Tombol berubah menjadi "Lanjutkan Belajar" + notifikasi sukses |
| Tandai aktivitas selesai | Progress bar bertambah + notifikasi sukses |
| Selesaikan semua aktivitas | Notifikasi "Selamat! Kursus selesai!" + akses sertifikat |
| Logout | Kembali ke halaman utama, sesi berakhir |

### Notifikasi Sistem:

| Jenis | Warna | Contoh |
|-------|-------|--------|
| **Sukses** | Hijau | "Berhasil mendaftar!" |
| **Informasi** | Biru | "Sesi akan dimulai dalam 10 menit" |
| **Peringatan** | Kuning | "Tugas Anda belum dikumpulkan" |
| **Error** | Merah | "Gagal menyimpan. Coba lagi." |

---

## 8. Aturan dan Perilaku Sistem

### 8.1 Aturan Akses

| Aturan | Penjelasan |
|--------|------------|
| **Autentikasi Wajib** | Halaman Dashboard dan Belajar hanya dapat diakses setelah login |
| **Otorisasi Berbasis Peran** | Setiap peran hanya dapat mengakses fitur sesuai haknya |
| **Sesi Tersimpan** | Login tetap aktif sampai pengguna logout atau menutup browser |

### 8.2 Aturan Pembelajaran

| Aturan | Penjelasan |
|--------|------------|
| **Urutan Bebas** | Aktivitas dalam modul dapat dikerjakan dalam urutan bebas |
| **Progress Tersimpan** | Kemajuan otomatis tersimpan saat aktivitas ditandai selesai |
| **100% untuk Sertifikat** | Semua aktivitas harus selesai untuk mendapat sertifikat |

### 8.3 Aturan Sistem

| Aturan | Penjelasan |
|--------|------------|
| **Preferensi Tersimpan** | Pilihan bahasa dan tema tersimpan di browser |
| **Responsif** | Tampilan menyesuaikan ukuran layar (desktop/tablet/mobile) |
| **Dua Bahasa** | Tersedia dalam Bahasa Indonesia dan English |

---

## 9. Contoh Skenario Penggunaan

### Skenario 1: Peserta Pertama Kali

**Situasi:** Ahmad baru pertama kali menggunakan Renjana untuk pelatihan mediator.

**Langkah-langkah:**
1. Ahmad mengunjungi renjana.com
2. Membaca informasi di halaman utama
3. Klik "Pelatihan" untuk melihat katalog
4. Menemukan "Sertifikasi Mediator" dan klik
5. Membaca silabus dan biaya
6. Klik "Login untuk Enroll" → diarahkan ke halaman login
7. Belum punya akun, klik "Daftar gratis"
8. Mengisi form pendaftaran
9. Login dengan akun baru
10. Kembali ke halaman program, klik "Daftar Sekarang"
11. Muncul notifikasi "Berhasil mendaftar!"
12. Diarahkan ke halaman belajar
13. Mulai dari modul pertama

**Hasil:** Ahmad terdaftar dan dapat mulai belajar.

---

### Skenario 2: Melanjutkan Pembelajaran

**Situasi:** Siti sudah mengerjakan 3 dari 8 modul dan ingin melanjutkan.

**Langkah-langkah:**
1. Siti login ke akun
2. Dashboard menampilkan progress 37%
3. Klik "Lanjutkan Belajar"
4. Sistem otomatis membuka aktivitas terakhir yang belum selesai
5. Menonton video modul 4
6. Klik "Tandai Selesai"
7. Notifikasi muncul: "Aktivitas selesai!"
8. Sistem otomatis pindah ke aktivitas berikutnya
9. Progress bar bertambah

**Hasil:** Progress Siti terupdate menjadi 50%.

---

### Skenario 3: Instruktur Memberikan Feedback

**Situasi:** Pak Budi ingin menilai tugas yang dikumpulkan peserta.

**Langkah-langkah:**
1. Pak Budi login → masuk ke Dashboard Instruktur
2. Klik menu "Feedback"
3. Melihat daftar tugas yang perlu dinilai
4. Klik salah satu tugas
5. Membaca jawaban peserta
6. Menulis komentar konstruktif
7. Memberikan nilai
8. Klik "Simpan"
9. Notifikasi muncul: "Feedback berhasil disimpan"

**Hasil:** Peserta menerima notifikasi ada feedback baru.

---

### Skenario 4: Manager Memantau Tim

**Situasi:** Diana sebagai HR Manager ingin melihat progress pelatihan timnya.

**Langkah-langkah:**
1. Diana login → masuk ke Dashboard Manager
2. Melihat ringkasan: jumlah karyawan terdaftar, rata-rata progress
3. Klik menu "Skills" untuk melihat detail per kompetensi
4. Melihat siapa yang sudah selesai dan siapa yang perlu reminder
5. Export laporan untuk meeting

**Hasil:** Diana memiliki data untuk laporan ke manajemen.

---

## Ringkasan

**LMS Renjana** menyediakan ekosistem pembelajaran digital yang komprehensif dengan:

✅ **5 Portal Terintegrasi** — Peserta, Instruktur, Admin, Manager, Finance  
✅ **Tracking Otomatis** — Progress tersimpan dan terlihat real-time  
✅ **Multi-Bahasa** — Tersedia dalam Bahasa Indonesia dan English  
✅ **Responsif** — Dapat diakses dari desktop, tablet, atau ponsel  
✅ **User-Friendly** — Navigasi intuitif dan feedback jelas  

---

*Dokumen ini dibuat untuk membantu pemahaman sistem LMS Renjana bagi pengguna non-teknis.*

*Versi: 1.0 | Tanggal: 12 Januari 2026*
