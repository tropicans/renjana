import crypto from "node:crypto";

export type RequestContextUser = {
    id?: string;
    role?: string;
};

export type RequestContext = {
    requestId: string;
    traceId: string;
    spanId: string;
    method: string;
    path: string;
    userId?: string;
    role?: string;
};

const TRACEPARENT_VERSION = "00";
const TRACE_FLAGS = "01";
const TRACEPARENT_REGEX = /^([\da-f]{2})-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})$/i;

function randomHex(bytes: number) {
    return crypto.randomBytes(bytes).toString("hex");
}

function validHex(value: string | undefined, length: number) {
    return Boolean(value && new RegExp(`^[\\da-f]{${length}}$`, "i").test(value));
}

export function parseTraceparent(traceparent: string | null) {
    if (!traceparent) return null;

    const match = TRACEPARENT_REGEX.exec(traceparent.trim());
    if (!match) return null;

    const [, version, traceId, spanId, flags] = match;
    if (traceId === "00000000000000000000000000000000" || spanId === "0000000000000000") {
        return null;
    }

    return { version, traceId, spanId, flags };
}

export function createRequestContext(request: Request, user?: RequestContextUser): RequestContext {
    const requestIdHeader = request.headers.get("x-request-id")?.trim();
    const parsedTraceparent = parseTraceparent(request.headers.get("traceparent"));
    const url = new URL(request.url);

    return {
        requestId: requestIdHeader || crypto.randomUUID(),
        traceId: parsedTraceparent?.traceId ?? randomHex(16),
        spanId: validHex(parsedTraceparent?.spanId, 16) ? parsedTraceparent!.spanId : randomHex(8),
        method: request.method,
        path: url.pathname,
        userId: user?.id,
        role: user?.role,
    };
}

export function buildTraceparent(context: Pick<RequestContext, "traceId" | "spanId">) {
    return `${TRACEPARENT_VERSION}-${context.traceId}-${context.spanId}-${TRACE_FLAGS}`;
}

export function buildTracingHeaders(context: Pick<RequestContext, "requestId" | "traceId" | "spanId">) {
    return {
        "x-request-id": context.requestId,
        traceparent: buildTraceparent(context),
    };
}

export function applyTracingHeaders(response: Response, context: Pick<RequestContext, "requestId" | "traceId" | "spanId">) {
    const headers = buildTracingHeaders(context);
    for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
    }

    return response;
}
