# Phase 15: GPS Attendance Validation Audit - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 15-gps-attendance-validation-audit
**Areas discussed:** Geolocation Coordinates Config, Handling Missing Geolocation in Request, Modality Enforcement

---

## Geolocation Coordinates Config

| Option | Description | Selected |
|--------|-------------|----------|
| Option A | Hardcode Monas coordinates (Lat -6.175392, Long 106.827153) with a 500m radius limit, as described in the UAT scenarios. This requires no database schema changes. | ✓ |
| Option B | Add latitude, longitude, and radius fields to the Event model in schema.prisma (requires a database migration). | |

**User's choice:** Option A.
**Notes:** Coordinates are fixed to Monas coordinates with a 500m radius limit.

---

## Handling Missing Geolocation in Request

| Option | Description | Selected |
|--------|-------------|----------|
| Option A | Reject the check-in with a 400 Bad Request and return a localized message (e.g., 'Akses lokasi (GPS) diperlukan untuk absensi luring'). | ✓ |
| Option B | Allow the check-in to succeed but record the latitude and longitude as null (unverified location). | |

**User's choice:** Option A.
**Notes:** Location access is strictly required for offline check-ins. Missing coordinates triggers a 400 Bad Request.

---

## Modality Enforcement

| Option | Description | Selected |
|--------|-------------|----------|
| Option A | Enforce GPS validation for any courses of type 'OFFLINE_EVENT' or 'HYBRID'. | ✓ |
| Option B | Enforce GPS validation strictly for 'OFFLINE_EVENT' courses only. | |

**User's choice:** Option A.
**Notes:** Enforces coordinates validation for both OFFLINE_EVENT and HYBRID modalities.

---

## the agent's Discretion
- The implementation of the Haversine distance formula and specific verification logic structure inside `/api/attendance` is left to the agent's discretion.

## Deferred Ideas
- None — discussion stayed within phase scope.
