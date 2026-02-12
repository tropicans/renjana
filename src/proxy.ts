import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type UserRole = "learner" | "admin" | "instructor" | "manager" | "finance";

const SESSION_COOKIE = "renjana_session";

const ROLE_DASHBOARD: Record<UserRole, string> = {
  learner: "/dashboard",
  admin: "/admin",
  instructor: "/instructor",
  manager: "/manager",
  finance: "/finance",
};

function getRequiredRole(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/finance")) return "finance";
  if (pathname.startsWith("/instructor")) return "instructor";
  if (pathname.startsWith("/manager")) return "manager";
  if (pathname.startsWith("/dashboard")) return "learner";
  return null;
}

function parseSessionRole(value: string | undefined): UserRole | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as { role?: string };
    const role = parsed.role;
    if (role === "learner" || role === "admin" || role === "instructor" || role === "manager" || role === "finance") {
      return role;
    }
  } catch {
    return null;
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredRole = getRequiredRole(pathname);

  if (!requiredRole) {
    return NextResponse.next();
  }

  const role = parseSessionRole(request.cookies.get(SESSION_COOKIE)?.value);

  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (role !== requiredRole) {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/finance/:path*", "/instructor/:path*", "/manager/:path*", "/dashboard/:path*"],
};
