import { PrismaClient } from '@prisma/client';
import { log } from '../utils/logging.util';

const prisma = new PrismaClient();

export class SubscriptionGroupService {
  public static async checkGroupStatus() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const groupsToFail = await prisma.subscriptionGroup.findMany({
      where: {
        status: 'open',
        createdAt: { lte: sevenDaysAgo },
        slotsFilled: { lt: prisma.subscriptionGroup.fields.slotsTotal },
      },
      include: {
        members: true,
      },
    });

    for (const group of groupsToFail) {
      await prisma.$transaction(async (prisma) => {
        await prisma.subscriptionGroup.update({
          where: { id: group.id },
          data: { status: 'failed' },
        });

        for (const member of group.members) {
          await prisma.user.update({
            where: { id: member.userId },
            data: { creditBalance: { increment: member.shareAmount } },
          });

          await prisma.transaction.create({
            data: {
              userId: member.userId,
              amount: member.shareAmount,
              type: 'refund',
              status: 'completed',
            },
          });
        }
      });
      log('info', `Group ${group.id} failed and members were refunded.`);
    }
  }
}
