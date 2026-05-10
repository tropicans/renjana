import { NextResponse } from "next/server";

function getConfiguredOrigins() {
    const origins = new Set<string>();

    const nextAuthUrl = process.env.NEXTAUTH_URL;
    if (nextAuthUrl) {
        try {
            origins.add(new URL(nextAuthUrl).origin);
        } catch {
            // Ignore invalid env config here; request fallback still applies.
        }
    }

    return origins;
}

function getRequestOrigin(request: Request) {
    const requestUrl = new URL(request.url);
    return requestUrl.origin;
}

function normalizeOriginHeader(value: string | null) {
    if (!value) return null;

    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
}

export function assertSameOrigin(request: Request) {
    const allowedOrigins = getConfiguredOrigins();
    allowedOrigins.add(getRequestOrigin(request));

    const originHeader = normalizeOriginHeader(request.headers.get("origin"));
    const refererHeader = normalizeOriginHeader(request.headers.get("referer"));
    const candidateOrigin = originHeader || refererHeader;

    if (!candidateOrigin) {
        return NextResponse.json({ error: "Missing origin header" }, { status: 403 });
    }

    if (!allowedOrigins.has(candidateOrigin)) {
        return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
    }

    return null;
}
