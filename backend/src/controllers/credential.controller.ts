import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { EncryptionService } from '../services/encryption.service';
import { AuditService } from '../services/audit.service';
import { AuthenticatedRequest } from '../types/express';

const prisma = new PrismaClient();

export class CredentialController {
  static async storeCredentials(req: AuthenticatedRequest, res: Response) {
    const { groupId } = req.params;
    const { credentials } = req.body;
    const userId = req.user?.id;

    try {
      const group = await prisma.subscriptionGroup.findUnique({
        where: { id: groupId },
      });

      if (!group || group.ownerId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const encryptedCredentials = EncryptionService.encrypt(credentials);

      const savedCredentials = await prisma.credential.upsert({
        where: { groupId },
        update: { credentials: encryptedCredentials },
        create: {
          groupId,
          credentials: encryptedCredentials,
        },
      });

      await AuditService.log('CREDENTIALS_STORED', userId, JSON.stringify(savedCredentials), req.ip, 'Credential');

      res.status(201).json(savedCredentials);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async getCredentials(req: AuthenticatedRequest, res: Response) {
    const { groupId } = req.params;
    const userId = req.user?.id;

    try {
      const membership = await prisma.groupMembership.findFirst({
        where: {
          groupId,
          userId,
        },
      });

      if (!membership) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const existingSession = await prisma.session.findFirst({
        where: {
          groupId,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (existingSession) {
        return res.status(409).json({ message: 'Another user is already using the credentials' });
      }

      const credentials = await prisma.credential.findUnique({
        where: { groupId },
      });

      if (!credentials) {
        return res.status(404).json({ message: 'Credentials not found' });
      }

      const decryptedCredentials = EncryptionService.decrypt(credentials.credentials);

      await prisma.session.create({
        data: {
          groupId,
          userId: userId!,
          token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      await prisma.credentialAccessLog.create({
        data: {
          groupId,
          userId: userId!,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      await AuditService.log('CREDENTIALS_ACCESSED', userId, JSON.stringify({ groupId }), req.ip, 'Credential');

      res.json({ credentials: decryptedCredentials });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async updateCredentials(req: AuthenticatedRequest, res: Response) {
    const { groupId } = req.params;
    const { credentials } = req.body;
    const userId = req.user?.id;

    try {
      const group = await prisma.subscriptionGroup.findUnique({
        where: { id: groupId },
      });

      if (!group || group.ownerId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const encryptedCredentials = EncryptionService.encrypt(credentials);

      const updatedCredentials = await prisma.credential.update({
        where: { groupId },
        data: { credentials: encryptedCredentials },
      });

      await AuditService.log('CREDENTIALS_UPDATED', userId, JSON.stringify(updatedCredentials), req.ip, 'Credential');

      res.json(updatedCredentials);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  static async deleteCredentials(req: AuthenticatedRequest, res: Response) {
    const { groupId } = req.params;
    const userId = req.user?.id;

    try {
      const group = await prisma.subscriptionGroup.findUnique({
        where: { id: groupId },
      });

      if (!group || group.ownerId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await prisma.credential.delete({
        where: { groupId },
      });

      await AuditService.log('CREDENTIALS_DELETED', userId, JSON.stringify({ groupId }), req.ip, 'Credential');

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
