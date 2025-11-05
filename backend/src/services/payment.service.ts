import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';
import { log } from '../utils/logging.util';

export class PaymentService {
  private prisma = new PrismaClient();
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(amount: number, userId: string) {
    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
      const order = await this.razorpay.orders.create(options);

      await this.prisma.transaction.create({
        data: {
          userId,
          amount,
          type: 'credit',
          status: 'pending',
          paymentGatewayId: order.id,
        },
      });

      return order;
    } catch (error) {
      log('error', 'Error creating Razorpay order', error);
      throw new Error('Could not create order');
    }
  }

  async verifyPayment(body: any, signature: string, secret: string) {
    const crypto = require('crypto');
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      log('error', 'Invalid webhook signature');
      throw new Error('Invalid signature');
    }

    const { event, payload } = body;
    const { payment } = payload;

    if (event === 'payment.captured') {
      const orderId = payment.entity.order_id;
      const transaction = await this.prisma.transaction.findFirst({
        where: { paymentGatewayId: orderId },
      });

      if (transaction && transaction.status === 'pending') {
        await this.prisma.$transaction(async (prisma) => {
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'completed' },
          });

          await prisma.user.update({
            where: { id: transaction.userId },
            data: { creditBalance: { increment: transaction.amount } },
          });
        });
        log('info', 'Payment successful and credits added', { transactionId: transaction.id });
      }
    }
  }

  async createWithdrawalRequest(amount: number, upiId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.creditBalance < amount) {
      throw new Error('Insufficient balance');
    }

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const recentRequest = await this.prisma.withdrawalRequest.findFirst({
      where: {
        userId,
        requestedAt: { gte: threeDaysAgo },
      },
      orderBy: { requestedAt: 'desc' },
    });

    if (recentRequest) {
      throw new Error('You can only make one withdrawal request every 3 days');
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.withdrawalRequest.create({
        data: {
          userId,
          amount,
          upiId,
          status: 'pending',
          cooldownExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { creditBalance: { decrement: amount } },
      });

      await prisma.transaction.create({
        data: {
          userId,
          amount,
          type: 'debit',
          status: 'completed',
        },
      });
    });
  }

  async getWithdrawalHistory(userId: string) {
    return this.prisma.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async approveWithdrawal(withdrawalId: string) {
    const withdrawalRequest = await this.prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawalRequest) {
      throw new Error('Withdrawal request not found');
    }

    if (withdrawalRequest.status !== 'pending') {
      throw new Error('Withdrawal request has already been processed');
    }

    await this.prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: { status: 'approved', processedAt: new Date() },
    });
  }
}
