type LogLevel = "debug" | "info" | "warn" | "error";

type Serializable = string | number | boolean | null | Serializable[] | { [key: string]: Serializable };

export type NormalizedError = {
    name: string;
    message: string;
    stack?: string;
};

export type LogRecord = {
    timestamp: string;
    level: LogLevel;
    event: string;
    message: string;
    requestId?: string;
    traceId?: string;
    spanId?: string;
    method?: string;
    path?: string;
    status?: number;
    durationMs?: number;
    userId?: string;
    role?: string;
    error?: NormalizedError;
    metadata?: Record<string, Serializable>;
};

type LogInput = Omit<LogRecord, "timestamp" | "error" | "metadata"> & {
    error?: unknown;
    metadata?: Record<string, unknown>;
};

const REDACTED_KEYS = [
    "authorization",
    "cookie",
    "cookies",
    "password",
    "passwordhash",
    "token",
    "accesstoken",
    "refreshtoken",
    "secret",
    "signature",
    "signaturekey",
    "serverkey",
    "apikey",
    "api_key",
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function shouldRedact(key: string) {
    const normalized = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
    return REDACTED_KEYS.some((candidate) => normalized.includes(candidate));
}

function sanitizeValue(value: unknown): Serializable {
    if (value === null || value === undefined) return null;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
    if (Array.isArray(value)) return value.map((item) => sanitizeValue(item));
    if (value instanceof Date) return value.toISOString();
    if (value instanceof Error) return normalizeError(value);
    if (typeof value === "bigint") return value.toString();
    if (isPlainObject(value)) {
        return Object.fromEntries(
            Object.entries(value).map(([key, nestedValue]) => [
                key,
                shouldRedact(key) ? "[REDACTED]" : sanitizeValue(nestedValue),
            ]),
        );
    }

    return String(value);
}

export function sanitizeMetadata(metadata?: Record<string, unknown>) {
    if (!metadata) return undefined;
    return sanitizeValue(metadata) as Record<string, Serializable>;
}

export function normalizeError(error: unknown): NormalizedError {
    if (error instanceof Error) {
        return {
            name: error.name || "Error",
            message: error.message || "Unknown error",
            stack: error.stack,
        };
    }

    if (typeof error === "string") {
        return {
            name: "Error",
            message: error,
        };
    }

    return {
        name: "Error",
        message: "Unknown error",
        ...(isPlainObject(error) ? { stack: JSON.stringify(sanitizeValue(error)) } : {}),
    };
}

function emit(record: LogRecord) {
    const payload = JSON.stringify(record);

    if (record.level === "error") {
        console.error(payload);
        return;
    }

    if (record.level === "warn") {
        console.warn(payload);
        return;
    }

    console.log(payload);
}

export function log(input: LogInput) {
    emit({
        ...input,
        timestamp: new Date().toISOString(),
        error: input.error ? normalizeError(input.error) : undefined,
        metadata: sanitizeMetadata(input.metadata),
    });
}

export const logger = {
    debug: (input: Omit<LogInput, "level">) => log({ ...input, level: "debug" }),
    info: (input: Omit<LogInput, "level">) => log({ ...input, level: "info" }),
    warn: (input: Omit<LogInput, "level">) => log({ ...input, level: "warn" }),
    error: (input: Omit<LogInput, "level">) => log({ ...input, level: "error" }),
};
