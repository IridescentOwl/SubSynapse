import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express';
import { log } from '../utils/logging.util';
import { SubscriptionGroupService } from '../services/subscriptionGroup.service';

const prisma = new PrismaClient();

export class SubscriptionGroupController {
  public static async createGroup(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { name, serviceType, totalPrice, slotsTotal } = req.body;
    const ownerId = req.user!.id;

    if (!name || !serviceType || !totalPrice || !slotsTotal) {
      return res.status(400).json({ message: 'Name, serviceType, totalPrice, and slotsTotal are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Proof of subscription is required' });
    }

    try {
      const group = await prisma.subscriptionGroup.create({
        data: {
          ownerId,
          name,
          serviceType,
          totalPrice,
          slotsTotal,
          slotsFilled: 1, // The owner fills the first slot
          proofDocument: req.file.path,
        },
      });

      // Add the owner as a member of the group
      await prisma.groupMembership.create({
        data: {
          userId: ownerId,
          groupId: group.id,
          shareAmount: totalPrice / slotsTotal,
        },
      });

      return res.status(201).json(group);
    } catch (error) {
      log('error', 'An error occurred during group creation', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async getGroups(req: Request, res: Response): Promise<Response> {
    const { serviceType } = req.query;

    try {
      const where: any = {
        isActive: true,
        adminApproved: true,
      };

      if (serviceType) {
        where.serviceType = serviceType as string;
      }

      const groups = await prisma.subscriptionGroup.findMany({
        where,
        include: {
          owner: {
            select: {
              name: true,
            },
          },
        },
      });
      return res.status(200).json(groups);
    } catch (error) {
      log('error', 'An error occurred while fetching groups', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async getGroup(req: Request, res: Response): Promise<Response> {
    const groupId = req.params.id;

    try {
      const group = await prisma.subscriptionGroup.findUnique({
        where: { id: groupId },
        include: {
          owner: {
            select: {
              name: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          reviews: true,
        },
      });

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      return res.status(200).json(group);
    } catch (error) {
      log('error', 'An error occurred while fetching a group', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async joinGroup(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const groupId = req.params.id;
    const userId = req.user!.id;

    try {
      const group = await prisma.subscriptionGroup.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      if (group.slotsFilled >= group.slotsTotal) {
        return res.status(400).json({ message: 'Group is full' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const shareAmount = group.totalPrice / group.slotsTotal;

      if (!user || user.creditBalance < shareAmount) {
        return res.status(400).json({ message: 'Insufficient credit balance' });
      }

      await prisma.$transaction(async (prisma) => {
        await prisma.groupMembership.create({
          data: {
            userId,
            groupId,
            shareAmount,
          },
        });

        await prisma.subscriptionGroup.update({
          where: { id: groupId },
          data: { slotsFilled: { increment: 1 } },
        });

        await prisma.user.update({
          where: { id: userId },
          data: { creditBalance: { decrement: shareAmount } },
        });

        await prisma.transaction.create({
          data: {
            userId,
            amount: shareAmount,
            type: 'debit',
            status: 'completed',
          },
        });
      });

      return res.status(200).json({ message: 'Successfully joined the group' });
    } catch (error) {
      log('error', 'An error occurred while joining a group', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async checkGroupStatus(req: Request, res: Response): Promise<Response> {
    try {
      await SubscriptionGroupService.checkGroupStatus();
      return res.status(200).json({ message: 'Group status check completed' });
    } catch (error) {
      log('error', 'An error occurred during group status check', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  public static async leaveGroup(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const groupId = req.params.id;
    const userId = req.user!.id;

    try {
      const membership = await prisma.groupMembership.findFirst({
        where: {
          groupId,
          userId,
        },
      });

      if (!membership) {
        return res.status(404).json({ message: 'You are not a member of this group' });
      }

      await prisma.$transaction(async (prisma) => {
        // Refund the user
        await prisma.user.update({
          where: { id: userId },
          data: { creditBalance: { increment: membership.shareAmount } },
        });

        // Create a refund transaction
        await prisma.transaction.create({
          data: {
            userId,
            amount: membership.shareAmount,
            type: 'refund',
            status: 'completed',
          },
        });

        // Decrement the slots filled in the group
        await prisma.subscriptionGroup.update({
          where: { id: groupId },
          data: { slotsFilled: { decrement: 1 } },
        });

        // Delete the membership
        await prisma.groupMembership.delete({
          where: { id: membership.id },
        });
      });

      return res.status(200).json({ message: 'Successfully left the group and received a refund' });
    } catch (error) {
      log('error', 'An error occurred while leaving a group', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  public static async updateGroup(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const groupId = req.params.id;
    const userId = req.user!.id;
    const { name, serviceType } = req.body;

    try {
      const group = await prisma.subscriptionGroup.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      if (group.ownerId !== userId) {
        return res.status(403).json({ message: 'You are not the owner of this group' });
      }

      const updatedGroup = await prisma.subscriptionGroup.update({
        where: { id: groupId },
        data: {
          name,
          serviceType,
        },
      });

      return res.status(200).json(updatedGroup);
    } catch (error) {
      log('error', 'An error occurred while updating a group', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  public static async storeCredentials(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const groupId = req.params.id;
    const userId = req.user!.id;
    const { username, password } = req.body;

    try {
      await SubscriptionGroupService.storeCredentials(groupId, userId, username, password);
      return res.status(200).json({ message: 'Credentials stored successfully' });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      log('error', 'An error occurred while storing credentials', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  public static async getCredentials(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const groupId = req.params.id;
    const userId = req.user!.id;

    try {
      const credentials = await SubscriptionGroupService.getCredentials(groupId, userId);
      return res.status(200).json(credentials);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      log('error', 'An error occurred while retrieving credentials', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  public static async revokeAccess(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const groupId = req.params.id;
    const userId = req.user!.id;
    const { memberIdToRevoke } = req.body;

    try {
      await SubscriptionGroupService.revokeAccess(groupId, userId, memberIdToRevoke);
      return res.status(200).json({ message: 'Access revoked successfully' });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      log('error', 'An error occurred while revoking access', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  public static async getMembers(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const groupId = req.params.id;
    const userId = req.user!.id;

    try {
      const members = await SubscriptionGroupService.getMembers(groupId, userId);
      return res.status(200).json(members);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      log('error', 'An error occurred while retrieving members', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
