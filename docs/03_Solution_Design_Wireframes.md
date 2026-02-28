# Solution Design Document (SDD) & Wireframes
**Project:** Renjana Learning Management System (Fase 2)
**Date:** 28 Februari 2026
**Status:** Draft

---

## 1. Pendahuluan
Dokumen ini menguraikan arsitektur teknis, desain database, struktur API, dan rancangan antarmuka (Wireframe) untuk implementasi **Fase 2** sesuai dengan kebutuhan yang didefinisikan dalam dokumen *02_BRD_FRD_Phase2*.

---

## 2. Arsitektur Sistem (Target Fase 2)
Sistem akan menggunakan pendekatan **Monolithic Modern** memanfaatkan fitur full-stack dari Next.js App Router.

### 2.1 C4 Model - Container Diagram
```mermaid
flowchart TD
    %% Define Actors
    U_Learner((👤 Learner))
    U_Admin((⚙️ Admin))
    U_Instruct((👨‍🏫 Instructor))

    %% Define External System
    EXT_Mail[["📧 SMTP / WA API<br/>(External Notif)"]]

    %% Define Renjana System
    subgraph System ["Renjana LMS"]
        direction TB
        WebApp["🖥️ Web Application<br/>(Next.js, UI)"]
        API["⚡ API Layer<br/>(Route Handlers)"]
        DB[("🗄️ PostgreSQL DB<br/>(Prisma ORM)")]
        Storage[("📁 Object Storage<br/>(S3 / MinIO)")]
        
        WebApp -->|HTTP Requests| API
        API -->|Read/Write| DB
        API -->|Upload/Get| Storage
    end

    %% Define Relationships
    U_Learner -->|Akses Panel| WebApp
    U_Admin -->|Kelola Data| WebApp
    U_Instruct -->|Akses Dashboard| WebApp
    
    API -->|Trigger Peringatan| EXT_Mail

    %% Styling
    style System fill:#f8fafc,stroke:#94a3b8,stroke-width:2px,stroke-dasharray: 5 5
    style WebApp fill:#0ea5e9,color:#fff,stroke:#0284c7
    style API fill:#22c55e,color:#fff,stroke:#16a34a
    style DB fill:#3b82f6,color:#fff,stroke:#2563eb
    style Storage fill:#8b5cf6,color:#fff,stroke:#7c3aed
```

---

## 3. Desain Database (Entity Relationship Diagram)
Database akan menggunakan PostgreSQL yang dikelola melalui Prisma ORM.

```mermaid
erDiagram
    User ||--o{ Enrollment : "has"
    User ||--o{ ActivityLog : "performs"
    User ||--o{ Attendance : "submits"
    
    Course ||--o{ Module : "contains"
    Module ||--o{ Lesson : "contains"
    
    Course ||--o{ Enrollment : "has"
    Enrollment ||--o{ Progress : "tracks"
    Lesson ||--o{ Progress : "recorded_in"
    
    Enrollment ||--o| Certificate : "earns"
    Lesson ||--o{ Attendance : "requires"

    User {
        uuid id PK
        string email
        string password_hash
        string full_name
        string role "LEARNER, ADMIN, INSTRUCTOR"
        datetime created_at
    }
    
    Course {
        uuid id PK
        string title
        string description
        string status "DRAFT, PUBLISHED"
    }
    
    Enrollment {
        uuid id PK
        uuid user_id FK
        uuid course_id FK
        string status "ACTIVE, COMPLETED, DROPPED"
        float completion_percentage
    }
    
    Progress {
        uuid id PK
        uuid enrollment_id FK
        uuid lesson_id FK
        boolean is_completed
        int score
    }
```

---

## 4. Desain API (RESTful Endpoints)
API akan diimplementasikan di folder `src/app/api/` menggunakan Next.js Route Handlers.

### 4.1 Authentication & Profile
| Method | Endpoint | Deskripsi | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Menerima email/password, mengembalikan JWT cookie | No |
| `POST` | `/api/auth/logout` | Melakukan clear cookie JWT | Yes |
| `GET` | `/api/users/me` | Mengambil profile user yang sedang login | Yes |

### 4.2 Courses & Learning
| Method | Endpoint | Deskripsi | Auth Required |
|---|---|---|---|
| `GET` | `/api/courses` | List semua kursus (bisa difilter) | Yes |
| `GET` | `/api/courses/[id]` | Detail kursus dan kurikulumnya | Yes |
| `POST` | `/api/enrollments` | Mendaftar ke sebuah kursus | Yes (Learner) |
| `PUT` | `/api/progress/[lessonId]` | Menandai lesson selesai / update skor | Yes (Learner) |

---

## 5. Wireframes (Desain UI Baru)
Sebagian besar UI sudah dikembangkan di Fase 1. Namun, ada beberapa komponen baru yang perlu dibuat di Fase 2 berdasarkan BRD.

### 5.1 Wireframe: Continue Learning Card (Dashboard Learner)
Komponen ini akan diletakkan di paling atas `src/app/dashboard/page.tsx` untuk memudahkan *resume* kelas.

<div style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; background-color: #f8fafc; font-family: sans-serif; margin-bottom: 20px;">
  <h3 style="margin-top: 0; display: flex; align-items: center; gap: 8px;">📚 Lanjutkan Belajar Anda</h3>
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div>
      <p style="margin: 4px 0; font-weight: bold;">Kursus: Dasar Pemrograman Web</p>
      <p style="margin: 4px 0; color: #64748b;">Modul Terakhir: Pengenalan HTML5</p>
    </div>
    <button style="background-color: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">Lanjutkan 👉</button>
  </div>
  <div style="margin-top: 15px; background-color: #e2e8f0; border-radius: 4px; height: 10px; width: 100%;">
    <div style="background-color: #10b981; border-radius: 4px; height: 10px; width: 50%;"></div>
  </div>
  <p style="text-align: right; margin: 4px 0; font-size: 12px; color: #64748b;">50% Selesai</p>
</div>

### 5.2 Wireframe: Attendance Form (Check-In Modal)
Muncul saat Learner mengklik tombol "Check In" pada modul yang mewajibkan absensi tatap muka/sinkron.

<div style="border: 2px solid #cbd5e1; border-radius: 12px; padding: 0; background-color: white; max-width: 500px; margin: 0 auto 20px auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);">
  <div style="border-bottom: 1px solid #e2e8f0; padding: 15px 20px;">
    <h3 style="margin: 0; font-size: 18px;">📍 Form Absensi Kehadiran</h3>
  </div>
  <div style="padding: 20px;">
    <p style="font-weight: bold; margin-bottom: 5px;">Lokasi Anda saat ini:</p>
    <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; border: 1px dashed #94a3b8; color: #475569; text-align: center; margin-bottom: 15px;">
      🌍 Mengambil koordinat GPS... (Izinkan Akses Lokasi)
    </div>
    <p style="font-weight: bold; margin-bottom: 5px;">Bukti Kehadiran (Opsional):</p>
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 6px; border: 1px dashed #94a3b8; text-align: center; cursor: pointer;">
      📤 Klik untuk Upload Foto Selfie Anda
    </div>
  </div>
  <div style="border-top: 1px solid #e2e8f0; padding: 15px 20px; display: flex; justify-content: flex-end; gap: 10px; background-color: #f8fafc; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
    <button style="border: 1px solid #cbd5e1; background: white; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Batal</button>
    <button style="background-color: #0ea5e9; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">✓ Submit Kehadiran</button>
  </div>
</div>

### 5.3 Wireframe: Certificate Viewer (PDF Render)
Tampilan saat peserta mengklik tombol "Download Sertifikat".

<div style="border: 2px solid #cbd5e1; border-radius: 8px; padding: 20px; background-color: #f8fafc; text-align: center;">
  <h3 style="margin-top: 0;">🎓 Sertifikat Kelulusan</h3>
  
  <div style="background-color: white; border: 1px solid #e2e8f0; width: 80%; aspect-ratio: 1.414; margin: 20px auto; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 4px;">
    <h1 style="color: #0f172a; margin: 0; font-size: 24px;">CERTIFICATE OF COMPLETION</h1>
    <p style="color: #64748b; margin: 10px 0;">This is to certify that</p>
    <h2 style="color: #2563eb; margin: 0;">Nama Peserta Pelatihan</h2>
    <p style="color: #64748b; margin: 10px 0;">has successfully completed</p>
    <h3 style="color: #0f172a; margin: 0;">Dasar Pemrograman Web</h3>
    <p style="color: #64748b; margin-top: 20px; font-size: 12px;">Date: 28 Feb 2026</p>
  </div>
  
  <div style="display: flex; justify-content: center; gap: 15px;">
    <button style="background-color: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">⬇️ Download PDF</button>
    <button style="background-color: #0077b5; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer;">🔗 Add to LinkedIn</button>
  </div>
</div>

---

## 6. Skenario Migrasi Data (Mock $\rightarrow$ Relational DB)
1. **Schema Creation**: Menulis schema Prisma `schema.prisma`.
2. **Migration**: Menjalankan `npx prisma migrate dev` untuk membuat tabel PostgreSQL.
3. **Seeding Script**: Membuat script TypeScript khusus yang membaca file `lib/data/users.ts` dan `courses.ts` yang lama, melakukan *hashing bcrypt* untuk password default, dan melempar datanya menggunakan `prisma.user.createMany()` dan `prisma.course.create()`.
4. **Environment Swap**: Menghapus import mock data dari komponen, dan menggantinya dengan pemanggilan `fetch('/api/...')`.

---
*Dokumen ini merupakan output dari Fase Requirement Analysis (Design) sesuai Timeline Renjana.*
