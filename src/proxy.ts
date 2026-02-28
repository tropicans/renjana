import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Routes that are always public (no auth needed)
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password"];

// Route prefix → required role(s)
const ROLE_ROUTES: Record<string, string[]> = {
    "/admin": ["ADMIN"],
    "/instructor": ["INSTRUCTOR", "ADMIN"],
    "/manager": ["MANAGER", "ADMIN"],
    "/finance": ["FINANCE", "ADMIN"],
    "/dashboard": ["LEARNER", "INSTRUCTOR", "MANAGER", "FINANCE", "ADMIN"],
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
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    const userRole = (req.auth.user as { role?: string })?.role ?? "";
    for (const [prefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
        if (pathname.startsWith(prefix)) {
            if (!allowedRoles.includes(userRole)) {
                // Redirect to their own dashboard
                const fallback = userRole === "ADMIN" ? "/admin"
                    : userRole === "INSTRUCTOR" ? "/instructor"
                        : userRole === "MANAGER" ? "/manager"
                            : userRole === "FINANCE" ? "/finance"
                                : "/dashboard";
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
