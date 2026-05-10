import type { Prisma, PrismaClient } from "@prisma/client";

type PrismaLike = PrismaClient | Prisma.TransactionClient;

type AuditLogInput = {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    metadata?: Prisma.InputJsonValue | null;
};

export type SecurityAuditLogInput = Omit<AuditLogInput, "userId"> & {
    userId?: string | null;
};

export async function writeAuditLog(prisma: PrismaLike, input: AuditLogInput) {
    return prisma.auditLog.create({
        data: {
            userId: input.userId,
            action: input.action,
            entity: input.entity,
            entityId: input.entityId,
            metadata: input.metadata ?? undefined,
        },
    });
}

export async function writeSecurityAuditLog(prisma: PrismaLike, input: SecurityAuditLogInput) {
    if (!input.userId) {
        throw new Error("Security audit log requires actor user id");
    }

    return writeAuditLog(prisma, {
        ...input,
        userId: input.userId,
    });
}
