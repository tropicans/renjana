<!-- generated-by: gsd-doc-writer -->
# Configuration Guide

This document describes the environment variables and configurations used by Renjana LMS to run in different environments.

## Environment Variables

The application is configured primarily through environment variables. In local development, these can be set in a `.env` file at the project root.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection URL. E.g. `postgresql://renjana:renjana_dev@postgres:5432/renjana_db` |
| `NEXTAUTH_SECRET` | **Yes** | — | Secret key used by NextAuth.js to encrypt JWT session tokens. Can be generated using `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | **Yes** | `http://localhost:3214` | The base URL where the application is hosted. Used for auth redirects and verifying request origins. <!-- VERIFY: NextAuth default host port is 3214 --> |
| `AUTH_TRUST_HOST` | **Yes** (Docker/Proxy) | — | Must be set to `true` when running behind a reverse proxy or inside Docker containers. |
| `NODE_ENV` | No | `production` | Deployment mode. Supported values: `development`, `production`, `test`. |
| `NEXT_PUBLIC_PAYMENT_PROVIDER` | No | — | Enable payment processing. Supported value: `MIDTRANS`. If not set, payment processing flows are mocked or disabled. |
| `MIDTRANS_SERVER_KEY` | No (Yes if Midtrans active) | — | Midtrans API Server Key used to authenticate server-to-server operations and webhooks. |
| `MIDTRANS_CLIENT_KEY` | No | — | Midtrans Client Key for client-side transaction token generation. |
| `MIDTRANS_API_BASE_URL` | No | `https://app.sandbox.midtrans.com` | Base URL for the Midtrans Snap API. <!-- VERIFY: Midtrans sandbox snap API url is correct --> |
| `MIDTRANS_CORE_API_BASE_URL` | No | `https://api.sandbox.midtrans.com` | Base URL for the Midtrans Core API. <!-- VERIFY: Midtrans sandbox core API url is correct --> |
| `METRICS_TOKEN` | No | — | Secure token for authorizing Prometheus metrics collection at `/api/metrics`. If set, client must provide `Authorization: Bearer <token>`. |

## Configuration Files

The project contains several configuration files in the root directory:

- **`next.config.ts`**: Contains Next.js build-time configurations, including standalone output mode setting, Turbopack settings, and image loader rules.
- **`tsconfig.json`**: Configures TypeScript compiler options, compiler target, strict type safety, and path alias mapping (`@/*` to `src/*`).
- **`eslint.config.mjs`**: Specifies ESLint rules using the flat configuration format, utilizing `next/core-web-vitals` rules.
- **`postcss.config.mjs`**: Configures PostCSS preprocessor with Tailwind CSS.
- **`components.json`**: Configures component path structures and aliases used by the component primitives library.
- **`docker-compose.yml`**: Defines the Docker services (app container, PostgreSQL database, and Adminer web database manager) for production or dev stack execution.

## Defaults and Validation

- **Database Logs**: Database query logs are written in `development` mode only. In `production` mode, only `error` level logs are outputted (`src/lib/db.ts`).
- **Metrics Gating**: In production, if `METRICS_TOKEN` is unset, `/api/metrics` returns a `404 Not Found` response to prevent data exposure. In non-production environments, it allows public access if no token is set.
- **Payment API Fallbacks**: Midtrans Snap and Core API URLs fall back to sandbox URLs (`https://app.sandbox.midtrans.com` and `https://api.sandbox.midtrans.com` respectively) if corresponding env vars are omitted (`src/lib/payment.ts`).

## Per-Environment Overrides

- **Local Development**: Copy `.env.example` to `.env` and set `NODE_ENV=development`. Ensure `DATABASE_URL` points to `localhost` port `25432` if database container is run locally but application is executed outside Docker.
- **Production (Docker)**: Copy `.env.production` values to `.env`. Ensure `DATABASE_URL` uses `postgres` as the hostname to communicate over the internal Docker network. Set `AUTH_TRUST_HOST=true`.
