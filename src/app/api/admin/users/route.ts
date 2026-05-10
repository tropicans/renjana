import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { writeSecurityAuditLog } from "@/lib/audit";
import { withRequestObservability } from "@/lib/observability/route";
import { requireApiAuthPolicy } from "@/lib/route-policy";
import bcrypt from "bcryptjs";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function parsePagination(req: Request) {
    const url = new URL(req.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(url.searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
    return { page, pageSize, skip: (page - 1) * pageSize };
}
const ALLOWED_CREATE_ROLES = ["LEARNER", "INSTRUCTOR", "MANAGER", "FINANCE", "ADMIN"] as const;

function normalizeRole(value: unknown) {
    if (typeof value !== "string") return "LEARNER" as const;
    const normalized = value.trim().toUpperCase();
    return ALLOWED_CREATE_ROLES.includes(normalized as (typeof ALLOWED_CREATE_ROLES)[number])
        ? normalized as (typeof ALLOWED_CREATE_ROLES)[number]
        : "LEARNER";
}

export async function GET(req: Request) {
    const { user, error } = await requireRole("ADMIN");
    if (error) return error;

    return withRequestObservability(req, async () => {
        const { page, pageSize, skip } = parsePagination(req);
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    _count: { select: { enrollments: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.user.count(),
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.max(1, Math.ceil(total / pageSize)),
            },
        });
    }, {
        event: "admin.users.get",
        user,
    });
}

export async function POST(req: Request) {
    const policy = await requireApiAuthPolicy(req, { roles: ["ADMIN"], sameOrigin: true });
    if (!policy.ok) return policy.response;

    const { user: actor } = policy;

    return withRequestObservability(req, async () => {

        const { email, password, fullName, role } = await req.json();

        if (!email || !password || !fullName) {
            return NextResponse.json({ error: "email, password, fullName are required" }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const normalizedRole = normalizeRole(role);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                fullName,
                role: normalizedRole,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                createdAt: true,
                _count: { select: { enrollments: true } },
            },
        });

        await writeSecurityAuditLog(prisma, {
            userId: actor.id,
            action: "CREATE_USER",
            entity: "USER",
            entityId: user.id,
            metadata: {
                createdUserRole: user.role,
                createdUserEmail: user.email,
            },
        });

        return NextResponse.json({ user }, { status: 201 });
    }, {
        event: "admin.users.post",
        user: actor,
    });
}
