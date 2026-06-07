<!-- generated-by: gsd-doc-writer -->
# Renjana LMS

A multi-role Learning Management System (LMS) designed for Justitia Training Center to manage legal professional training programs.

## Installation

Ensure you have Node.js and Docker installed.

```bash
# Clone the repository
git clone https://github.com/tropicans/renjana.git
cd renjana
# Install dependencies
npm install
# Generate database client
npx prisma generate
```
<!-- VERIFY: git repository remote URL -->

## Quick Start

1. **Start Database Services**:
   ```bash
   docker compose up -d postgres adminer
   ```
2. **Apply DB Schema & Seed Mock Data**:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
3. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3214](http://localhost:3214) to view the portal. <!-- VERIFY: App port is 3214 -->

## Default Users

Log in using these seeded credentials for various roles:
- **Admin**: `admin@renjana.com` / `admin123`
- **Instructor**: `budi@example.com` / `password123`
- **Learner**: `ahmad@example.com` / `password123`
- **Manager**: `diana@example.com` / `password123`
- **Finance**: `eko@example.com` / `password123`

## Usage Examples

Here are the main workflows in the platform:

### 1. Course Registration & Payment Review
1. A learner registers for a hybrid course at `/courses` and uploads document evidence (KTP, diploma).
2. The learner submits proof of payment invoice.
3. Finance reviews the invoice at `/finance` and verifies the registration status.
4. The admin assigns the learner to a Class Group.

### 2. Interactive Learning & Progress
1. The learner views lessons, plays video materials, and marks lessons complete via `/learn/[courseId]`.
2. Progress percentage updates in real-time.
3. The learner completes quizzes, submits lesson attendance check-ins, and uploads module evidence.

### 3. Grading & Certificate Issuance
1. The instructor logs into `/instructor` to review the learner's evidence uploads.
2. The instructor approves and grades the submissions.
3. Upon 100% course progress completion, the platform automatically generates a landscape A4 PDF certificate downloadable at `/dashboard/certificates`.

## License

Internal use — Justitia Training Center © 2026
