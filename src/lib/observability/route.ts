import { NextResponse } from "next/server";
import { captureError } from "@/lib/observability/error-monitor";
import { logger } from "@/lib/observability/logger";
import { recordHttpRequest } from "@/lib/observability/metrics";
import { applyTracingHeaders, createRequestContext, type RequestContextUser } from "@/lib/observability/request-context";

export type ObservabilityHandlerContext = {
    requestId: string;
    traceId: string;
    spanId: string;
    method: string;
    path: string;
};

export type ObservabilityOptions = {
    event: string;
    user?: RequestContextUser;
    getUser?: () => Promise<RequestContextUser | undefined> | RequestContextUser | undefined;
    metadata?: Record<string, unknown>;
};

export async function withRequestObservability(
    request: Request,
    handler: (context: ObservabilityHandlerContext) => Promise<Response>,
    options: ObservabilityOptions,
) {
    const user = options.user ?? await options.getUser?.();
    const context = createRequestContext(request, user);
    const start = performance.now();

    logger.info({
        event: `${options.event}.start`,
        message: "Request started",
        requestId: context.requestId,
        traceId: context.traceId,
        spanId: context.spanId,
        method: context.method,
        path: context.path,
        userId: context.userId,
        role: context.role,
        metadata: options.metadata,
    });

    try {
        const response = await handler(context);
        const durationMs = Number((performance.now() - start).toFixed(2));
        recordHttpRequest({
            method: context.method,
            path: context.path,
            status: response.status,
            durationMs,
        });

        logger.info({
            event: `${options.event}.complete`,
            message: "Request completed",
            requestId: context.requestId,
            traceId: context.traceId,
            spanId: context.spanId,
            method: context.method,
            path: context.path,
            status: response.status,
            durationMs,
            userId: context.userId,
            role: context.role,
            metadata: options.metadata,
        });

        return applyTracingHeaders(response, context);
    } catch (error) {
        const durationMs = Number((performance.now() - start).toFixed(2));
        recordHttpRequest({
            method: context.method,
            path: context.path,
            status: 500,
            durationMs,
        });

        captureError(error, {
            event: `${options.event}.error`,
            requestId: context.requestId,
            traceId: context.traceId,
            spanId: context.spanId,
            method: context.method,
            path: context.path,
            status: 500,
            userId: context.userId,
            role: context.role,
            metadata: {
                ...options.metadata,
                durationMs,
            },
        });

        return applyTracingHeaders(NextResponse.json({
            error: "Internal server error",
            requestId: context.requestId,
        }, { status: 500 }), context);
    }
}
