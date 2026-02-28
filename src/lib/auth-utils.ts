import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export type SessionUser = {
    id: string;
    email: string;
    name: string;
    role: string;
};

/**
 * Get the authenticated user from the session.
 * Returns null if not authenticated.
 */
export async function getServerUser(): Promise<SessionUser | null> {
    const session = await auth();
    if (!session?.user) return null;

    const user = session.user as SessionUser;
    return {
        id: user.id,
        email: user.email ?? "",
        name: user.name ?? "",
        role: user.role ?? "LEARNER",
    };
}

/**
 * Require authentication — returns user or 401 response.
 */
export async function requireAuth() {
    const user = await getServerUser();
    if (!user) {
        return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    return { user, error: null };
}

/**
 * Require specific role(s) — returns user or 403 response.
 */
export async function requireRole(...roles: string[]) {
    const { user, error } = await requireAuth();
    if (error) return { user: null, error };

    if (!roles.includes(user!.role)) {
        return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { user: user!, error: null };
}
