import { Request, Response } from 'express';
import prisma from '../utils/prisma.singleton';
import { AuthenticatedRequest } from '../types/express';
import { log } from '../utils/logging.util';
import PaymentsService from '../services/payments.service';
import { EmailService } from '../services/email.service';
import { EncryptionService } from '../services/encryption.service';
import crypto from 'crypto';

import { SubscriptionGroupService } from '../services/subscriptionGroup.service';

export class SubscriptionGroupController {
  public static async createGroup(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const { name, serviceType, totalPrice, slotsTotal, proof, credentials } = req.body;
      const ownerId = req.user!.id;
      let proofDocument = req.file ? req.file.path : null;

      // Parse numeric values - handle both string and number types
      const parsedTotalPrice = totalPrice ? (typeof totalPrice === 'string' ? parseFloat(totalPrice) : Number(totalPrice)) : null;
      const parsedSlotsTotal = slotsTotal ? (typeof slotsTotal === 'string' ? parseInt(slotsTotal, 10) : Number(slotsTotal)) : null;

      if (!name || !serviceType || !parsedTotalPrice || isNaN(parsedTotalPrice) || !parsedSlotsTotal || isNaN(parsedSlotsTotal)) {
        return res.status(400).json({ 
          message: 'Name, serviceType, totalPrice, and slotsTotal are required',
          received: { 
            name, 
            serviceType, 
            totalPrice: parsedTotalPrice, 
            slotsTotal: parsedSlotsTotal,
            body: req.body 
          }
        });
      }

      // If no file uploaded, check if proof URL was sent in body
      if (!proofDocument && proof) {
        // Store the proof URL as a string (for development/testing)
        proofDocument = proof;
      }

      if (!proofDocument) {
        return res.status(400).json({ message: 'Proof of purchase is required (upload file or provide URL)' });
      }

      const group = await prisma.subscriptionGroup.create({
        data: {
          ownerId,
          name,
          serviceType,
          totalPrice: parsedTotalPrice,
          slotsTotal: parsedSlotsTotal,
          slotsFilled: 1, // The owner fills the first slot
          proofDocument,
          adminApproved: process.env.NODE_ENV === 'development' ? true : false, // Auto-approve in dev
        },
      });

      // Add the owner as a member of the group
      await prisma.groupMembership.create({
        data: {
          userId: ownerId,
          groupId: group.id,
          shareAmount: parsedTotalPrice / parsedSlotsTotal,
        },
      });

      // Store credentials if provided
      if (credentials) {
        let credentialsData = credentials;
        // If credentials is a string, parse it
        if (typeof credentialsData === 'string') {
          try {
            credentialsData = JSON.parse(credentialsData);
          } catch (e) {
            log('warn', 'Failed to parse credentials JSON', { error: e });
          }
        }
        
        const encryptedCredentials = EncryptionService.encrypt(JSON.stringify(credentialsData));
        
        await prisma.credential.create({
          data: {
            groupId: group.id,
            credentials: encryptedCredentials,
          },
        });
      }

      return res.status(201).json(group);
    } catch (error: any) {
      log('error', 'An error occurred during group creation', { 
        error: error.message || error,
        stack: error.stack,
        body: req.body 
      });
      
      // Return more detailed error in development
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ 
          message: 'Internal server error',
          error: error.message || String(error),
          stack: error.stack
        });
      }
      
      return res.status(500).json({ message: 'Internal server error' });
    }
  }


  public static async getGroups(req: Request, res: Response): Promise<Response> {
    const { serviceType } = req.query;

    try {
      // In development, show all groups (including those without isActive set)
      // In production, only show approved and active groups
      let where: any = {};
      
      if (process.env.NODE_ENV === 'production') {
        where.isActive = true;
        where.adminApproved = true;
      } else {
        // In development, be more lenient - don't filter by isActive
        // This allows mock groups without isActive field to show up
        // We'll filter out inactive groups manually if needed
      }
      
      if (serviceType) {
        where.serviceType = serviceType;
      }

      // Fetch all groups (in dev) or filtered groups (in prod)
      let groups = await prisma.subscriptionGroup.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        include: {
          owner: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Show newest first
        },
      });
      
      // In development, filter out explicitly inactive groups but keep those without isActive
      if (process.env.NODE_ENV !== 'production') {
        groups = groups.filter(group => group.isActive !== false);
      }
      
      log('info', `Found ${groups.length} groups`, { 
        count: groups.length,
        where,
        nodeEnv: process.env.NODE_ENV,
        sample: groups.length > 0 ? {
          id: groups[0].id,
          name: groups[0].name,
          isActive: groups[0].isActive,
          adminApproved: groups[0].adminApproved
        } : null
      });
      
      // Decrypt owner names
      const groupsWithDecryptedNames = groups.map(group => {
        try {
          return {
            ...group,
            owner: {
              ...group.owner,
              name: group.owner?.name ? EncryptionService.decrypt(group.owner.name) : 'Unknown',
            },
          };
        } catch (decryptError) {
          log('warn', 'Failed to decrypt owner name', { groupId: group.id, error: decryptError });
          return {
            ...group,
            owner: {
              ...group.owner,
              name: 'Unknown',
            },
          };
        }
      });
      
      return res.status(200).json(groupsWithDecryptedNames);
    } catch (error: any) {
      log('error', 'An error occurred while fetching groups', { 
        error: error.message || error,
        stack: error.stack 
      });
      
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ 
          message: 'Internal server error',
          error: error.message || String(error)
        });
      }
      
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

      // Decrypt owner and member names
      const groupWithDecryptedNames = {
        ...group,
        owner: {
          ...group.owner,
          name: group.owner.name ? EncryptionService.decrypt(group.owner.name) : 'Unknown',
        },
        members: group.members.map(member => ({
          ...member,
          user: {
            ...member.user,
            name: member.user.name ? EncryptionService.decrypt(member.user.name) : 'Unknown',
          },
        })),
      };

      return res.status(200).json(groupWithDecryptedNames);
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

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await EmailService.sendGroupJoinedEmail(user.email, group.name);
      }

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

      if (membership.group.ownerId === userId) {
        return res.status(403).json({ message: 'Owner cannot leave the group. You must delete it instead.' });
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
        await PaymentsService.addCredits(userId, refundAmount, `refund_group_${groupId}`);
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        await EmailService.sendGroupLeftEmail(user.email, membership.group.name);
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

      // Decrypt member names
      const membersWithDecryptedNames = group.members.map(member => ({
        ...member,
        user: {
          ...member.user,
          name: member.user.name ? EncryptionService.decrypt(member.user.name) : 'Unknown',
        },
      }));

      return res.status(200).json(membersWithDecryptedNames);
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

      const totalRating = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      return res.status(200).json({ averageRating });
    } catch (error) {
      log('error', 'An error occurred while fetching group rating', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async deleteGroup(req: AuthenticatedRequest, res: Response): Promise<Response> {
    const groupId = req.params.id;
    const userId = req.user!.id;

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

      await SubscriptionGroupService.deleteGroup(groupId);

      return res.status(200).json({ message: 'Group deleted and members refunded successfully' });
    } catch (error) {
      log('error', 'An error occurred while deleting a group', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
