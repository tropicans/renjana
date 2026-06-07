<!-- generated-by: gsd-doc-writer -->
# Deployment Guide

This document describes how to build, deploy, rollback, and monitor the Renjana LMS application across various platforms.

## Deployment Targets

The platform can be deployed to the following target hosting environments:

- **Railway (Recommended)**: Automatically detects the `Dockerfile` and deploys the application container. Connect your repository to Railway, configure environment variables, and map the port.
- **DigitalOcean App Platform**: Deploy as a Web Service sourced from the `Dockerfile` exposing port `3214` (mapped to `3000` or custom port if necessary). <!-- VERIFY: DigitalOcean app platform default port mapping -->
- **VPS Manual Deployment**: Run the Docker Compose stack manually on a VPS (Ubuntu/Debian) behind an Nginx reverse proxy using Cloudflare Tunnels or SSL certs.
- **Vercel**: Can be deployed natively for Next.js hosting. Note that file uploads and SQLite/Prisma operations require a persistent relational database connection (PostgreSQL) set via environment variables.

## Build Pipeline

The application is built inside a multi-stage `Dockerfile`:

1. **deps Stage**: Installs the complete node dependency tree from `package-lock.json` via `npm ci`.
2. **builder Stage**: Traces imports, runs `npx prisma generate` to construct database types, and executes `npm run build` to compile the Next.js standalone folder.
3. **runner Stage**: Builds a lightweight production runner container using `node:20-alpine`, copying only standalone build files, static assets, and Prisma clients. Runs under a non-root `nextjs` user for container security.

On startup, the container triggers `docker-entrypoint.sh` which executes `prisma migrate deploy` to deploy schema updates before starting the Node server via `node server.js`.

## Environment Setup

To deploy the application in a production environment, configure the following variables on your hosting provider:

- `DATABASE_URL`: Production PostgreSQL database connection string.
- `NEXTAUTH_SECRET`: Random long string for session security.
- `NEXTAUTH_URL`: Canonical public URL of your platform.
- `AUTH_TRUST_HOST`: Set to `true` when running behind a proxy or inside Docker.
- `NEXT_PUBLIC_PAYMENT_PROVIDER`: Set to `MIDTRANS` to enable payments.
- `MIDTRANS_SERVER_KEY`: Server secret token for Midtrans webhook authorization.
- `METRICS_TOKEN`: Secure API token for metrics scraping.

Refer to [Configuration Guide](CONFIGURATION.md) for the full parameter specifications.

## Rollback Procedure

If a release introduces a blocker, proceed with these rollback steps:

### VPS Docker Rollback
1. Checkout the previous stable Git commit tag on the server:
   ```bash
   git checkout <previous-working-tag-or-commit>
   ```
2. Rebuild and restart the container services in background:
   ```bash
   docker compose up -d --build
   ```

### PaaS Dashboard Rollback
1. Open your hosting provider dashboard (Railway / DigitalOcean).
2. Locate the deployment history logs.
3. Select the last stable version and click **Rollback** or **Redeploy**.

### Database Rollback
1. If a migration needs to be reverted, restore the PostgreSQL database to a backup snapshot captured prior to the deployment.

## Monitoring

- **Docker Logging**: Retrieve standard output and error logs:
  ```bash
  docker compose logs -f lmsapp
  ```
- **Prometheus Metrics**: Scrape application performance, HTTP requests, database latencies, and route errors from the `/api/metrics` endpoint (secured via `METRICS_TOKEN` header check).
- **HTTP Health Probe**: Set up load balancer health checks to query `/api/health`.
