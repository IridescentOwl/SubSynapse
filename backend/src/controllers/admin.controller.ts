import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const result = await AdminService.login(email, password);
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  }

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
      res.status(200).json(groups);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching pending groups', error });
    }
  }

  static async approveGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AdminService.approveGroup(id);
      res.status(200).json({ message: 'Group approved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error approving group', error });
    }
  }

  static async rejectGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AdminService.rejectGroup(id);
      res.status(200).json({ message: 'Group rejected successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error rejecting group', error });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const users = await AdminService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error });
    }
  }

  static async suspendUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AdminService.suspendUser(id);
      res.status(200).json({ message: 'User suspended successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error suspending user', error });
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
}
