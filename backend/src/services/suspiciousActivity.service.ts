import prisma from '../utils/prisma.singleton';
import { log } from '../utils/logging.util';
import { EmailService } from './email.service';

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
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await EmailService.sendSuspiciousActivityAlert(adminEmail, 'Multiple failed logins from the same IP address.');
      }
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
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
            await EmailService.sendSuspiciousActivityAlert(adminEmail, 'Rapid requests from the same IP address.');
        }
    }
  }
}
