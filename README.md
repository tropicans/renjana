# Renjana LMS

**Learning Management System** untuk Justitia Training Center — platform pelatihan hukum profesional.

Built with **Next.js 16**, **Prisma**, **PostgreSQL**, **NextAuth.js**, dan **React Query**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Database | PostgreSQL 16 + Prisma ORM |
| Auth | NextAuth.js v5 (Credentials + JWT) |
| State | React Query (TanStack Query) |
| PDF | jsPDF |
| Styling | Tailwind CSS |
| Deploy | Docker + Docker Compose |

---

## Quick Start (Docker)

```bash
# 1. Clone
git clone https://github.com/tropicans/renjana.git
cd renjana

# 2. Setup environment
cp .env.example .env
# Edit DATABASE_URL and NEXTAUTH_SECRET

# 3. Start containers
docker compose up -d --build

# 4. Seed database (first time)
docker exec -it renjana-lmsapp npx prisma db push
docker exec -it renjana-lmsapp npx prisma db seed

# 5. Open
open http://localhost:3214
```

### Default Users

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `password123` | ADMIN |
| `instructor@example.com` | `password123` | INSTRUCTOR |
| `ahmad@example.com` | `password123` | LEARNER |

---

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# Seed data
npx prisma db seed

# Start dev server
npm run dev
# → http://localhost:3214
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | Application URL |
| `NEXTAUTH_SECRET` | ✅ | JWT signing secret |
| `AUTH_TRUST_HOST` | ✅ | Set `true` for Docker/proxy |
| `NODE_ENV` | — | `development` or `production` |

---

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List published courses |
| GET | `/api/courses/:id` | Course detail with modules |

### Auth Required
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enrollments` | My enrollments |
| POST | `/api/enrollments` | Enroll in course |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| PUT | `/api/progress` | Mark lesson complete |
| GET | `/api/progress/:enrollmentId` | Get progress |
| POST | `/api/attendance` | Check-in (GPS) |
| GET | `/api/attendance` | Attendance records |
| POST | `/api/evidence` | Upload evidence |
| GET | `/api/evidence` | Evidence list |
| GET | `/api/certificates/:enrollmentId` | Generate/get certificate PDF |

### Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users` | Create user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Deactivate user |

---

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   ├── admin/            # Admin dashboard
│   ├── course/[id]/      # Course detail
│   ├── courses/          # Course catalog
│   ├── dashboard/        # Learner dashboard
│   │   ├── checkin/      # Attendance check-in
│   │   ├── evidence/     # Evidence upload
│   │   └── certificates/ # Certificate download
│   ├── instructor/       # Instructor views
│   └── learn/[courseId]/ # Learning interface
├── components/           # React components
├── lib/
│   ├── api.ts           # API client (fetch + types)
│   ├── auth.ts          # NextAuth config
│   ├── auth-utils.ts    # Auth helpers (requireAuth/requireRole)
│   └── db.ts            # Prisma singleton
└── proxy.ts             # Middleware (RBAC)
```

---

## Sprint Reports

| Sprint | Focus | Report |
|--------|-------|--------|
| 1 | Database, Auth, Docker | `docs/sprint1_report.md` |
| 2 | API Routes, React Query | `docs/sprint2_report.md` |
| 3 | Learning Engine | `docs/sprint3_report.md` |
| 4 | Attendance & Evidence | `docs/sprint4_report.md` |
| 5 | Certificate Generator | `docs/sprint5_report.md` |
| 6 | Testing & Go-Live | `docs/sprint6_report.md` |

---

## License

Internal use — Justitia Training Center © 2026
