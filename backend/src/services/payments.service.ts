import razorpay from '../utils/razorpay.util';
import prisma from '../utils/prisma.util';
import { EncryptionService } from './encryption.service';

class PaymentsService {
  static async createOrder(amount: number, currency: string, userId: string) {
    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      notes: {
        user_id: userId,
      },
    };
    const order = await razorpay.orders.create(options);
    return order;
  }

  static async addCredits(userId: string, amount: number, paymentGatewayId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          increment: amount,
        },
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        type: 'credit',
        amount,
        status: 'completed',
        paymentGatewayId,
      },
    });

    return user;
  }

  static async requestWithdrawal(userId: string, amount: number, upiId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.creditBalance < amount) {
      throw new Error('Insufficient funds');
    }

    const lastWithdrawalRequest = await prisma.withdrawalRequest.findFirst({
      where: { userId },
      orderBy: { requestedAt: 'desc' },
    });

    if (lastWithdrawalRequest) {
      const cooldownExpiresAt = new Date(lastWithdrawalRequest.requestedAt);
      cooldownExpiresAt.setDate(cooldownExpiresAt.getDate() + 2); // 2-day cooldown

      if (new Date() < cooldownExpiresAt) {
        throw new Error('Withdrawal request cooldown is active');
      }
    }

    const encryptedUpiId = EncryptionService.encrypt(upiId);

    const withdrawalRequest = await prisma.withdrawalRequest.create({
      data: {
        userId,
        amount,
        upiId: encryptedUpiId,
        status: 'pending',
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          decrement: amount,
        },
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        type: 'debit',
        amount,
        status: 'pending',
        paymentGatewayId: withdrawalRequest.id,
      },
    });

    return withdrawalRequest;
  }

  static async getWithdrawalHistory(userId: string) {
    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      where: { userId },
    });

    return withdrawalRequests.map((request) => ({
      ...request,
      upiId: EncryptionService.decrypt(request.upiId),
    }));
  }

  static async approveWithdrawal(withdrawalId: string) {
    const withdrawalRequest = await prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: 'approved',
        processedAt: new Date(),
      },
    });

    await prisma.transaction.updateMany({
      where: { paymentGatewayId: withdrawalId },
      data: {
        status: 'completed',
      },
    });

    return withdrawalRequest;
  }

  static async refund(groupId: string, userId: string) {
    const membership = await prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!membership) {
      throw new Error('Membership not found');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          increment: membership.shareAmount,
        },
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        type: 'credit',
        amount: membership.shareAmount,
        status: 'completed',
        paymentGatewayId: groupId,
      },
    });
  }

  static async debit(userId: string, amount: number, groupId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.creditBalance < amount) {
      throw new Error('Insufficient funds');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        creditBalance: {
          decrement: amount,
        },
      },
    });

    await prisma.transaction.create({
      data: {
        userId,
        type: 'debit',
        amount,
        status: 'completed',
        paymentGatewayId: groupId,
      },
    });
  }
}

export default PaymentsService;
