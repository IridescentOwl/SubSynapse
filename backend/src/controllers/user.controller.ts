import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { EncryptionService } from '../services/encryption.service';
import { AuditService } from '../services/audit.service';

export class UserController {
  public static getProfile(req: Request, res: Response) {
    const { password, ...userProfile } = req.user!;
    userProfile.name = EncryptionService.decrypt(userProfile.name);
    res.json(userProfile);
  }

  public static async updateProfile(req: Request, res: Response) {
    try {
      const updatedUser = await UserService.updateProfile(req.user!.id, req.body);
      const { password, ...userProfile } = updatedUser;
      await AuditService.log('PROFILE_UPDATED', req.user!.id, JSON.stringify(userProfile), req.ip, 'User');
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile', error });
    }
  }

  public static async uploadAvatar(req: Request, res: Response) {
    try {
      // In a real application, you would handle the file upload here
      // For now, we'll just return a success message
      res.json({ message: 'Avatar uploaded successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading avatar', error });
    }
  }

  public static async getTransactions(req: Request, res: Response) {
    try {
      const transactions = await UserService.getTransactions(req.user!.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching transactions', error });
    }
  }

  public static async deactivateAccount(req: Request, res: Response) {
    try {
      await UserService.deactivateAccount(req.user!.id);
      await AuditService.log('ACCOUNT_DEACTIVATED', req.user!.id, undefined, req.ip, 'User');
      res.json({ message: 'Account deactivated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deactivating account', error });
    }
  }

  public static async getMySubscriptions(req: Request, res: Response) {
    try {
      const subscriptions = await UserService.getMySubscriptions(req.user!.id);
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching subscriptions', error });
    }
  }
}
