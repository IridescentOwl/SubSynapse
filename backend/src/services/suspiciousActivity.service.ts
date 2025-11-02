import { PrismaClient } from '@prisma/client';
import { log } from '../utils/logging.util';

const prisma = new PrismaClient();

export class SuspiciousActivityService {
  public static async checkForSuspiciousActivity(): Promise<void> {
    log('info', 'Checking for suspicious activity...');
    await this.checkForFailedLogins();
    await this.checkForRapidRequests();
    log('info', 'Finished checking for suspicious activity.');
  }

  private static async checkForFailedLogins(): Promise<void> {
    const twentyFourHoursAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const failedLogins = await prisma.auditLog.groupBy({
      by: ['ipAddress'],
      where: {
        action: 'LOGIN_FAILURE',
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      _count: {
        ipAddress: true,
      },
      having: {
        ipAddress: {
          _count: {
            gt: 10,
          },
        },
      },
    });

    if (failedLogins.length > 0) {
      log('warn', 'Suspicious activity detected: multiple failed logins from the same IP address.', { failedLogins });
      // In a real application, you would send an alert here.
    }
  }

  private static async checkForRapidRequests(): Promise<void> {
    const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60 * 1000);
    const rapidRequests = await prisma.auditLog.groupBy({
        by: ['ipAddress'],
        where: {
            createdAt: {
                gte: fiveMinutesAgo,
            },
        },
        _count: {
            ipAddress: true,
        },
        having: {
            ipAddress: {
                _count: {
                    gt: 100,
                },
            },
        },
    });

    if (rapidRequests.length > 0) {
        log('warn', 'Suspicious activity detected: rapid requests from the same IP address.', { rapidRequests });
        // In a real application, you would send an alert here.
    }
  }
}
