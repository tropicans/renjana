# Solution Design Document
## Platform LMS RENJANA - Fase 2

---

**Dokumen:** Solution Design  
**Versi:** 1.0  
**Tanggal:** 28 Januari 2026  
**Disusun oleh:** Yudhi Ardinal  
**Status:** Draft

---

## Daftar Isi

1. [Arsitektur Sistem](#1-arsitektur-sistem)
2. [Tech Stack](#2-tech-stack)
3. [Database Design](#3-database-design)
4. [API Design](#4-api-design)
5. [UI/UX Design](#5-uiux-design)
6. [Security Design](#6-security-design)
7. [Integration Design](#7-integration-design)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Estimasi Effort](#9-estimasi-effort)

---

## 1. Arsitektur Sistem

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   Desktop   │  │   Mobile    │  │   Tablet    │                  │
│  │   Browser   │  │   Browser   │  │   Browser   │                  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │
└─────────┼────────────────┼────────────────┼─────────────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      Next.js 16 (Full-stack)                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │  │
│  │  │   Pages/    │  │    API      │  │   Server Actions    │    │  │
│  │  │   Routes    │  │   Routes    │  │   (Server-side)     │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘    │  │
│  │                                                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │  │
│  │  │  NextAuth   │  │   Prisma    │  │   File Upload       │    │  │
│  │  │   (Auth)    │  │   (ORM)     │  │   Service           │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │   PostgreSQL    │  │   Cloudinary    │  │   Email Service     │  │
│  │   (Database)    │  │   (File Storage)│  │   (Resend)          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND COMPONENTS                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Landing    │  │   Events     │  │   Dashboard  │               │
│  │    Page      │  │    Module    │  │    Module    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │    Admin     │  │  Instructor  │  │   Finance    │               │
│  │    Panel     │  │    Panel     │  │    Panel     │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  Attendance  │  │  Certificate │  │    Shared    │               │
│  │   Module     │  │   Module     │  │  Components  │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | React Framework (Full-stack) |
| React | 19.x | UI Library |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.x | Animations |
| Radix UI | Latest | Accessible Components |
| Lucide Icons | Latest | Icon Library |

### 2.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 16.x | REST API endpoints |
| Server Actions | 16.x | Server-side mutations |
| Prisma | 5.x | ORM & Database toolkit |
| NextAuth.js | 5.x | Authentication |

### 2.3 Database & Services

| Technology | Purpose |
|------------|---------|
| PostgreSQL 15 | Primary Database |
| Cloudinary | Image & File Storage |
| Resend | Email Service |

### 2.4 DevOps

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local Development |
| GitHub Actions | CI/CD |
| Vercel / VPS | Hosting |

---

## 3. Database Design

### 3.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │     Course      │       │      Event      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │       │ title           │       │ title           │
│ password        │       │ description     │       │ description     │
│ name            │       │ thumbnail       │       │ date            │
│ role            │       │ instructorId(FK)│       │ location        │
│ avatar          │       │ status          │       │ quota           │
│ createdAt       │       │ createdAt       │       │ flyerUrl        │
│ updatedAt       │       │ updatedAt       │       │ status          │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         │    ┌────────────────────┼─────────────────────────┤
         │    │                    │                         │
         ▼    ▼                    ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Enrollment    │       │   Attendance    │       │  Registration   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ userId (FK)     │       │ userId (FK)     │       │ userId (FK)     │
│ courseId (FK)   │       │ eventId (FK)    │       │ eventId (FK)    │
│ progress        │       │ status          │       │ status          │
│ status          │       │ checkedInAt     │       │ registeredAt    │
│ enrolledAt      │       │ createdAt       │       │ createdAt       │
└─────────────────┘       └─────────────────┘       └─────────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────────────────────────────────┐
│                Certificate                   │
├─────────────────────────────────────────────┤
│ id (PK)                                      │
│ certificateNumber (Unique)                   │
│ userId (FK)                                  │
│ eventId (FK) / courseId (FK)                 │
│ type (COURSE / EVENT)                        │
│ pdfUrl                                       │
│ issuedAt                                     │
│ verificationCode                             │
└─────────────────────────────────────────────┘
```

### 3.2 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  LEARNER
  INSTRUCTOR
  ADMIN
  MANAGER
  FINANCE
}

enum EventStatus {
  DRAFT
  PUBLISHED
  COMPLETED
  CANCELLED
}

enum AttendanceStatus {
  REGISTERED
  PRESENT
  ABSENT
  LATE
}

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password      String
  name          String
  role          UserRole       @default(LEARNER)
  avatar        String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  enrollments   Enrollment[]
  registrations Registration[]
  attendances   Attendance[]
  certificates  Certificate[]
  instructorOf  Course[]       @relation("Instructor")
}

model Course {
  id           String       @id @default(cuid())
  title        String
  description  String
  thumbnail    String?
  instructorId String
  instructor   User         @relation("Instructor", fields: [instructorId], references: [id])
  status       String       @default("draft")
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  
  enrollments  Enrollment[]
  certificates Certificate[]
}

model Event {
  id                   String        @id @default(cuid())
  title                String
  description          String
  date                 DateTime
  endDate              DateTime?
  location             String
  isOnline             Boolean       @default(false)
  meetingUrl           String?
  quota                Int
  flyerUrl             String?
  materials            String[]
  status               EventStatus   @default(DRAFT)
  registrationDeadline DateTime?
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
  
  registrations Registration[]
  attendances   Attendance[]
  certificates  Certificate[]
}

model Enrollment {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  courseId   String
  course     Course   @relation(fields: [courseId], references: [id])
  progress   Int      @default(0)
  status     String   @default("active")
  enrolledAt DateTime @default(now())
  
  @@unique([userId, courseId])
}

model Registration {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  eventId      String
  event        Event    @relation(fields: [eventId], references: [id])
  status       String   @default("pending")
  registeredAt DateTime @default(now())
  
  @@unique([userId, eventId])
}

model Attendance {
  id          String           @id @default(cuid())
  userId      String
  user        User             @relation(fields: [userId], references: [id])
  eventId     String
  event       Event            @relation(fields: [eventId], references: [id])
  status      AttendanceStatus @default(REGISTERED)
  checkedInAt DateTime?
  createdAt   DateTime         @default(now())
  
  @@unique([userId, eventId])
}

model Certificate {
  id                String   @id @default(cuid())
  certificateNumber String   @unique
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  eventId           String?
  event             Event?   @relation(fields: [eventId], references: [id])
  courseId          String?
  course            Course?  @relation(fields: [courseId], references: [id])
  type              String   // "COURSE" or "EVENT"
  pdfUrl            String?
  verificationCode  String   @unique
  issuedAt          DateTime @default(now())
}
```

---

## 4. API Design

### 4.1 API Endpoints

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

#### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all published events |
| GET | `/api/events/[id]` | Get event detail |
| POST | `/api/events` | Create event (Admin) |
| PUT | `/api/events/[id]` | Update event (Admin) |
| DELETE | `/api/events/[id]` | Delete event (Admin) |

#### Registrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events/[id]/register` | Register to event |
| DELETE | `/api/events/[id]/register` | Cancel registration |
| GET | `/api/events/[id]/registrations` | List registrations (Admin) |
| GET | `/api/events/[id]/registrations/export` | Export registrations to Excel (Admin) |

#### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events/[id]/checkin` | Check-in via QR |
| POST | `/api/events/[id]/checkin/[userId]` | Manual check-in (Admin) |
| GET | `/api/events/[id]/attendance` | Get attendance list |
| GET | `/api/events/[id]/attendance/export` | Export attendance to Excel (Admin) |

#### Certificates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/certificates` | User's certificates |
| GET | `/api/certificates/[id]/download` | Download PDF |
| GET | `/api/certificates/verify/[code]` | Verify certificate |

### 4.2 API Response Format

```json
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}

// Paginated Response
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 5. UI/UX Design

### 5.1 Design System

#### Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| Primary | `#2563eb` | `#3b82f6` | Buttons, Links, Accents |
| Background | `#ffffff` | `#0f172a` | Page background |
| Surface | `#f8fafc` | `#1e293b` | Cards, Modals |
| Text | `#1e293b` | `#f1f5f9` | Body text |
| Success | `#22c55e` | `#22c55e` | Success states |
| Error | `#ef4444` | `#ef4444` | Error states |

#### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter | 48px | 800 |
| H2 | Inter | 36px | 700 |
| H3 | Inter | 24px | 600 |
| Body | Inter | 16px | 400 |
| Small | Inter | 14px | 400 |

### 5.2 Page Wireframes

#### Events List Page

```
┌────────────────────────────────────────────────────────────────────┐
│  🏛️ RENJANA                    [Events] [Courses] [Login] [🌙]    │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Upcoming Events                                                    │
│  ════════════════                                                   │
│                                                                     │
│  [🔍 Search events...]                    [Filter: All ▼]          │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │
│  │ │    FLYER     │ │  │ │    FLYER     │ │  │ │    FLYER     │ │  │
│  │ │    IMAGE     │ │  │ │    IMAGE     │ │  │ │    IMAGE     │ │  │
│  │ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │  │
│  │                  │  │                  │  │                  │  │
│  │ Webinar Mediasi  │  │ Workshop Hukum   │  │ Pelatihan ADR    │  │
│  │                  │  │                  │  │                  │  │
│  │ 📅 30 Jan 2026   │  │ 📅 15 Feb 2026   │  │ 📅 28 Feb 2026   │  │
│  │ 📍 Jakarta       │  │ 📍 Online        │  │ 📍 Surabaya      │  │
│  │ 👥 50/100        │  │ 👥 80/100        │  │ 👥 20/50         │  │
│  │                  │  │                  │  │                  │  │
│  │ [  View Detail  ]│  │ [  View Detail  ]│  │ [  View Detail  ]│  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  [  1  ] [ 2 ] [ 3 ] [ > ]                                         │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

#### Event Detail Page

```
┌────────────────────────────────────────────────────────────────────┐
│  ← Kembali ke Events                                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────┐  ┌──────────────────────────────────┐  │
│  │                        │  │                                  │  │
│  │                        │  │  Webinar: Mediasi Hukum Bisnis   │  │
│  │     EVENT FLYER        │  │  ════════════════════════════    │  │
│  │       IMAGE            │  │                                  │  │
│  │                        │  │  📅 Sabtu, 30 Januari 2026       │  │
│  │                        │  │  🕐 09:00 - 12:00 WIB            │  │
│  │                        │  │  📍 Hotel Grand Hyatt, Jakarta    │  │
│  │                        │  │  👥 Kuota: 50/100 peserta        │  │
│  │                        │  │                                  │  │
│  └────────────────────────┘  │  ┌────────────────────────────┐  │  │
│                              │  │                            │  │  │
│                              │  │  [  🎫 DAFTAR SEKARANG  ]  │  │  │
│                              │  │                            │  │  │
│                              │  └────────────────────────────┘  │  │
│                              └──────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Deskripsi                                                    │  │
│  │  ══════════                                                   │  │
│  │                                                               │  │
│  │  Webinar ini akan membahas teknik-teknik mediasi dalam        │  │
│  │  penyelesaian sengketa bisnis. Peserta akan mendapatkan...    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Materi                                                       │  │
│  │  ══════                                                       │  │
│  │                                                               │  │
│  │  📄 Panduan Mediasi.pdf                    [ Download ]       │  │
│  │  📄 Slide Presentasi.pptx                  [ Download ]       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

#### Admin Check-in Dashboard

```
┌────────────────────────────────────────────────────────────────────┐
│  🏛️ RENJANA ADMIN           [Dashboard] [Events] [Users] [Logout] │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Event: Webinar Mediasi Hukum Bisnis                               │
│  ══════════════════════════════════                                │
│                                                                     │
│  ┌────────────────┐  ┌────────────────────────────────────────┐   │
│  │                │  │         STATISTIK KEHADIRAN             │   │
│  │   ██████████   │  │  ────────────────────────────────────   │   │
│  │   ██ QR   ██   │  │                                        │   │
│  │   ██ CODE ██   │  │   ✅ Hadir      : 35 peserta           │   │
│  │   ██████████   │  │   ⏳ Belum      : 15 peserta           │   │
│  │                │  │   ❌ Tidak Hadir: 0 peserta            │   │
│  │  [ Print QR ]  │  │                                        │   │
│  │                │  │   Progress: ████████████░░░░ 70%       │   │
│  └────────────────┘  └────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Daftar Peserta                         [ Export Excel ]     │  │
│  │  ══════════════                                              │  │
│  │                                                               │  │
│  │  ┌─────┬──────────────────┬────────────┬──────────────────┐  │  │
│  │  │ No  │ Nama             │ Status     │ Aksi             │  │  │
│  │  ├─────┼──────────────────┼────────────┼──────────────────┤  │  │
│  │  │ 1   │ Ahmad Subarjo    │ ✅ Hadir   │ [📜 Sertifikat]  │  │  │
│  │  │ 2   │ Siti Nurhaliza   │ ⏳ Belum   │ [✓ Check-in]     │  │  │
│  │  │ 3   │ Budi Santoso     │ ✅ Hadir   │ [📜 Sertifikat]  │  │  │
│  │  │ 4   │ Dewi Kartika     │ ⏳ Belum   │ [✓ Check-in]     │  │  │
│  │  └─────┴──────────────────┴────────────┴──────────────────┘  │  │
│  │                                                               │  │
│  │  [ 1 ] [ 2 ] [ 3 ] [ > ]                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

#### Certificate Template

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                           ═══════════════                           │
│                             SERTIFIKAT                              │
│                           ═══════════════                           │
│                                                                     │
│                      🏛️ RENJANA Learning                           │
│                                                                     │
│                        dengan ini menyatakan                        │
│                                                                     │
│                     ════════════════════════                        │
│                        AHMAD SUBARJO                                │
│                     ════════════════════════                        │
│                                                                     │
│                  telah berhasil mengikuti kegiatan                  │
│                                                                     │
│                    "Webinar Mediasi Hukum Bisnis"                   │
│                                                                     │
│                  yang diselenggarakan pada tanggal                  │
│                        30 Januari 2026                              │
│                                                                     │
│                                                                     │
│   Jakarta, 30 Januari 2026                                         │
│                                                                     │
│                                                                     │
│   ___________________                        ___________________    │
│   Direktur Renjana                           Ketua Panitia          │
│                                                                     │
│                                                                     │
│   ┌─────────┐                                                       │
│   │ QR CODE │   No. Sertifikat: RJN-2026-00001                     │
│   └─────────┘   Verifikasi: renjana.com/verify/ABC123              │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## 6. Security Design

### 6.1 Authentication Flow

```
┌──────────┐                    ┌──────────┐                ┌──────────┐
│  Client  │                    │  Server  │                │ Database │
└────┬─────┘                    └────┬─────┘                └────┬─────┘
     │                               │                           │
     │  1. POST /login               │                           │
     │  {email, password}            │                           │
     │──────────────────────────────>│                           │
     │                               │  2. Find user by email    │
     │                               │──────────────────────────>│
     │                               │                           │
     │                               │  3. Return user           │
     │                               │<──────────────────────────│
     │                               │                           │
     │                               │  4. Verify password       │
     │                               │      (bcrypt.compare)     │
     │                               │                           │
     │  5. Set session cookie        │                           │
     │  (HTTP-only, Secure)          │                           │
     │<──────────────────────────────│                           │
     │                               │                           │
```

### 6.2 Security Measures

| Area | Measure |
|------|---------|
| Password | bcrypt hash (12 rounds) |
| Session | HTTP-only, Secure, SameSite cookies |
| API | Rate limiting (100 req/min) |
| File Upload | Type validation, max size 10MB |
| Input | Server-side validation (Zod) |
| CSRF | Built-in NextAuth protection |

---

## 7. Integration Design

### 7.1 File Upload (Cloudinary)

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadFile(file: File, folder: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `renjana/${folder}` },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}
```

### 7.2 Email (Resend)

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRegistrationConfirmation(to: string, event: Event) {
  await resend.emails.send({
    from: 'RENJANA <noreply@renjana.com>',
    to,
    subject: `Konfirmasi Pendaftaran: ${event.title}`,
    html: `<h1>Pendaftaran Berhasil!</h1>...`
  });
}
```

### 7.3 PDF Generation (Certificate)

```typescript
// lib/certificate.ts
import PDFDocument from 'pdfkit';

export async function generateCertificate(data: CertificateData) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
  
  // Add certificate content
  doc.fontSize(36).text('SERTIFIKAT', { align: 'center' });
  doc.fontSize(24).text(data.userName, { align: 'center' });
  doc.fontSize(16).text(`"${data.eventTitle}"`, { align: 'center' });
  
  // Add QR code
  const qrCode = await generateQRCode(data.verificationUrl);
  doc.image(qrCode, 50, 350, { width: 80 });
  
  return doc;
}
```

---

## 8. Deployment Architecture

### 8.1 Production Environment

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION ENVIRONMENT                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐                                               │
│  │   Cloudflare     │  CDN + DDoS Protection                        │
│  │   (DNS + CDN)    │                                               │
│  └────────┬─────────┘                                               │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────┐                                               │
│  │   Vercel /       │  Next.js Hosting                              │
│  │   VPS (Docker)   │  Auto-scaling                                 │
│  └────────┬─────────┘                                               │
│           │                                                          │
│           ├───────────────────┬───────────────────┐                 │
│           │                   │                   │                 │
│           ▼                   ▼                   ▼                 │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
│  │  PostgreSQL      │ │   Cloudinary     │ │     Resend       │    │
│  │  (Supabase/      │ │   (Files)        │ │     (Email)      │    │
│  │   Neon/Railway)  │ │                  │ │                  │    │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 9. Estimasi Effort

### 9.1 Sprint Breakdown

| Sprint | Durasi | Deliverable | Effort |
|--------|--------|-------------|--------|
| Sprint 1 | 2 minggu | Database + Auth + API Foundation | 80 jam |
| Sprint 2 | 2 minggu | Event Module (CRUD, Registration) | 80 jam |
| Sprint 3 | 2 minggu | Attendance + Certificate | 80 jam |
| UAT | 2 minggu | Testing + Bug Fixing | 60 jam |
| Go-Live | 1 minggu | Deployment + Training | 40 jam |

### 9.2 Resource Allocation

| Role | Allocation | Responsibility |
|------|------------|----------------|
| Full-stack Developer | 100% | Development, API, Database |
| UI/UX Designer | 25% | Design review, Asset creation |
| QA Engineer | 50% (Sprint UAT) | Testing |
| Project Manager | 20% | Coordination |

### 9.3 Dependencies

| Item | Status | Owner | Deadline |
|------|--------|-------|----------|
| PostgreSQL Server | Pending | IT Ops | Sprint 1 |
| Cloudinary Account | Pending | IT | Sprint 1 |
| Resend Account | Pending | IT | Sprint 2 |
| Certificate Template Design | Pending | Design | Sprint 3 |
| Domain SSL | Done | IT Ops | - |

---

## 10. Sign-Off

| Role | Nama | Tanda Tangan | Tanggal |
|------|------|:------------:|---------|
| IT Lead | ____________ | ____________ | _______ |
| Business Lead | ____________ | ____________ | _______ |
| Project Manager | ____________ | ____________ | _______ |

---

*Dokumen ini merupakan deliverable Fase 3: Solution Design*

*Versi: 1.0 | Status: Draft for Review*
