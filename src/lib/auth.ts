import { buildRateLimitKey, enforceRateLimit, getRateLimitIp } from "@/lib/rate-limit";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const nextAuthConfig: NextAuthConfig = {
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, request) {
                const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
                const password = typeof credentials?.password === "string" ? credentials.password : "";

                const rateLimitResponse = enforceRateLimit({
                    key: buildRateLimitKey(["auth-login", getRateLimitIp(request), email]),
                    limit: 5,
                    windowMs: 15 * 60 * 1000,
                    message: "Too many login attempts. Please try again later.",
                });
                if (rateLimitResponse) {
                    throw new Error("RATE_LIMITED");
                }

                if (!email || !password) return null;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.isActive) return null;

                const isValid = await bcrypt.compare(
                    password,
                    user.passwordHash
                );

                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.fullName,
                    role: user.role,
                    image: user.avatarUrl,
                };
            },
        }),
    ],
};

export const { handlers, signIn, signOut, auth } = NextAuth(nextAuthConfig);
