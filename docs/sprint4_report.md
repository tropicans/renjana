# Sprint 4 Report — Attendance & Evidence System
**Project:** Renjana LMS  
**Sprint:** 4 of 6  
**Date:** 28 Februari 2026  
**Status:** ✅ Completed  

---

## Ringkasan

Sprint 4 mengimplementasikan sistem kehadiran dengan GPS dan upload evidence. Semua API baru + frontend terintegrasi.

---

## Deliverables

### 1. API Routes

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/api/attendance` | Login | Check-in dengan GPS coords opsional |
| GET | `/api/attendance` | Login | Role-based: instructor/admin → semua, learner → milik sendiri |
| POST | `/api/evidence` | Login | Multipart file upload (JPEG/PNG/WebP/PDF, maks 10MB) |
| GET | `/api/evidence` | Login | Role-based: admin/instructor → semua, learner → milik sendiri |

### 2. API Client (`api.ts`)
- `fetchAttendances(lessonId?)` — get attendance records
- `checkIn({ lessonId, latitude?, longitude?, notes? })` — check-in
- `fetchEvidences()` — get evidence list
- `uploadEvidence(title, file)` — upload file via FormData

### 3. Frontend Pages

| Page | Keterangan |
|------|------------|
| `/dashboard/checkin` | GPS geolocation, lesson selector, check-in mutation, history |
| `/dashboard/evidence` | File upload drag-click area, evidence grid |
| `/instructor/attendance` | Stats cards, records grouped by date, search, table |

---

## Audit Sprint 4
- ✅ Zero `@/lib/data` mock imports in `src/app/` and `src/components/`
- ✅ Build passed with exit code 0
- ✅ File validation: type + size checks on evidence upload
- ✅ Ownership validation: users can only see own attendance/evidence

---

## Build Result
```
✓ Compiled successfully
Exit code: 0
```

*Sprint 4 selesai. Lanjut ke Sprint 5: Certificate Generator & Notifikasi.*
