import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types/express';
import { log } from '../utils/logging.util';
import PaymentsService from '../services/payments.service';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class SubscriptionGroupController {
  public static async createGroup(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const { name, serviceType, totalPrice, slotsTotal } = req.body;
    const ownerId = req.user!.id;
    const proofDocument = req.file ? req.file.path : null;

    if (!name || !serviceType || !totalPrice || !slotsTotal) {
      return res.status(400).json({ message: 'Name, serviceType, totalPrice, and slotsTotal are required' });
    }

    if (!proofDocument) {
      return res.status(400).json({ message: 'Proof of purchase is required' });
    }

    try {
      await PaymentsService.debit(ownerId, totalPrice, 'new_group_creation');

      const group = await prisma.subscriptionGroup.create({
        data: {
          ownerId,
          name,
          serviceType,
          totalPrice,
          slotsTotal,
          slotsFilled: 1, // The owner fills the first slot
          proofDocument,
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
      const where: any = { isActive: true, adminApproved: true };
      if (serviceType) {
        where.serviceType = serviceType;
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

      const shareAmount = group.totalPrice / group.slotsTotal;
      await PaymentsService.debit(userId, shareAmount, groupId);

      await prisma.groupMembership.create({
        data: {
          userId,
          groupId,
          shareAmount,
        },
      });

      await prisma.subscriptionGroup.update({
        where: { id: groupId },
        data: {
          slotsFilled: {
            increment: 1,
          },
        },
      });

      return res.status(200).json({ message: 'Successfully joined group' });
    } catch (error) {
      log('error', 'An error occurred while joining a group', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async updateGroup(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const groupId = req.params.id;
    const userId = req.user!.id;
    const { name, serviceType, totalPrice } = req.body;

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
          totalPrice,
        },
      });

      return res.status(200).json(updatedGroup);
    } catch (error) {
      log('error', 'An error occurred while updating a group', { error });
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
          isActive: true,
        },
        include: {
          group: true,
        },
      });

      if (!membership) {
        return res.status(404).json({ message: 'Membership not found' });
      }

      // Deactivate the membership
      await prisma.groupMembership.update({
        where: { id: membership.id },
        data: { isActive: false, endDate: new Date() },
      });

      // Decrement the slotsFilled count
      await prisma.subscriptionGroup.update({
        where: { id: groupId },
        data: {
          slotsFilled: {
            decrement: 1,
          },
        },
      });

      const subscriptionDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      const timeElapsed = new Date().getTime() - membership.joinDate.getTime();
      const timeRemaining = subscriptionDuration - timeElapsed;

      if (timeRemaining > 0) {
        const refundPercentage = timeRemaining / subscriptionDuration;
        const refundAmount = membership.shareAmount * refundPercentage;
        await PaymentsService.credit(userId, refundAmount, `refund_group_${groupId}`);
      }

      return res.status(200).json({ message: 'Successfully left group' });
    } catch (error) {
      log('error', 'An error occurred while leaving a group', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async revokeAccess(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const groupId = req.params.id;

    try {
      // In a real application, you would have a more sophisticated way of determining expired subscriptions
      // For now, we'll just deactivate all memberships that have an end date in the past
      await prisma.groupMembership.updateMany({
        where: {
          groupId,
          endDate: {
            lt: new Date(),
          },
        },
        data: {
          isActive: false,
        },
      });

      return res.status(200).json({ message: 'Access revoked for expired subscriptions' });
    } catch (error) {
      log('error', 'An error occurred while revoking access', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async getGroupMembers(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const groupId = req.params.id;
    const userId = req.user!.id;

    try {
      const group = await prisma.subscriptionGroup.findUnique({
        where: { id: groupId },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      if (group.ownerId !== userId) {
        return res.status(403).json({ message: 'You are not the owner of this group' });
      }

      return res.status(200).json(group.members);
    } catch (error) {
      log('error', 'An error occurred while fetching group members', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async getGroupRating(req: Request, res: Response): Promise<Response> {
    const groupId = req.params.id;

    try {
      const reviews = await prisma.review.findMany({
        where: {
          groupId,
        },
      });

      if (reviews.length === 0) {
        return res.status(200).json({ averageRating: 0 });
      }

      const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      return res.status(200).json({ averageRating });
    } catch (error) {
      log('error', 'An error occurred while fetching group rating', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
