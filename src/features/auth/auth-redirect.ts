import { getSafeRedirectPath } from "@/lib/redirect-security";

const ROLE_DASHBOARD: Record<string, string> = {
    ADMIN: "/admin",
    INSTRUCTOR: "/instructor",
    MANAGER: "/manager",
    FINANCE: "/finance",
    LEARNER: "/dashboard",
};

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function resolveSessionRedirectPath(input: {
    requestedPath: string | null | undefined;
    fallbackPath?: string;
}) {
    const redirectUrl = getSafeRedirectPath(input.requestedPath, input.fallbackPath || "/auth/redirect");

    let dashboardUrl: string | null = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
        const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await sessionRes.json().catch(() => null);
        const role = (session?.user?.role as string | undefined) ?? null;
        if (role) {
            dashboardUrl = ROLE_DASHBOARD[role] ?? "/dashboard";
            break;
        }
        await wait(250);
    }

    return getSafeRedirectPath(redirectUrl || dashboardUrl, "/auth/redirect");
}
