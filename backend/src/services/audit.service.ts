import { prisma } from '../utils/prisma.util';

export class AuditService {
  public static async log(
    action: string,
    userId?: string,
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
