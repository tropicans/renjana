import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";

// GET /api/admin/users — list all users (admin only)
export async function GET() {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const users = await prisma.user.findMany({
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
    });

    return NextResponse.json({ users });
}

// POST /api/admin/users — create new user (admin only)
export async function POST(req: Request) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { email, password, fullName, role } = await req.json();

    if (!email || !password || !fullName) {
        return NextResponse.json({ error: "email, password, fullName are required" }, { status: 400 });
    }

    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            fullName,
            role: role || "LEARNER",
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

    return NextResponse.json({ user }, { status: 201 });
}
