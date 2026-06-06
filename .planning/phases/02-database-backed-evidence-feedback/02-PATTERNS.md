# Phase 2: Database-Backed Evidence Feedback - Pattern Map

**Mapped:** 2026-06-06
**Files analyzed:** 4
**Analogs found:** 4 / 4

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/schema.prisma` | ORM | database-schema | [schema.prisma](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/prisma/schema.prisma) | exact |
| `src/app/api/evidence/route.ts` | controller | request-response | [courses/route.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/courses/route.ts) | exact |
| `src/app/api/evidence/[id]/route.ts` | controller | request-response | [class-groups/route.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/admin/events/[id]/class-groups/route.ts) | exact |
| `src/app/instructor/feedback/page.tsx` | view | React Query state | [attendance/page.tsx](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/instructor/attendance/page.tsx) | exact |
| `src/lib/api.ts` | api-helper | request-response | [api.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/lib/api.ts) | exact |

---

## Pattern Assignments

### `prisma/schema.prisma` (ORM, database-schema)
Menambahkan field opsional `rating` dan `comment` langsung ke model `Evidence`:
```prisma
model Evidence {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  title       String
  fileUrl     String   @map("file_url")
  fileType    String   @map("file_type")
  uploadedAt  DateTime @default(now()) @map("uploaded_at")
  rating      Int?
  comment     String?

  user        User     @relation(fields: [userId], references: [id])

  @@map("evidences")
}
```

---

### `src/app/api/evidence/route.ts` (controller, request-response)
Membaca query parameter `all` dan memfilter data berdasarkan `rating: null` jika `!all`:
```typescript
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const whereClause: any = {};
    if (!all) {
        whereClause.rating = null;
    }
```

---

### `src/app/api/evidence/[id]/route.ts` (controller, request-response)
Gunakan authorization `requireRole("INSTRUCTOR", "ADMIN")`, wrapper `withRequestObservability`, dan `writeSecurityAuditLog`:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { writeSecurityAuditLog } from "@/lib/audit";
import { withRequestObservability } from "@/lib/observability/route";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return withRequestObservability(req, async () => {
        const { user: actor, error } = await requireRole("INSTRUCTOR", "ADMIN");
        if (error) return error;

        const { id } = await params;
        const body = await req.json().catch(() => null);
        const rating = Number(body?.rating);
        const comment = typeof body?.comment === "string" ? body.comment.trim() : null;

        if (isNaN(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
        }

        const evidence = await prisma.evidence.update({
            where: { id },
            data: { rating, comment },
        });

        await writeSecurityAuditLog(prisma, {
            userId: actor.id,
            action: "GRADE_EVIDENCE",
            entity: "EVIDENCE",
            entityId: evidence.id,
            metadata: { rating, comment },
        });

        return NextResponse.json({ evidence });
    }, {
        event: "instructor.evidence.grade",
        getUser: async () => {
            const { user } = await requireRole("INSTRUCTOR", "ADMIN");
            return user ?? undefined;
        },
    });
}
```

---

### `src/app/instructor/feedback/page.tsx` (view, React Query state)
Menggunakan `useQuery` untuk fetch pending evidences dan `useMutation` untuk submit grading feedback:
```typescript
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["evidences-pending"],
        queryFn: () => fetchEvidences(), // defaults to all=false (pending rating only)
    });

    const mutation = useMutation({
        mutationFn: ({ id, rating, comment }: { id: string; rating: number; comment: string }) => 
            gradeEvidence(id, rating, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["evidences-pending"] });
            // reset UI state, show toast
        }
    });
```

---

## Shared Patterns

### Observability & Security Audit Log
Semua perubahan data (mutasi database) di API endpoint harus dibungkus dalam `withRequestObservability` dan mencatat data mutasi menggunakan `writeSecurityAuditLog`.

---

## Metadata

**Analog search scope:** `src/app/api/` & `src/app/instructor/`
**Files scanned:** 6
**Pattern extraction date:** 2026-06-06
