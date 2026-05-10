import { logger, normalizeError, type NormalizedError } from "@/lib/observability/logger";
import { recordAppError } from "@/lib/observability/metrics";

const MAX_ERRORS = 100;

export type ErrorContext = {
    event: string;
    requestId?: string;
    traceId?: string;
    spanId?: string;
    method?: string;
    path?: string;
    status?: number;
    userId?: string;
    role?: string;
    metadata?: Record<string, unknown>;
};

export type CapturedError = ErrorContext & {
    timestamp: string;
    error: NormalizedError;
};

const errors: CapturedError[] = [];

export function captureError(error: unknown, context: ErrorContext) {
    const captured: CapturedError = {
        ...context,
        timestamp: new Date().toISOString(),
        error: normalizeError(error),
    };

    errors.unshift(captured);
    if (errors.length > MAX_ERRORS) {
        errors.length = MAX_ERRORS;
    }

    recordAppError({ event: context.event, path: context.path, status: context.status });
    logger.error({
        event: context.event,
        message: captured.error.message,
        requestId: context.requestId,
        traceId: context.traceId,
        spanId: context.spanId,
        method: context.method,
        path: context.path,
        status: context.status,
        userId: context.userId,
        role: context.role,
        error,
        metadata: context.metadata,
    });

    return captured;
}

export function getRecentErrors(limit = MAX_ERRORS) {
    return errors.slice(0, limit);
}

export function resetRecentErrors() {
    errors.length = 0;
}
