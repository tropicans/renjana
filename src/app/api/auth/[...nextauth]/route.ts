import { NextResponse, type NextRequest } from "next/server";
import { handlers } from "@/lib/auth";

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
    try {
        return await handlers.POST(req);
    } catch (error) {
        if (error instanceof Error && error.message === "RATE_LIMITED") {
            return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
        }

        throw error;
    }
}
