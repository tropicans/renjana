# Sprint 5 Report — Certificate Generator & Notification
**Project:** Renjana LMS  
**Sprint:** 5 of 6  
**Date:** 28 Februari 2026  
**Status:** ✅ Completed  

---

## Ringkasan

Sprint 5 mengimplementasikan sistem sertifikat otomatis. Saat learner menyelesaikan 100% course, certificate record dibuat otomatis. PDF landscape A4 di-generate on-demand dengan jsPDF.

---

## Deliverables

### 1. API Routes

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/api/certificates/[enrollmentId]` | Login | Generate PDF atau return existing cert |

### 2. Auto-Trigger Certificate
- `PUT /api/progress` sekarang auto-membuat certificate record saat `completionPercentage === 100`
- Response includes `certificateCreated: boolean`

### 3. PDF Certificate Design (jsPDF)
- Landscape A4 format
- Double border (red)
- "RENJANA LEGAL TRAINING CENTER" header
- "CERTIFICATE OF COMPLETION" title
- Learner name (28pt)
- Course title (18pt, red)
- Issue date + Certificate ID
- Signature line
- Saved to `/public/uploads/certificates/`

### 4. Frontend
- `/dashboard/certificates` — shows completed courses with "Generate Sertifikat" button
- On-demand PDF generation via React Query
- Download link after generation
- Stats: certificates available vs in-progress

### 5. API Client (`api.ts`)
- `ApiCertificate` interface
- `fetchCertificate(enrollmentId)` function

---

## Audit Sprint 5
- ✅ Build passed with exit code 0
- ✅ Ownership validation: users can only access own certificates
- ✅ Duplicate prevention: existing cert returned instead of re-creating
- ✅ Completion check: 400 if course not yet completed

---

*Sprint 5 selesai. Lanjut ke Sprint 6: Testing, Polish & Go-Live Prep.*
