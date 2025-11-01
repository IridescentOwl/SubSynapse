import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditService {
  public static async log(
    action: string,
    userId?: string,
    newValues?: string,
    ipAddress?: string,
    tableName?: string,
    oldValues?: string
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        newValues,
        ipAddress,
        tableName,
        oldValues,
      },
    });
  }
}
