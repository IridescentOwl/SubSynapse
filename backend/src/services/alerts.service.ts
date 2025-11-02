import prisma from '../utils/prisma.util';
import { EmailService } from './email.service';

export class AlertsService {
  public static async checkSubscriptionsAndBalances(): Promise<void> {
    await this.checkExpiringSubscriptions();
    await this.checkLowBalances();
  }

  private static async checkExpiringSubscriptions(): Promise<void> {
    const expiringSoonThreshold = new Date();
    expiringSoonThreshold.setDate(expiringSoonThreshold.getDate() + 7); // 7 days from now

    const expiringMemberships = await prisma.groupMembership.findMany({
      where: {
        isActive: true,
        endDate: {
          lte: expiringSoonThreshold,
        },
      },
      include: {
        user: true,
        group: true,
      },
    });

    for (const membership of expiringMemberships) {
      await EmailService.sendSubscriptionExpiryWarning(membership.user.email, membership.group.name, membership.endDate);
    }
  }

  private static async checkLowBalances(): Promise<void> {
    const lowBalanceThreshold = parseInt(process.env.LOW_BALANCE_THRESHOLD || '100');

    const usersWithLowBalance = await prisma.user.findMany({
      where: {
        creditBalance: {
          lt: lowBalanceThreshold,
        },
      },
    });

    for (const user of usersWithLowBalance) {
      await EmailService.sendLowBalanceAlert(user.email, user.creditBalance);
    }
  }
}
