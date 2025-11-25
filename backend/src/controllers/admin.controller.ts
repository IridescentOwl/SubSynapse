import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { SubscriptionGroupService } from '../services/subscriptionGroup.service';
import { log } from '../utils/logging.util';

export class AdminController {
  // Login is now handled by AuthController
  // static async login(req: Request, res: Response) { ... }

  static async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching dashboard stats', error });
    }
  }

  static async getPendingGroups(req: Request, res: Response) {
    try {
      const groups = await AdminService.getPendingGroups();
      res.json(groups);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getActiveGroups(req: Request, res: Response) {
    try {
      const groups = await AdminService.getActiveGroups();
      res.json(groups);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async approveGroup(req: Request, res: Response) {
    try {
      await AdminService.approveGroup(req.params.id);
      res.json({ message: 'Group approved successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async rejectGroup(req: Request, res: Response) {
    try {
      await AdminService.rejectGroup(req.params.id);
      res.json({ message: 'Group rejected successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }



  static async getUsers(req: Request, res: Response) {
    try {
      const users = await AdminService.getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getUserDetails(req: Request, res: Response) {
    try {
      const user = await AdminService.getUserDetails(req.params.id);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async suspendUser(req: Request, res: Response) {
    try {
      await AdminService.suspendUser(req.params.id);
      res.json({ message: 'User status updated successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getTransactions(req: Request, res: Response) {
    try {
      const transactions = await AdminService.getTransactions();
      res.status(200).json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching transactions', error });
    }
  }

  static async getWithdrawalRequests(req: Request, res: Response) {
    try {
      const requests = await AdminService.getWithdrawalRequests();
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching withdrawal requests', error });
    }
  }

  static async processWithdrawal(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AdminService.processWithdrawal(id);
      res.status(200).json({ message: 'Withdrawal processed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error processing withdrawal', error });
    }
  }

  static async generateReport(req: Request, res: Response) {
    try {
      const report = await AdminService.generateReport();
      res.status(200).json(report);
    } catch (error) {
      res.status(500).json({ message: 'Error generating report', error });
    }
  }

  static async deleteGroup(req: Request, res: Response) {
    const groupId = req.params.id;
    try {
      await SubscriptionGroupService.deleteGroup(groupId);
      res.status(200).json({ message: `Group ${groupId} deleted and members refunded successfully by admin.` });
    } catch (error: any) {
      log('error', `Admin failed to delete group ${groupId}`, { error: error.message });
      if (error.message === 'Group not found') {
        return res.status(404).json({ message: 'Group not found' });
      }
      res.status(500).json({ message: 'Error deleting group', error: error.message });
    }
  }
}
