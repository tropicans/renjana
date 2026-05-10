const AUTH_PATH_PREFIXES = ["/login", "/register", "/auth/"];

export function getSafeRedirectPath(value: string | null | undefined, fallback: string) {
    if (!value) return fallback;
    if (!value.startsWith("/")) return fallback;
    if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
    if (value.includes("\\")) return fallback;

    try {
        const url = new URL(value, "http://localhost");
        if (url.origin !== "http://localhost") return fallback;

        const normalizedPath = `${url.pathname}${url.search}${url.hash}`;
        if (AUTH_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
            return fallback;
        }

        return normalizedPath;
    } catch {
        return fallback;
    }
}
