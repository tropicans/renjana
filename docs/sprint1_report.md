# Sprint 1 Report — Database & Authentication
**Project:** Renjana LMS  
**Sprint:** 1 of 6  
**Date:** 28 Februari 2026  
**Status:** ✅ Completed  

---

## Ringkasan

Sprint 1 fokus pada fondasi teknis: setup database PostgreSQL via Docker, migrasi schema dengan Prisma ORM, implementasi NextAuth untuk autentikasi, dan deployment ke Docker container.

---

## Deliverables

### 1. Docker Infrastructure
| Komponen | Image | Port | Status |
|---|---|---|---|
| PostgreSQL 16 | `postgres:16-alpine` | 5432 | ✅ Healthy |
| Adminer (DB GUI) | `adminer` | 8080 | ✅ Running |
| Next.js App | `node:20-alpine` (multi-stage) | 3214 | ✅ Healthy |

**File:** `docker-compose.yml`, `Dockerfile`

### 2. Database Schema (Prisma)
Model yang dibuat:

| Model | Keterangan |
|---|---|
| `User` | id, email, passwordHash, fullName, role (ADMIN/INSTRUCTOR/MANAGER/FINANCE/LEARNER) |
| `Course` | id, title, description, status (DRAFT/PUBLISHED/ARCHIVED) |
| `Module` | id, courseId, title, order |
| `Lesson` | id, moduleId, title, type (VIDEO/READING/QUIZ/ASSIGNMENT/LIVE_SESSION), order, durationMin |
| `Enrollment` | id, userId, courseId, status, completionPercentage |
| `Progress` | id, enrollmentId, lessonId, completed, completedAt |
| `Attendance` | id, userId, courseId, checkInTime, gpsLat, gpsLng |
| `Evidence` | id, userId, courseId, fileUrl, description |

**File:** `prisma/schema.prisma`

### 3. Seed Data
```
👥 Users:
   ✅ ADMIN: Admin Renjana (admin@renjana.com / admin123)
   ✅ LEARNER: Ahmad Pratama (ahmad@example.com / password123)
   ✅ LEARNER: Siti Rahayu (siti@example.com / password123)
   ✅ INSTRUCTOR: Budi Santoso (budi@example.com / password123)
   ✅ MANAGER: Diana Putri (diana@example.com / password123)
   ✅ FINANCE: Eko Wijaya (eko@example.com / password123)

📚 Courses:
   ✅ Dasar Hukum Perdata Indonesia (2 modul, 5 lesson)
   ✅ Hukum Acara Perdata & Pidana (2 modul, 3 lesson)

🎓 Enrollments:
   ✅ Ahmad → Dasar Hukum Perdata Indonesia
   ✅ Siti → Dasar Hukum Perdata Indonesia
```

**File:** `prisma/seed.ts`

### 4. Authentication (NextAuth v5)
- **Provider:** Credentials (email + password)
- **Strategy:** JWT
- **Session:** User ID, email, name, role disimpan di JWT token
- **RBAC Middleware:** `src/proxy.ts` — proteksi route per role
- **Docker Env:** `AUTH_TRUST_HOST=true`, `NEXTAUTH_SECRET` hardcoded

**Files:** `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/proxy.ts`

### 5. Login Flow
- Login form menggunakan `signIn("credentials")` dari NextAuth
- `UserProvider` membaca session dari `useSession()` (bukan mock data)
- Role-based redirect setelah login: ADMIN→`/admin`, LEARNER→`/dashboard`

**Files:** `src/components/auth/login-form.tsx`, `src/lib/context/user-context.tsx`

---

## Issues & Fixes

| # | Issue | Root Cause | Fix |
|---|---|---|---|
| 1 | Docker build fail | `middleware.ts` deprecated di Next.js 16 | Rename → `proxy.ts` |
| 2 | Docker build fail | Prisma client not generated | Tambah `RUN npx prisma generate` di Dockerfile |
| 3 | Container crash | `libquery_engine` missing | Install `openssl` + copy `.prisma` engine ke runner |
| 4 | Auth error | `UntrustedHost` | Tambah `AUTH_TRUST_HOST=true` di docker-compose |
| 5 | Login unresponsive | `UserProvider` import mock data crash hydration | Ganti → NextAuth `useSession()` |
| 6 | TypeScript errors | Role casing mismatch | Update `admin` → `ADMIN` di layout files |

---

## Teknologi Stack

| Layer | Teknologi | Versi |
|---|---|---|
| Framework | Next.js | 16.1.6 |
| ORM | Prisma | 5.22.0 |
| Database | PostgreSQL | 16 (Alpine) |
| Auth | NextAuth (Auth.js) | v5 beta |
| Runtime | Node.js | 20 (Alpine) |
| Container | Docker + Compose | Latest |

---

## Git Commits (Sprint 1)
- `feat(sprint1): setup prisma + postgres + docker compose`
- `fix: rename middleware.ts to proxy.ts for nextjs 16 compatibility`
- `fix: add prisma generate to dockerfile before next build`
- `fix: add prisma alpine binary target + auth trust host for docker`
- `fix: add openssl + copy prisma engines to docker runner stage`
- `fix: replace mock UserProvider with NextAuth useSession, fix role casing + header avatar`

---

*Sprint 1 selesai. Lanjut ke Sprint 2: Core API & Frontend Integration.*
