# LMS PLATFORM–PRODUCT FULL STACK BLUEPRINT

Dokumen ini adalah **blueprint teknis & arsitektural siap eksekusi** untuk membangun LMS modern yang berfungsi **sebagai platform sekaligus produk**, berbasis **activity-based learning**, **LRS-first**, dan **automation-driven**.

Blueprint ini **tidak bergantung SCORM**, **WA-agnostic**, dan **payment-agnostic**.

---

## 1. POSISI PRODUK (CLEAR STATEMENT)

- LMS = **Learning Orchestration Platform**
- Bukan CMS, bukan video hosting, bukan WhatsApp bot
- Produk **multi-tenant**, bisa dipakai:
  - Corporate
  - Akademi
  - Edu publik

> Prinsip: *If learning fails, the system must know why.*

---

## 2. DOMAIN MODEL (CORE CONCEPTS)

### 2.1 Core Entities

```
Tenant
User
Role
Program
Activity
Evidence
Assessment
Competency
Enrollment
Entitlement
Transaction
Notification
Rule
Event
```

---

## 3. EXPERIENCE LAYER (MULTI-UX, SINGLE CORE)

### 3.1 Learner App
- Web + PWA
- Home = NEXT ACTION
- Offline-capable

Key Screens:
- Action Queue
- Activity View
- Evidence Upload
- Feedback

---

### 3.2 Instructor Console
- Cohort Health
- Learner Drill-down
- Feedback & Rubric
- Attendance Override

---

### 3.3 Admin Control Plane
- Program Builder
- Activity Template
- Rule Editor
- Enrollment Logic
- Audit Log

---

### 3.4 Manager / HR Dashboard
- Skill Coverage
- Risk Heatmap
- Training Impact

---

### 3.5 Finance Console
- Transaction
- Invoice
- Refund
- Entitlement Mapping

---

## 4. LEARNING ORCHESTRATION CORE

### 4.1 Program Engine

Program = container logika

```
Program {
  id
  objective
  completion_rules
}
```

---

### 4.2 Activity Engine (INTI LMS)

```
Activity {
  id
  type
  modality
  unlock_rule
  evidence_required
}
```

Tatap muka = activity + schedule + evidence

---

### 4.3 Rule & Automation Engine

Contoh:
```
IF score < 60
THEN assign remedial
AND notify instructor
```

Engine harus:
- Event-driven
- Idempotent
- Observable

---

### 4.4 Assessment Engine

- Quiz
- Observasi
- Peer review
- Assignment

Assessment ≠ quiz

---

### 4.5 Attendance & Evidence Engine

Evidence:
- QR
- Geo
- Photo
- Signature

Evidence → Event → xAPI

---

### 4.6 Training Modality (MODE PELATIHAN)

LMS mendukung **3 mode pelatihan** yang dapat dikombinasikan dalam satu program:

#### 4.6.1 LURING (Offline/Tatap Muka)

```
Modality: LURING {
  location: required
  schedule: required
  instructor: required
  max_participants: optional
  evidence_types: [QR, GEO, PHOTO, SIGNATURE]
  attendance_rule: physical_presence
}
```

**Karakteristik:**
- Kehadiran fisik wajib
- Evidence berbasis lokasi (GPS/QR)
- Instructor memvalidasi kehadiran
- Ruangan/venue harus didefinisikan

**Role Responsibilities:**
| Role | Tanggung Jawab |
|------|----------------|
| Admin | Setup lokasi, jadwal, kapasitas |
| Instructor | Validasi kehadiran, moderasi sesi |
| Learner | Scan QR/GPS check-in, upload foto |
| Manager | Monitor kehadiran tim |

---

#### 4.6.2 DARING (Online/Virtual)

```
Modality: DARING {
  platform: [ZOOM, MEET, TEAMS, WEBEX]
  video_url: optional (recorded)
  live_session: boolean
  auto_attendance: boolean
  evidence_types: [PLATFORM_LOG, SCREEN_TIME, QUIZ_COMPLETION]
  attendance_rule: platform_tracked
}
```

**Karakteristik:**
- Akses via platform virtual
- Attendance otomatis dari log platform
- Bisa live atau recorded
- Evidence dari waktu screen time

**Role Responsibilities:**
| Role | Tanggung Jawab |
|------|----------------|
| Admin | Setup platform, generate meeting link |
| Instructor | Host sesi live, manage recording |
| Learner | Join sesi, complete required watch time |
| Manager | Review completion rates |

---

#### 4.6.3 HYBRID (Kombinasi Luring + Daring)

```
Modality: HYBRID {
  luring_sessions: Activity[]
  daring_sessions: Activity[]
  completion_rule: [ALL, PERCENTAGE, EITHER_OR]
  flexible_attendance: boolean
  evidence_types: [ALL_TYPES]
}
```

**Karakteristik:**
- Gabungan sesi tatap muka dan online
- Fleksibilitas pilihan mode per sesi
- Completion rule bisa diatur (harus semua / persentase / salah satu)
- Evidence gabungan kedua mode

**Role Responsibilities:**
| Role | Tanggung Jawab |
|------|----------------|
| Admin | Design program hybrid, set completion rules |
| Instructor | Koordinasi sesi luring & daring |
| Learner | Pilih mode sesuai ketersediaan |
| Manager | Track hybrid completion metrics |

---

#### 4.6.4 Modality Rules Engine

```
Rule Examples:

IF modality = LURING AND no_gps_evidence
THEN mark_absent AND notify_learner

IF modality = DARING AND watch_time < 80%
THEN mark_incomplete AND suggest_rewatch

IF modality = HYBRID AND completion < threshold
THEN extend_deadline OR assign_alternative
```

---

#### 4.6.5 Modality Data Model

```
Activity {
  id
  type
  modality: LURING | DARING | HYBRID
  modality_config: {
    // LURING
    location_id?
    venue_name?
    gps_coords?
    qr_code?
    
    // DARING
    platform?
    meeting_url?
    recording_url?
    min_watch_percentage?
    
    // HYBRID
    luring_weight?
    daring_weight?
    completion_rule?
  }
  unlock_rule
  evidence_required
}
```

---

## 5. EVIDENCE & RECORD LAYER

### 5.1 Learning Record Store (LRS)

- xAPI compliant
- Custom verbs
- Context-rich

---

### 5.2 Event Stream

Pisahkan:
- Learning Event
- UX Event
- Business Event

---

### 5.3 Competency Graph

- Evidence-backed
- Time-decay aware
- Role-mapped

---

## 6. INTEGRATION & AUTOMATION LAYER

### 6.1 WhatsApp (Peripheral)

Fungsi:
- Reminder
- Alert
- Confirmation

WA ≠ LMS

---

### 6.2 Payment

Pisahkan:

```
Transaction → Entitlement → Enrollment
```

- Idempotent webhook
- Refund-safe

---

### 6.3 External Integration

- Zoom / Meet
- Calendar
- HRIS
- SSO

Webhook-first

---

## 7. DATA MODEL (SIMPLIFIED ERD)

### 7.1 Enrollment

```
Enrollment {
  user_id
  program_id
  status
}
```

---

### 7.2 Evidence

```
Evidence {
  user_id
  activity_id
  type
  uri
  timestamp
}
```

---

### 7.3 Event

```
Event {
  actor
  verb
  object
  context
}
```

---

## 8. API & SERVICE LAYER

### API Style
- GraphQL (UI)
- REST (integration)

### Core Services
- Auth Service
- Learning Service
- Evidence Service
- Rule Engine
- Notification Service
- Payment Service

---

## 9. STACK REKOMENDASI

Frontend:
- React / Next.js
- Tailwind

Backend:
- Node.js (NestJS) / Go

Data:
- PostgreSQL
- Object Storage
- Event Stream

Automation:
- Internal Rule Engine
- n8n (external)

Infra:
- GCP / AWS
- Cloud Run / ECS
- CDN + WAF

---

## 10. NON-FUNCTIONAL REQUIREMENTS

- Multi-tenant
- Horizontal scaling
- Audit trail
- Observability
- Data isolation

---

## 11. DELIVERY STRATEGY (IMPORTANT)

### Phase 1 (MVP CORE)
- Activity Engine
- Evidence
- LRS
- Learner App

### Phase 2
- Rule Engine
- Instructor Console
- WhatsApp

### Phase 3
- Payment
- Marketplace
- Advanced Analytics

---

## 12. SUCCESS METRIC (REAL)

- Drop-off per activity
- Rule-triggered intervention
- Evidence completion rate
- Skill delta over time

Bukan: jumlah video ditonton.

---

## 13. FINAL NOTE

Jika LMS ini terasa **terlalu serius**, itu tanda desainnya benar.

LMS dewasa **tidak memaksa orang belajar**, tapi **tidak membiarkan kebohongan belajar terjadi**.

