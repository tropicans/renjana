import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);

    const fullName = body?.fullName?.trim();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (!fullName || !email || !password) {
        return NextResponse.json({ error: "fullName, email, and password are required" }, { status: 400 });
    }

    if (!email.includes("@")) {
        return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            fullName,
            email,
            passwordHash,
            role: "LEARNER",
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    return NextResponse.json({ user }, { status: 201 });
}
