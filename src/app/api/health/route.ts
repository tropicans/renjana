import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { captureError } from "@/lib/observability/error-monitor";
import { withRequestObservability } from "@/lib/observability/route";

const DATABASE_CHECK_TIMEOUT_MS = 2000;

async function checkDatabase() {
    await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database health check timed out")), DATABASE_CHECK_TIMEOUT_MS)),
    ]);
}

export async function GET(req: Request) {
    return withRequestObservability(req, async (context) => {
        try {
            await checkDatabase();
        } catch (error) {
            captureError(error, {
                event: "health.database.error",
                requestId: context.requestId,
                traceId: context.traceId,
                spanId: context.spanId,
                method: context.method,
                path: context.path,
                status: 503,
            });

            return NextResponse.json({
                status: "degraded",
                timestamp: new Date().toISOString(),
                uptimeSeconds: Math.floor(process.uptime()),
                checks: {
                    database: {
                        status: "down",
                        error: error instanceof Prisma.PrismaClientKnownRequestError ? error.message : "Database unavailable",
                    },
                },
            }, { status: 503 });
        }

        return NextResponse.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor(process.uptime()),
            checks: {
                database: {
                    status: "up",
                },
            },
        });
    }, {
        event: "health.get",
    });
}
