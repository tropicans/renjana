# Business Requirements Document (BRD)
## Platform LMS RENJANA - Fase 2

---

**Dokumen:** Requirement & Gap Analysis  
**Versi:** 1.0  
**Tanggal:** 28 Januari 2026  
**Disusun oleh:** Yudhi Ardinal  
**Status:** Draft

---

## 1. Rangkuman Eksekutif

Dokumen ini mendefinisikan kebutuhan bisnis untuk pengembangan Fase 2 platform LMS RENJANA, dengan fokus pada:
1. **Infrastruktur Backend** - Database dan sistem autentikasi
2. **Modul Event/Webinar** - Pendaftaran kegiatan offline
3. **Sistem Absensi & Sertifikat** - Tracking kehadiran dan auto-generate sertifikat

---

## 2. Scope Definisi

### 2.1 Dalam Scope (In Scope) ✅

| ID | Fitur | Prioritas | Sprint |
|----|-------|:---------:|:------:|
| F-01 | Database PostgreSQL + Prisma ORM | Tinggi | 1 |
| F-02 | Sistem Autentikasi (NextAuth) | Tinggi | 1 |
| F-03 | API Backend untuk semua modul | Tinggi | 1 |
| F-04 | Modul Event/Webinar | Tinggi | 2 |
| F-05 | Pendaftaran peserta event | Tinggi | 2 |
| F-06 | Display materi & flyer event | Tinggi | 2 |
| F-07 | Sistem absensi QR-based | Tinggi | 3 |
| F-08 | Sertifikat auto-generate | Tinggi | 3 |
| F-09 | Download sertifikat PDF | Tinggi | 3 |
| F-10 | Export laporan peserta | Sedang | 3 |

### 2.2 Di Luar Scope (Out of Scope) ❌

| Fitur | Alasan | Rencana |
|-------|--------|---------|
| Payment Gateway Integration | Complexity, perlu koordinasi bank | Fase 3 |
| Mobile App (Native) | Fokus web first | Fase 3 |
| Video Conference Integration | Perlu license Zoom/Meet | Fase 3 |
| SSO Integration | Perlu koordinasi IT internal | Fase 3 |

---

## 3. Functional Requirements

### FR-01: Database & Backend Infrastructure

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|:--------:|---------------------|
| FR-01.1 | Sistem harus menggunakan PostgreSQL sebagai database | Tinggi | Database dapat menyimpan dan mengambil data dengan benar |
| FR-01.2 | Semua entitas harus memiliki schema yang terdefinisi | Tinggi | Prisma schema tersedia untuk semua model |
| FR-01.3 | API harus menyediakan endpoint CRUD untuk setiap entitas | Tinggi | REST API berjalan dengan response JSON |

**Data Model yang Dibutuhkan:**

```
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐     ┌──────────┐     ┌──────────────┐         │
│  │  Users   │────▶│Enrollments│◀────│   Courses    │         │
│  └──────────┘     └──────────┘     └──────────────┘         │
│       │                                    │                 │
│       │           ┌──────────┐             │                 │
│       └──────────▶│Attendance│◀────────────┘                 │
│                   └──────────┘                               │
│       │                │                                     │
│       │           ┌──────────┐     ┌──────────────┐         │
│       └──────────▶│  Events  │────▶│ Certificates │         │
│                   └──────────┘     └──────────────┘         │
│                        │                                     │
│                   ┌──────────┐                               │
│                   │Registrations│                            │
│                   └──────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

---

### FR-02: Sistem Autentikasi

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|:--------:|---------------------|
| FR-02.1 | User dapat registrasi dengan email dan password | Tinggi | Form registrasi berfungsi, data tersimpan |
| FR-02.2 | User dapat login dengan kredensial yang valid | Tinggi | Session tersimpan, redirect ke dashboard |
| FR-02.3 | Session harus persist selama 30 hari | Sedang | User tidak perlu login ulang |
| FR-02.4 | Role-based access control (RBAC) | Tinggi | Akses sesuai role (Admin, Instructor, dll) |
| FR-02.5 | Logout harus menghapus session | Tinggi | Session dihapus, redirect ke home |

**User Roles:**

| Role | Akses |
|------|-------|
| Learner | Dashboard, Courses, Events, Certificates |
| Instructor | + Class Management, Feedback, Attendance |
| Admin | + Program Management, User Management |
| Manager | + Team Reports, Analytics |
| Finance | + Payment Records, Invoice |

---

### FR-03: Modul Event/Webinar

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|:--------:|---------------------|
| FR-03.1 | Admin dapat membuat event baru | Tinggi | Form create event dengan semua field |
| FR-03.2 | Event memiliki informasi lengkap (judul, tanggal, lokasi, kuota) | Tinggi | Semua field tersimpan |
| FR-03.3 | Event dapat memiliki flyer/poster | Tinggi | Upload gambar berfungsi |
| FR-03.4 | Event dapat memiliki materi/dokumen | Sedang | Upload PDF/dokumen berfungsi |
| FR-03.5 | Event ditampilkan di halaman publik | Tinggi | List event dengan filter |
| FR-03.6 | User dapat melihat detail event | Tinggi | Halaman detail lengkap |
| FR-03.7 | User (login) dapat mendaftar ke event | Tinggi | Tombol daftar, konfirmasi |
| FR-03.8 | Admin dapat melihat daftar peserta | Tinggi | List peserta dengan status |
| FR-03.9 | Admin dapat export daftar peserta | Sedang | Export ke Excel |

**Event Attributes:**

| Field | Type | Required |
|-------|------|:--------:|
| title | String | ✅ |
| description | Text | ✅ |
| date | DateTime | ✅ |
| endDate | DateTime | ❌ |
| location | String | ✅ |
| isOnline | Boolean | ✅ |
| meetingUrl | String | ❌ |
| quota | Integer | ✅ |
| flyer | Image URL | ❌ |
| materials | File URLs | ❌ |
| status | Enum (Draft/Published/Completed/Cancelled) | ✅ |
| registrationDeadline | DateTime | ❌ |

---

### FR-04: Sistem Pendaftaran Event

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|:--------:|---------------------|
| FR-04.1 | User yang sudah login dapat mendaftar event | Tinggi | Button "Daftar" muncul jika login |
| FR-04.2 | Sistem mencegah pendaftaran jika kuota penuh | Tinggi | Pesan error jika kuota penuh |
| FR-04.3 | User menerima konfirmasi pendaftaran | Tinggi | Notifikasi di dashboard |
| FR-04.4 | User dapat melihat event yang didaftari | Tinggi | List "My Events" di dashboard |
| FR-04.5 | User dapat membatalkan pendaftaran | Sedang | Button cancel dengan konfirmasi |
| FR-04.6 | Admin dapat approve/reject pendaftaran | Sedang | Status management |

---

### FR-05: Sistem Absensi

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|:--------:|---------------------|
| FR-05.1 | Sistem generate QR code unik per event | Tinggi | QR code tampil di admin |
| FR-05.2 | Peserta dapat scan QR untuk check-in | Tinggi | Scan → status hadir |
| FR-05.3 | Admin dapat check-in manual | Tinggi | Button check-in per peserta |
| FR-05.4 | Dashboard menampilkan kehadiran real-time | Tinggi | Counter hadir/tidak hadir |
| FR-05.5 | Admin dapat export daftar hadir | Sedang | Export ke Excel |

**Attendance Status:**

| Status | Deskripsi |
|--------|-----------|
| Registered | Terdaftar, belum hadir |
| Present | Hadir (checked-in) |
| Absent | Tidak hadir |
| Late | Hadir terlambat |

---

### FR-06: Sistem Sertifikat

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|:--------:|---------------------|
| FR-06.1 | Sertifikat auto-generate setelah absensi | Tinggi | Status hadir → sertifikat tersedia |
| FR-06.2 | Sertifikat menggunakan template standar | Tinggi | Template dengan branding |
| FR-06.3 | Sertifikat memiliki QR code verifikasi | Tinggi | QR mengarah ke halaman verifikasi |
| FR-06.4 | User dapat download sertifikat PDF | Tinggi | Button download, file PDF valid |
| FR-06.5 | Sertifikat memiliki nomor unik | Tinggi | Unique certificate number |
| FR-06.6 | Admin dapat re-generate sertifikat | Sedang | Button regenerate |

**Certificate Attributes:**

| Field | Type |
|-------|------|
| certificateNumber | String (Unique) |
| userId | Reference |
| eventId / courseId | Reference |
| issueDate | DateTime |
| templateId | Reference |
| pdfUrl | String |
| verificationCode | String |

---

## 4. Non-Functional Requirements

### NFR-01: Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01.1 | Halaman harus load dalam < 3 detik | 95% requests |
| NFR-01.2 | API response time < 500ms | 95% requests |
| NFR-01.3 | Support 100 concurrent users | Load test |

### NFR-02: Security

| ID | Requirement |
|----|-------------|
| NFR-02.1 | Password harus di-hash menggunakan bcrypt |
| NFR-02.2 | Session token harus secure (HTTP-only, SameSite) |
| NFR-02.3 | API endpoints harus memvalidasi authorization |
| NFR-02.4 | File upload harus memvalidasi tipe dan ukuran |

### NFR-03: Usability

| ID | Requirement |
|----|-------------|
| NFR-03.1 | UI harus responsif (desktop, tablet, mobile) |
| NFR-03.2 | Support bahasa Indonesia dan English |
| NFR-03.3 | Error messages harus user-friendly |

---

## 5. Gap Analysis Summary

| Current State (AS-IS) | Future State (TO-BE) | Gap | Solution |
|----------------------|---------------------|-----|----------|
| Mock data (not persistent) | PostgreSQL database | Data tidak tersimpan | Implement Prisma + PostgreSQL |
| No authentication | NextAuth with RBAC | Tidak ada keamanan | Implement NextAuth.js |
| No event module | Full event management | Tidak bisa kelola event | Build Event module |
| No registration | Online registration | Pendaftaran manual | Build Registration system |
| No attendance | QR-based check-in | Absensi manual | Build Attendance system |
| No certificates | Auto-generate PDF | Sertifikat manual | Build Certificate generator |

---

## 6. User Stories

### Epic 1: Authentication
```
Sebagai User,
Saya ingin dapat mendaftar dan login ke platform,
Agar saya dapat mengakses fitur-fitur yang tersedia sesuai role saya.
```

### Epic 2: Event Management
```
Sebagai Admin,
Saya ingin dapat membuat dan mengelola kegiatan/webinar,
Agar peserta dapat melihat dan mendaftar secara online.
```

### Epic 3: Event Registration
```
Sebagai Peserta,
Saya ingin dapat mendaftar ke kegiatan yang diminati,
Agar saya terdaftar dan dapat mengikuti kegiatan tersebut.
```

### Epic 4: Attendance
```
Sebagai Peserta,
Saya ingin dapat check-in saat hadir di kegiatan,
Agar kehadiran saya tercatat dan saya berhak mendapat sertifikat.
```

### Epic 5: Certificate
```
Sebagai Peserta,
Saya ingin dapat mengunduh sertifikat setelah mengikuti kegiatan,
Agar saya memiliki bukti keikutsertaan yang sah.
```

---

## 7. Wireframe Requirements

### 7.1 Halaman Daftar Event (Public)

```
┌────────────────────────────────────────────────────────────┐
│  RENJANA                              [Login] [Language]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Upcoming Events                          [Filter ▼]       │
│                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   [Image]   │  │   [Image]   │  │   [Image]   │        │
│  │             │  │             │  │             │        │
│  │ Event Title │  │ Event Title │  │ Event Title │        │
│  │ 📅 Date     │  │ 📅 Date     │  │ 📅 Date     │        │
│  │ 📍 Location │  │ 📍 Location │  │ 📍 Location │        │
│  │ [View More] │  │ [View More] │  │ [View More] │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 7.2 Halaman Detail Event

```
┌────────────────────────────────────────────────────────────┐
│  ← Back to Events                                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────┐  ┌─────────────────────────────┐ │
│  │                     │  │ Webinar: Mediasi Hukum      │ │
│  │    Event Flyer      │  │                             │ │
│  │      [Image]        │  │ 📅 30 Januari 2026          │ │
│  │                     │  │ 🕐 09:00 - 12:00 WIB        │ │
│  │                     │  │ 📍 Hotel Grand Hyatt        │ │
│  └─────────────────────┘  │ 👥 50/100 peserta           │ │
│                           │                             │ │
│                           │ [  Daftar Sekarang  ]       │ │
│                           └─────────────────────────────┘ │
│                                                            │
│  Deskripsi                                                 │
│  ─────────────────────────────────                         │
│  Lorem ipsum dolor sit amet...                             │
│                                                            │
│  Materi                                                    │
│  ─────────────────────────────────                         │
│  📄 Panduan Mediasi.pdf    [Download]                      │
│  📄 Slide Presentasi.pptx  [Download]                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 7.3 Dashboard Check-in (Admin)

```
┌────────────────────────────────────────────────────────────┐
│  Event: Webinar Mediasi Hukum                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────┐    Kehadiran Real-time                 │
│  │                │    ┌───────────────────────┐           │
│  │   QR CODE      │    │ Hadir:     25 / 50    │           │
│  │   [Scan Me]    │    │ Belum:     25 / 50    │           │
│  │                │    │ Progress:  ████░░ 50% │           │
│  └────────────────┘    └───────────────────────┘           │
│                                                            │
│  Daftar Peserta                          [Export Excel]    │
│  ┌───────┬─────────────────┬───────────┬────────────────┐ │
│  │ No    │ Nama            │ Status    │ Aksi           │ │
│  ├───────┼─────────────────┼───────────┼────────────────┤ │
│  │ 1     │ Ahmad Subarjo   │ ✅ Hadir  │ [Certificate]  │ │
│  │ 2     │ Siti Nurhaliza  │ ⏳ Belum  │ [Check-in]     │ │
│  │ 3     │ Budi Santoso    │ ✅ Hadir  │ [Certificate]  │ │
│  └───────┴─────────────────┴───────────┴────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 8. Acceptance Criteria Summary

### Sprint 1: Database & Auth (2 minggu)
- [ ] PostgreSQL database running
- [ ] Prisma schema defined for all entities
- [ ] User registration working
- [ ] User login working
- [ ] Role-based access implemented
- [ ] Protected routes working

### Sprint 2: Event Module (2 minggu)
- [ ] Event CRUD by Admin
- [ ] Event list page (public)
- [ ] Event detail page
- [ ] Event registration by logged-in users
- [ ] My Events page in dashboard
- [ ] Participant list for Admin

### Sprint 3: Attendance & Certificate (2 minggu)
- [ ] QR code generation per event
- [ ] QR scan check-in
- [ ] Manual check-in by Admin
- [ ] Real-time attendance dashboard
- [ ] Certificate auto-generation
- [ ] Certificate PDF download
- [ ] Certificate verification page

---

## 9. Dependencies & Risks

### Dependencies
| Dependency | Owner | Status |
|------------|-------|--------|
| PostgreSQL server setup | IT Ops | Pending |
| File storage (S3/Cloudinary) | IT Ops | Pending |
| Domain SSL certificate | IT Ops | Done |
| Design assets (logo, template sertifikat) | Design | Pending |

### Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database migration issues | Medium | High | Backup strategy, staging environment |
| Authentication bugs | Medium | High | Thorough testing, use proven library |
| Certificate template approval delay | Medium | Medium | Early design review |
| Timeline overrun | Medium | Medium | Buffer time in UAT phase |

---

## 10. Sign-Off

| Role | Nama | Tanda Tangan | Tanggal |
|------|------|:------------:|---------|
| Business Lead | ____________ | ____________ | _______ |
| IT Lead | ____________ | ____________ | _______ |
| Project Manager | ____________ | ____________ | _______ |

---

*Dokumen ini merupakan deliverable Fase 2: Requirement & Gap Analysis*

*Versi: 1.0 | Status: Draft for Review*
