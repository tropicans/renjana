import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import {
    ADMIN_REGISTRATIONS_PAGE_SIZE,
    getAdminRegistrationsWithReadiness,
} from "@/lib/domain/certificate-readiness";

export async function GET(req: Request) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const result = await getAdminRegistrationsWithReadiness(page, ADMIN_REGISTRATIONS_PAGE_SIZE);

    return NextResponse.json(result);
}