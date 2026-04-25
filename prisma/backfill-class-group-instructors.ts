import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizeName(value: string | null | undefined) {
    const normalized = value?.trim().replace(/\s+/g, " ");
    return normalized ? normalized.toLowerCase() : null;
}

async function main() {
    const shouldApply = process.argv.includes("--apply");

    console.log(`🔎 Class-group instructor backfill (${shouldApply ? "apply" : "dry-run"})`);

    const [classGroups, instructors] = await Promise.all([
        prisma.classGroup.findMany({
            where: {
                instructorUserId: null,
                instructorName: {
                    not: null,
                },
            },
            select: {
                id: true,
                name: true,
                instructorName: true,
            },
            orderBy: { createdAt: "asc" },
        }),
        prisma.user.findMany({
            where: {
                role: "INSTRUCTOR",
                isActive: true,
            },
            select: {
                id: true,
                fullName: true,
                email: true,
            },
            orderBy: { createdAt: "asc" },
        }),
    ]);

    const instructorMap = new Map<string, Array<{ id: string; fullName: string; email: string }>>();
    for (const instructor of instructors) {
        const key = normalizeName(instructor.fullName);
        if (!key) continue;

        const existing = instructorMap.get(key) ?? [];
        existing.push(instructor);
        instructorMap.set(key, existing);
    }

    let uniqueMatches = 0;
    let ambiguousMatches = 0;
    let noMatches = 0;

    const updates: Array<{ classGroupId: string; instructorUserId: string; instructorName: string }> = [];

    for (const classGroup of classGroups) {
        const key = normalizeName(classGroup.instructorName);
        const matches = key ? (instructorMap.get(key) ?? []) : [];

        if (matches.length === 1) {
            uniqueMatches += 1;
            updates.push({
                classGroupId: classGroup.id,
                instructorUserId: matches[0].id,
                instructorName: matches[0].fullName,
            });
            console.log(`✅ Unique match: ${classGroup.name} -> ${matches[0].fullName} (${matches[0].email})`);
            continue;
        }

        if (matches.length > 1) {
            ambiguousMatches += 1;
            console.log(`⚠️  Ambiguous match: ${classGroup.name} -> ${classGroup.instructorName} (${matches.length} instructors)`);
            continue;
        }

        noMatches += 1;
        console.log(`❌ No match: ${classGroup.name} -> ${classGroup.instructorName}`);
    }

    if (shouldApply && updates.length > 0) {
        for (const update of updates) {
            await prisma.classGroup.update({
                where: { id: update.classGroupId },
                data: {
                    instructorUserId: update.instructorUserId,
                    instructorName: update.instructorName,
                },
            });
        }
    }

    console.log("\n📊 Backfill summary");
    console.log(`   Total candidates : ${classGroups.length}`);
    console.log(`   Unique matches   : ${uniqueMatches}`);
    console.log(`   Ambiguous        : ${ambiguousMatches}`);
    console.log(`   No match         : ${noMatches}`);
    console.log(`   Mode             : ${shouldApply ? "APPLY" : "DRY-RUN"}`);

    if (!shouldApply) {
        console.log("\nℹ️  No data was changed. Re-run with --apply to persist unique matches.");
    }
}

main()
    .catch((error) => {
        console.error("❌ Backfill failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
