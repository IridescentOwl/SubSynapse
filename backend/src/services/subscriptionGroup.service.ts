import prisma from '../utils/prisma.singleton';
import PaymentsService from './payments.service';
import { log } from '../utils/logging.util';

export class SubscriptionGroupService {
  /**
   * Deletes a subscription group and refunds all its active members.
   * This core logic can be called by owner-facing or admin-facing controllers.
   * @param groupId The ID of the group to delete.
   */
  public static async deleteGroup(groupId: string): Promise<void> {
    const group = await prisma.subscriptionGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Use a transaction to ensure all operations succeed or none do
    await prisma.$transaction(async (tx) => {
      // Refund all active members
      for (const member of group.members) {
        // The owner does not get a refund in this transaction, as their initial "payment" was removed.
        // If they are a member (which they are by default), we just skip them.
        if (member.userId !== group.ownerId) {
          await PaymentsService.addCredits(member.userId, member.shareAmount, `refund_group_deleted_${groupId}`, tx);
        }
      }

      // Delete all memberships for the group
      await tx.groupMembership.deleteMany({
        where: { groupId: groupId },
      });
      
      // Delete credentials associated with the group
      await tx.credential.deleteMany({
          where: { groupId: groupId },
      });

      // Delete the group itself
      await tx.subscriptionGroup.delete({
        where: { id: groupId },
      });
    });

    log('info', `Group ${groupId} deleted and members refunded.`);
  }
}
