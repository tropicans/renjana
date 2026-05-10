import { NextResponse } from "next/server";
import { renderPrometheusMetrics } from "@/lib/observability/metrics";
import { withRequestObservability } from "@/lib/observability/route";

function isAuthorized(request: Request) {
    const expectedToken = process.env.METRICS_TOKEN?.trim();
    const header = request.headers.get("authorization")?.trim();

    if (expectedToken) {
        return header === `Bearer ${expectedToken}`;
    }

    return process.env.NODE_ENV !== "production";
}

function getUnauthorizedResponse() {
    if (process.env.METRICS_TOKEN?.trim()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET(req: Request) {
    return withRequestObservability(req, async () => {
        if (!isAuthorized(req)) {
            return getUnauthorizedResponse();
        }

        return new NextResponse(renderPrometheusMetrics(), {
            status: 200,
            headers: {
                "content-type": "text/plain; version=0.0.4; charset=utf-8",
            },
        });
    }, {
        event: "metrics.get",
    });
}
