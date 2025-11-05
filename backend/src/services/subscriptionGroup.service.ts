import { PrismaClient } from '@prisma/client';
import { log } from '../utils/logging.util';
import { encrypt, decrypt } from '../utils/encryption.util';

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
  public static async storeCredentials(groupId: string, userId: string, username: string, password: string): Promise<void> {
    const group = await prisma.subscriptionGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    if (group.ownerId !== userId) {
      throw new Error('You are not the owner of this group');
    }

    const encryptedUsername = encrypt(username);
    const encryptedPassword = encrypt(password);

    await prisma.encryptedCredentials.create({
      data: {
        groupId,
        encryptedUsername,
        encryptedPassword,
        encryptionKeyId: 'v1', // In a real app, you'd manage key versions
      },
    });
  }
  public static async getCredentials(groupId: string, userId: string): Promise<{ username: string; password: string }> {
    const membership = await prisma.groupMembership.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (!membership) {
      throw new Error('You are not a member of this group');
    }

    const credentials = await prisma.encryptedCredentials.findUnique({
      where: { groupId },
    });

    if (!credentials) {
      throw new Error('Credentials not found for this group');
    }

    const username = decrypt(credentials.encryptedUsername);
    const password = decrypt(credentials.encryptedPassword);

    return { username, password };
  }
  public static async revokeAccess(groupId: string, userId: string, memberIdToRevoke: string): Promise<void> {
    const group = await prisma.subscriptionGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    if (group.ownerId !== userId) {
      throw new Error('You are not the owner of this group');
    }

    if (!memberIdToRevoke) {
      throw new Error('memberIdToRevoke is required');
    }

    const membership = await prisma.groupMembership.findFirst({
      where: {
        groupId,
        userId: memberIdToRevoke,
      },
    });

    if (!membership) {
      throw new Error('Member not found in this group');
    }

    await prisma.groupMembership.update({
      where: {
        id: membership.id,
      },
      data: {
        isActive: false,
      },
    });

    log('info', `Access revoked for user ${memberIdToRevoke} in group ${groupId}`);
  }
  public static async getMembers(groupId: string, userId: string): Promise<any> {
    const group = await prisma.subscriptionGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    if (group.ownerId !== userId) {
      throw new Error('You are not the owner of this group');
    }

    return prisma.groupMembership.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
