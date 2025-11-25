import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateEnvironment } from '../config/env.validation';
import prisma from '../utils/prisma.singleton';

const env = validateEnvironment();

export class AdminService {
  static async login(email: string, password: string): Promise<{ token: string } | null> {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (admin && bcrypt.compareSync(password, admin.password)) {
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: 'admin' },
        env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return { token };
    }
    return null;
  }

  static async getDashboardStats(): Promise<any> {
    const [
      pendingGroups,
      totalUsers,
      totalTransactions,
      totalWithdrawalRequests,
      activeGroups
    ] = await Promise.all([
      prisma.subscriptionGroup.count({ where: { status: 'pending_review' } }),
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.withdrawalRequest.count({ where: { status: 'pending' } }),
      prisma.subscriptionGroup.count({ where: { status: 'active' } })
    ]);

    // Also count full groups as active for the dashboard
    const fullGroups = await prisma.subscriptionGroup.count({ where: { status: 'full' } });
    const totalActiveGroups = activeGroups + fullGroups;

    return {
      pendingGroups,
      totalUsers,
      totalTransactions,
      totalWithdrawalRequests,
      activeGroups: totalActiveGroups
    };
  }

  static async getPendingGroups(): Promise<any[]> {
    return prisma.subscriptionGroup.findMany({
      where: { status: 'pending_review' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getActiveGroups(): Promise<any[]> {
    return prisma.subscriptionGroup.findMany({
      where: {
        status: { in: ['active', 'full'] },
        adminApproved: true
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async approveGroup(id: string): Promise<void> {
    await prisma.subscriptionGroup.update({
      where: { id },
      data: {
        status: 'active',
        adminApproved: true,
        isActive: true
      }
    });
  }

  static async rejectGroup(id: string): Promise<void> {
    await prisma.subscriptionGroup.update({
      where: { id },
      data: {
        status: 'rejected',
        adminApproved: false,
        isActive: false
      }
    });
  }

  static async getUsers(): Promise<any[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit for performance
    });
  }

  static async getUserDetails(id: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        ownedGroups: true,
        memberships: {
          include: {
            group: true
          }
        },
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) throw new Error('User not found');
    return user;
  }

  static async suspendUser(id: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    // Toggle active status
    await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    });
  }

  static async getTransactions(): Promise<any[]> {
    return prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
  }

  static async getWithdrawalRequests(): Promise<any[]> {
    return prisma.withdrawalRequest.findMany({
      orderBy: { requestedAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, creditBalance: true }
        }
      }
    });
  }

  static async processWithdrawal(id: string): Promise<void> {
    await prisma.withdrawalRequest.update({
      where: { id },
      data: {
        status: 'processed',
        processedAt: new Date()
      }
    });
  }

  static async generateReport(): Promise<any> {
    // Simple report for now
    const totalSales = await prisma.transaction.aggregate({
      where: { type: 'payment', status: 'completed' },
      _sum: { amount: true }
    });

    return {
      totalSales: totalSales._sum.amount || 0,
      generatedAt: new Date()
    };
  }
}
