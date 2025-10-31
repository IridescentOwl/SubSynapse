import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditService {
  public static async log(
    action: string,
    userId?: number,
    details?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        details,
        ipAddress,
        userAgent,
      },
    });
  }
}
