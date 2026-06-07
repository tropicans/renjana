<!-- generated-by: gsd-doc-writer -->
# Getting Started

Follow this guide to get Renjana LMS up and running on your local machine.

## Prerequisites

Before setting up the project, make sure you have the following installed:

- **Node.js**: Version `>= 20.0.0` (LTS is recommended)
- **npm**: Version `>= 10.0.0`
- **Docker & Docker Compose**: Required for running the database stack locally (PostgreSQL + Adminer)
- **Git**: For version control

## Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/tropicans/renjana.git
   cd renjana
   ```
   <!-- VERIFY: git repository remote URL -->

2. **Configure Environment Variables**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file in your editor and customize keys if necessary. For local development outside Docker, adjust `DATABASE_URL` to point to `localhost`.

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Generate the Prisma Database Client**:
   ```bash
   npx prisma generate
   ```

## First Run

You can run the application either locally (using Node.js and a local Docker database) or fully inside Docker.

### Option A: Local Dev Server (Recommended)

1. **Start the Database Stack**:
   Start PostgreSQL and Adminer in the background:
   ```bash
   docker compose up -d postgres adminer
   ```
2. **Push Prisma Schema & Seed Data**:
   Synchronize the database schema and populate initial mock users and courses:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be running at [http://localhost:3214](http://localhost:3214). <!-- VERIFY: App port is 3214 -->

### Option B: Run via Docker Compose

To launch the entire stack (app server, database, Adminer UI) in containers:

1. **Build and Up Containers**:
   ```bash
   docker compose up -d --build
   ```
2. **Initialize Database** (First-time run only):
   Apply schema and seed mock data within the running application container:
   ```bash
   docker exec -it renjana-lmsapp npx prisma db push
   docker exec -it renjana-lmsapp npm run db:seed
   ```
   Access the app at [http://localhost:3214](http://localhost:3214). <!-- VERIFY: App port is 3214 -->

### Default Seed Credentials

After seeding, you can log in using these default credentials:

| Email | Password | Role |
|-------|----------|------|
| `admin@renjana.com` | `admin123` | `ADMIN` |
| `budi@example.com` | `password123` | `INSTRUCTOR` |
| `ahmad@example.com` | `password123` | `LEARNER` |
| `diana@example.com` | `password123` | `MANAGER` |
| `eko@example.com` | `password123` | `FINANCE` |

## Common Setup Issues

- **Database Connection Failure**:
  If the application fails to start with a database connection error:
  - Make sure the postgres container is running: `docker compose ps`
  - Check `DATABASE_URL` in `.env`. If running the app outside Docker, use `localhost` as the database host. If running inside Docker, use `postgres` as the hostname.
- **Port 3214 or 25432 in Use**:
  If the local port is occupied, you can change the dev port in `package.json` (`next dev --port <PORT>`) or adjust the mapped ports in `docker-compose.yml` for PostgreSQL.
- **NextAuth Session Failures**:
  Ensure you have configured a non-empty `NEXTAUTH_SECRET` in `.env`.

## Next Steps

To learn more about development workflows, testing, and deployment:

- **[Development Guide](DEVELOPMENT.md)**: Details local scripts, code style configurations, and directory structure.
- **[Testing Guide](TESTING.md)**: Explains how to run and write Vitest suites.
- **[Configuration Guide](CONFIGURATION.md)**: A complete reference of environment variables.
