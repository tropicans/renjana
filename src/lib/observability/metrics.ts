type RequestMetricInput = {
    method: string;
    path: string;
    status: number;
    durationMs: number;
};

type ErrorMetricInput = {
    event: string;
    path?: string;
    status?: number;
};

type DurationAggregate = {
    count: number;
    sum: number;
    min: number;
    max: number;
    buckets: Record<string, number>;
};

const HTTP_DURATION_BUCKETS = [50, 100, 250, 500, 1000, 2500, 5000];
const PROCESS_START = Date.now();

const counters = {
    httpRequests: new Map<string, number>(),
    httpErrors: new Map<string, number>(),
    appErrors: new Map<string, number>(),
};

const durations = new Map<string, DurationAggregate>();

function buildKey(parts: Array<string | number>) {
    return parts.join("|");
}

function incrementCounter(store: Map<string, number>, key: string) {
    store.set(key, (store.get(key) ?? 0) + 1);
}

function getBucketLabel(value: number) {
    for (const bucket of HTTP_DURATION_BUCKETS) {
        if (value <= bucket) return String(bucket);
    }

    return "+Inf";
}

function getDurationAggregate(key: string) {
    let aggregate = durations.get(key);
    if (!aggregate) {
        aggregate = {
            count: 0,
            sum: 0,
            min: Number.POSITIVE_INFINITY,
            max: 0,
            buckets: Object.fromEntries(HTTP_DURATION_BUCKETS.map((bucket) => [String(bucket), 0])),
        };
        aggregate.buckets["+Inf"] = 0;
        durations.set(key, aggregate);
    }

    return aggregate;
}

export function recordHttpRequest(input: RequestMetricInput) {
    const roundedDuration = Number(input.durationMs.toFixed(2));
    incrementCounter(counters.httpRequests, buildKey([input.method, input.path, input.status]));

    const durationKey = buildKey([input.method, input.path]);
    const aggregate = getDurationAggregate(durationKey);
    aggregate.count += 1;
    aggregate.sum += roundedDuration;
    aggregate.min = Math.min(aggregate.min, roundedDuration);
    aggregate.max = Math.max(aggregate.max, roundedDuration);
    aggregate.buckets[getBucketLabel(roundedDuration)] += 1;

    if (input.status >= 500) {
        incrementCounter(counters.httpErrors, buildKey([input.path, input.status]));
    }
}

export function recordAppError(input: ErrorMetricInput) {
    incrementCounter(counters.appErrors, input.event);
}

export function getMetricsSnapshot() {
    const memory = process.memoryUsage();

    return {
        httpRequests: Array.from(counters.httpRequests.entries()),
        httpErrors: Array.from(counters.httpErrors.entries()),
        appErrors: Array.from(counters.appErrors.entries()),
        durations: Array.from(durations.entries()),
        process: {
            uptimeSeconds: Math.floor((Date.now() - PROCESS_START) / 1000),
            memoryRssBytes: memory.rss,
            memoryHeapUsedBytes: memory.heapUsed,
        },
    };
}

function renderLabels(labels: Record<string, string | number>) {
    const entries = Object.entries(labels);
    if (entries.length === 0) return "";

    return `{${entries.map(([key, value]) => `${key}="${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(",")}}`;
}

export function renderPrometheusMetrics() {
    const snapshot = getMetricsSnapshot();
    const lines: string[] = [];

    lines.push("# HELP http_requests_total Total HTTP requests observed");
    lines.push("# TYPE http_requests_total counter");
    for (const [key, count] of snapshot.httpRequests) {
        const [method, path, status] = key.split("|");
        lines.push(`http_requests_total${renderLabels({ method, path, status })} ${count}`);
    }

    lines.push("# HELP http_errors_total Total HTTP error responses observed");
    lines.push("# TYPE http_errors_total counter");
    for (const [key, count] of snapshot.httpErrors) {
        const [path, status] = key.split("|");
        lines.push(`http_errors_total${renderLabels({ path, status })} ${count}`);
    }

    lines.push("# HELP app_errors_total Total application errors captured");
    lines.push("# TYPE app_errors_total counter");
    for (const [event, count] of snapshot.appErrors) {
        lines.push(`app_errors_total${renderLabels({ event })} ${count}`);
    }

    lines.push("# HELP http_request_duration_ms HTTP request duration summary in milliseconds");
    lines.push("# TYPE http_request_duration_ms summary");
    for (const [key, aggregate] of snapshot.durations) {
        const [method, path] = key.split("|");
        const baseLabels = { method, path };
        for (const [bucket, count] of Object.entries(aggregate.buckets)) {
            lines.push(`http_request_duration_ms_bucket${renderLabels({ ...baseLabels, le: bucket })} ${count}`);
        }
        lines.push(`http_request_duration_ms_count${renderLabels(baseLabels)} ${aggregate.count}`);
        lines.push(`http_request_duration_ms_sum${renderLabels(baseLabels)} ${aggregate.sum}`);
        lines.push(`http_request_duration_ms_min${renderLabels(baseLabels)} ${aggregate.min === Number.POSITIVE_INFINITY ? 0 : aggregate.min}`);
        lines.push(`http_request_duration_ms_max${renderLabels(baseLabels)} ${aggregate.max}`);
    }

    lines.push("# HELP process_uptime_seconds Process uptime in seconds");
    lines.push("# TYPE process_uptime_seconds gauge");
    lines.push(`process_uptime_seconds ${snapshot.process.uptimeSeconds}`);

    lines.push("# HELP process_memory_rss_bytes Process RSS memory bytes");
    lines.push("# TYPE process_memory_rss_bytes gauge");
    lines.push(`process_memory_rss_bytes ${snapshot.process.memoryRssBytes}`);

    lines.push("# HELP process_memory_heap_used_bytes Process heap used bytes");
    lines.push("# TYPE process_memory_heap_used_bytes gauge");
    lines.push(`process_memory_heap_used_bytes ${snapshot.process.memoryHeapUsedBytes}`);

    return `${lines.join("\n")}\n`;
}

export function resetMetrics() {
    counters.httpRequests.clear();
    counters.httpErrors.clear();
    counters.appErrors.clear();
    durations.clear();
}
