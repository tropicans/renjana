<!-- generated-by: gsd-doc-writer -->
# API Reference Guide

This document describes the API endpoints, request/response payloads, and security mechanisms for Renjana LMS.

## Authentication

Authentication for all protected routes is managed via **NextAuth.js** cookie-based sessions.

- **Session cookie**: NextAuth stores session tokens in secure HTTP-only cookies (`next-auth.session-token`).
- **CSRF / Origin Check**: To prevent cross-site request forgery, all state-mutating requests (`POST`, `PUT`, `DELETE`) are gated by an origin check. The request MUST contain an `Origin` header matching the hostname configured in the server's `NEXTAUTH_URL`.
- **API Gating**: Route handlers enforce policies declaratively using `requireApiAuthPolicy(...)` from `src/lib/route-policy.ts`.

## Formats & Errors

### Request Format
All requests sending data must use the `application/json` content-type header and a valid JSON body (unless uploading files, which use `multipart/form-data`).

### Error Response Envelope
On failure, the API returns a JSON object containing a clear `error` message string:
```json
{
  "error": "Reason for error"
}
```
Common status codes:
- `400 Bad Request` — Missing or invalid request payload parameters.
- `401 Unauthorized` — Active NextAuth session cookie is missing or expired.
- `403 Forbidden` — The authenticated user lacks the role required to access the route, or the request `Origin` header is missing.
- `404 Not Found` — The requested entity does not exist, or the route is disabled in production (e.g. `/api/metrics`).
- `429 Too Many Requests` — Rate limit exceeded.

## Rate Limiting

Sensitive endpoints (like registration and login) enforce rate limiting via `requireApiAuthPolicy` using a sliding window sliding key:
- **Default rate limit**: Enforced per IP address and authenticated user ID.
- **Payload response**: Returns HTTP `429 Too Many Requests` on exceeding limit.

---

## Endpoint Reference

### 1. Public Endpoints
No authentication is required for these endpoints.

#### `GET /api/courses`
Lists all published courses.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "course-uuid",
      "title": "Introduction to Business Law",
      "description": "Course description text...",
      "thumbnail": "/uploads/thumb.png",
      "type": "ONLINE"
    }
  ]
  ```

#### `GET /api/courses/[id]`
Retrieves course details, including its modules and lessons.

#### `GET /api/events`
Lists all training events in the catalog.

#### `GET /api/health`
Returns database and server connectivity status.

---

### 2. Learner Endpoints
Requires NextAuth session with `LEARNER` role.

#### `GET /api/enrollments`
Retrieves courses the learner is currently enrolled in.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": "enrollment-uuid",
      "courseId": "course-uuid",
      "status": "ACTIVE",
      "completionPercentage": 45.5,
      "course": {
        "title": "Business Law"
      }
    }
  ]
  ```

#### `POST /api/enrollments`
Enrolls the learner in a public course.
- **Request Body**:
  ```json
  {
    "courseId": "course-uuid"
  }
  ```

#### `PUT /api/progress`
Marks a specific lesson as completed.
- **Request Body**:
  ```json
  {
    "lessonId": "lesson-uuid",
    "completed": true
  }
  ```

#### `POST /api/quizzes/[courseId]/[quizId]/submit`
Submits answers for a quiz attempt and returns the calculated score.
- **Request Body**:
  ```json
  {
    "answers": {
      "question-1-id": "selected-option-index"
    }
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "attemptId": "attempt-uuid",
    "score": 85.0,
    "passed": true
  }
  ```

#### `POST /api/attendance`
Submits GPS check-in attendance for a classroom session.
- **Request Body**:
  ```json
  {
    "lessonId": "lesson-uuid",
    "latitude": -6.2088,
    "longitude": 106.8456
  }
  ```

#### `POST /api/evidence`
Uploads course module document evidence (e.g. assignments/proof).
- **Request Type**: `multipart/form-data`
- **Request Fields**:
  - `moduleId`: Module UUID.
  - `file`: PDF, image, or ZIP file evidence (max size verified by upload security).

---

### 3. Instructor Endpoints
Requires NextAuth session with `INSTRUCTOR` role.

#### `GET /api/instructor/evidence`
Lists evidence submissions that the instructor is authorized to grade (restricted by class groups).

#### `POST /api/instructor/evidence/[id]/grade`
Grades a student's evidence submission.
- **Request Body**:
  ```json
  {
    "status": "APPROVED", // or "REJECTED"
    "feedback": "Great work on the legal draft analysis."
  }
  ```

---

### 4. Finance Endpoints
Requires NextAuth session with `FINANCE` role.

#### `GET /api/finance/registrations`
Lists submitted course registrations awaiting payment invoice review.

#### `POST /api/finance/registrations/[id]/review`
Approves or rejects a learner's registration payment proof.
- **Request Body**:
  ```json
  {
    "status": "APPROVED", // or "REJECTED" / "REVISION_REQUIRED"
    "feedback": "Payment verified successfully."
  }
  ```

---

### 5. Admin Endpoints
Requires NextAuth session with `ADMIN` role.

#### `GET /api/admin/users`
Lists all registered users in the platform.

#### `POST /api/admin/users`
Creates a new user profile manually.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword123",
    "fullName": "John Doe",
    "role": "LEARNER" // or "INSTRUCTOR", "FINANCE", "MANAGER", "ADMIN"
  }
  ```

#### `GET /api/metrics`
Collects Prometheus metrics for server health.
- **Authentication**: Bearer Token required via `METRICS_TOKEN` header. <!-- VERIFY: metrics endpoint path -->
