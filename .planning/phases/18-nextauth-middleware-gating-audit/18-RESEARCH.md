# Phase 18: NextAuth & Middleware Gating Audit Research Report

## 1. Context & Motivation
During Sprint 1, the global middleware file `src/middleware.ts` was renamed to `src/proxy.ts` because the Next.js production compiler failed when compiling the middleware. In Next.js (including v15/v16), files executing as middleware run on the **Edge Runtime**. The previous middleware code imported `src/lib/auth.ts`, which transitively imported Prisma (`@/lib/db`) and password hashing (`bcryptjs`), both of which rely on Node.js-specific libraries (such as TCP/TLS sockets and crypto wrappers) that are incompatible with the Edge Runtime.

Renaming the file disabled the Next.js global middleware mechanism (since Next.js only recognizes `middleware.ts` in the root or `src/middleware.ts`). As a result, the application's global server-side page-gating was completely bypassed.

To safely restore global server-side gating, we must split the NextAuth configuration into an **Edge-safe configuration module** and a **database-enabled Node.js configuration module**, allowing us to run NextAuth token verification inside the Edge-runtime middleware without compiling database drivers or encryption libraries.

---

## 2. Next.js 16 Edge Compatibility Constraints
Next.js middleware runs on the lightweight V8-based Edge Runtime. The following constraints must be strictly adhered to:
1. **No Node.js Built-ins**: Dependencies relying on Node-specific packages like `dns`, `net`, `tls`, `fs`, `stream`, or `child_process` cannot be imported in the middleware path.
2. **No Prisma Client Database Connectors**: Prisma relies on standard TCP socket connections to PostgreSQL, which will crash the middleware compilation.
3. **No Native/Complex Crypto in Middleware**: Hashing libraries like `bcryptjs` are not supported on Edge.
4. **JWT Verification works on Edge**: NextAuth v5 can run on Edge because JWT session validation only requires standard Web Crypto API signatures using the secret key, avoiding database calls and native modules.

---

## 3. Split Configuration Design Blueprint
To achieve Edge compatibility, the NextAuth setup is split as follows:
- **`src/lib/auth.config.ts` (Edge-Safe)**: Houses the base configuration (JWT callbacks, custom login page routing, session strategy, secret key resolution) but leaves the `providers` array empty.
- **`src/lib/auth.ts` (Node.js/Full-Featured)**: Imports the base configuration from `auth.config.ts`, adds the `Credentials` provider setup (which imports Prisma and bcryptjs), and exports the final API route handlers and `auth` helper.
- **`src/proxy.ts` (Edge-Safe Gating Logic)**: Imports `auth` from `src/lib/auth.config.ts` rather than `src/lib/auth.ts`.
- **`src/middleware.ts` (Edge Entrypoint)**: Imports and exports the middleware handler and matcher config from `src/proxy.ts`.

```
                  ┌───────────────────────┐
                  │   src/middleware.ts   │
                  └───────────┬───────────┘
                              │ (imports)
                  ┌───────────▼───────────┐
                  │     src/proxy.ts      │
                  └───────────┬───────────┘
                              │ (imports Edge-safe auth)
               ┌──────────────▼──────────────┐
               │    src/lib/auth.config.ts   │
               └──────────────┬──────────────┘
                              │ (extended & merged by)
               ┌──────────────▼──────────────┐
               │       src/lib/auth.ts       │
               └──────────────┬──────────────┘
                              │ (called by Server / APIs)
      ┌───────────────────────┴───────────────────────┐
      ▼                                               ▼
src/lib/auth-utils.ts                 src/app/api/auth/[...nextauth]/route.ts
(Node.js server context)              (Node.js credentials flow controller)
```

---

## 4. Blueprints for Files

### File 1: `src/lib/auth.config.ts`
*Create this new file as the Edge-safe foundation.*

```typescript
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";

export const authConfig = {
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as unknown as { role: string }).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as unknown as { role: string }).role = token.role as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    providers: [], // Empty array - Credentials provider is added in auth.ts
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
} satisfies NextAuthConfig;

export const { auth } = NextAuth(authConfig);
```

---

### File 2: `src/lib/auth.ts`
*Refactor this existing file to extend `auth.config.ts` and declare the Credentials provider.*

```typescript
import { buildRateLimitKey, enforceRateLimit, getRateLimitIp } from "@/lib/rate-limit";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, request) {
                const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
                const password = typeof credentials?.password === "string" ? credentials.password : "";

                const rateLimitResponse = enforceRateLimit({
                    key: buildRateLimitKey(["auth-login", getRateLimitIp(request), email]),
                    limit: 5,
                    windowMs: 15 * 60 * 1000,
                    message: "Too many login attempts. Please try again later.",
                });
                if (rateLimitResponse) {
                    throw new Error("RATE_LIMITED");
                }

                if (!email || !password) return null;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.isActive) return null;

                const isValid = await bcrypt.compare(
                    password,
                    user.passwordHash
                );

                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.fullName,
                    role: user.role,
                    image: user.avatarUrl,
                };
            },
        }),
    ],
});
```

---

### File 3: `src/proxy.ts`
*Refactor the import statement at line 1 to target the new Edge-safe `auth` helper.*

```typescript
import { auth } from "@/lib/auth.config"; // <-- Changed from '@/lib/auth'
import { NextResponse } from "next/server";
import { getDashboardUrl, type UserRole } from "@/lib/dashboard-routing";

// Routes that are always public (no auth needed)
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/auth/redirect", "/events", "/courses", "/course", "/about-us", "/contact", "/career", "/news", "/news-and-publications", "/privacy", "/terms"];

// Route prefix → required role(s)
const ROLE_ROUTES: Record<string, string[]> = {
    "/admin": ["ADMIN"],
    "/instructor": ["INSTRUCTOR", "ADMIN"],
    "/manager": ["MANAGER", "ADMIN"],
    "/finance": ["FINANCE", "ADMIN"],
    "/dashboard": ["LEARNER"],
    "/my-registrations": ["LEARNER"],
};

export const proxy = auth((req) => {
    const { pathname } = req.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
        return NextResponse.next();
    }

    // Allow API routes (handled by NextAuth and other API handlers)
    if (pathname.startsWith("/api/")) {
        return NextResponse.next();
    }

    // Not logged in → redirect to login
    if (!req.auth) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    const userRole = (req.auth.user as { role?: string })?.role ?? "";
    for (const [prefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
        if (pathname.startsWith(prefix)) {
            if (!allowedRoles.includes(userRole)) {
                // Redirect unauthorized users back to their corresponding portal dashboard
                const fallback = getDashboardUrl(userRole as UserRole);
                return NextResponse.redirect(new URL(fallback, req.url));
            }
            break;
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
```

---

### File 4: `src/middleware.ts`
*Create this new file to activate global middleware.*

```typescript
import { proxy } from "./proxy";
export default proxy;
export { config } from "./proxy";
```

---

## 5. Review of Downstream Files
1. **`src/lib/auth-utils.ts`**: Safely continues to import `auth` from `@/lib/auth`. Because it only runs in Server Components and API route handlers (which execute in Node.js), it does not compile into the Edge Runtime bundle and is fully secure.
2. **`src/lib/route-policy.ts`**: Safely continues to import `requireAuth` / `requireRole` from `auth-utils.ts` since it is also exclusively executed inside Node.js API handlers.
3. **`src/app/api/auth/[...nextauth]/route.ts`**: Safely continues to use `handlers` from `@/lib/auth`. The registration POST and rate limiter functions are unaffected.

---

## 6. Gating Policy Details & Fallbacks
- **Public Routes Bypassed**: Public routing (e.g. course catalogs, news, contacts, static marketing pages) bypasses authentication check entirely.
- **API Protection Policy**: Gating for `/api/**` is enforced locally within individual routes using policy helpers like `requireApiAuthPolicy`. Leaving `/api/**` out of global middleware gating avoids potential Edge compile conflicts and complex exception mappings (such as webhooks or public registration APIs).
- **Unauthorized Role Gating Redirects**: If an authenticated user attempts to load a route prefix that does not match their permissions (e.g., a `LEARNER` requesting `/admin`), the middleware automatically redirects them to their correct home portal utilizing the edge-safe `getDashboardUrl` helper.

---

## 7. Landmines & Hazards to Avoid
1. **Avoid Circular Imports**: Ensure `auth.config.ts` never imports anything from `auth.ts` or any module that depends on `prisma` or `bcryptjs`.
2. **Missing `secret` in Config**: NextAuth v5 behaves strictly about secrets. In environments where `AUTH_SECRET` is not set but `NEXTAUTH_SECRET` is present, NextAuth might fail to boot. Explicitly defining `secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET` ensures local testing remains seamless without database or env alterations.
3. **Loss of Session Properties**: During refactoring, ensure that callbacks in `auth.config.ts` exactly match the session extensions (mapping `id` and `role`) from `auth.ts`, as any deviation will cause page access and API authorizations to fail.

---

## 8. Verification Strategy
1. **Local Development Compilation**: Verify middleware runs correctly without Edge compiler warnings.
2. **Vitest Suite Execution**: Run existing tests (`npm run test`) to confirm no regressions are introduced in route policy, role routing, or user routing.
3. **Webpack/Next.js Build Check**: Run `npm run build` to confirm Next.js compiles all routes and middleware successfully into standalone outputs without Edge errors.
4. **Docker Stack Verification**: Build and run the docker container locally (`docker compose up -d --build`) to verify runtime startup.
5. **Manual Acceptance Verification**: Attempt to visit protected pages `/admin` or `/dashboard` as an unauthenticated user to confirm redirection to `/login`, and attempt to visit mismatching portal pages (e.g., `/admin` as a learner) to confirm redirection to the correct portal dashboard.
