import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiAuthPolicy } from "@/lib/route-policy";
import { getInstructorScope } from "@/lib/instructor-scope";
import { withRequestObservability } from "@/lib/observability/route";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return withRequestObservability(req, async () => {
        const policy = await requireApiAuthPolicy(req, { sameOrigin: true });
        if (!policy.ok) return policy.response;

        const { user } = policy;
        const { id } = await params;

        const evidence = await prisma.evidence.findUnique({
            where: { id },
        });

        if (!evidence) {
            return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
        }

        // Authorization checks
        let isAuthorized = false;

        if (user.role === "ADMIN") {
            isAuthorized = true;
        } else if (evidence.userId === user.id) {
            isAuthorized = true;
        } else if (user.role === "INSTRUCTOR") {
            const scope = await getInstructorScope(user.id, user.name);
            const learnerIds = Array.from(new Set(scope.enrollmentPairs.map((pair) => pair.userId)));
            if (learnerIds.includes(evidence.userId)) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const fileName = path.basename(evidence.fileUrl);
        const filePath = path.join(process.cwd(), "uploads", "evidence", fileName);

        try {
            const fileBuffer = await readFile(filePath);
            return new Response(fileBuffer, {
                headers: {
                    "Content-Type": evidence.fileType || "application/octet-stream",
                    "Content-Disposition": `inline; filename="${fileName}"`,
                },
            });
        } catch {
            return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
        }
    }, {
        event: "learner.evidence.download",
        getUser: async () => {
            const policy = await requireApiAuthPolicy(req, { sameOrigin: true });
            return policy.ok ? policy.user : undefined;
        },
    });
}
