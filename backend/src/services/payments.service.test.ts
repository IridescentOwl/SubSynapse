import PaymentsService from './payments.service';
import prisma from '../utils/prisma.util';
import { EncryptionService } from './encryption.service';

jest.mock('../utils/prisma.util', () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  withdrawalRequest: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  transaction: {
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  groupMembership: {
    findUnique: jest.fn(),
  },
}));

jest.mock('../utils/razorpay.util', () => ({
    orders: {
        create: jest.fn(),
    },
}));

jest.mock('./encryption.service', () => ({
  EncryptionService: {
    encrypt: jest.fn((id) => `encrypted_${id}`),
    decrypt: jest.fn((id) => id.replace('encrypted_', '')),
  },
}));

describe('PaymentsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addCredits', () => {
    it('should add credits to a user and create a transaction', async () => {
      const userId = 'user1';
      const amount = 100;
      const paymentGatewayId = 'payment1';

      (prisma.user.update as jest.Mock).mockResolvedValueOnce({ id: userId, creditBalance: 100 });
      (prisma.transaction.create as jest.Mock).mockResolvedValueOnce({});

      const user = await PaymentsService.addCredits(userId, amount, paymentGatewayId);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { creditBalance: { increment: amount } },
      });
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId,
          type: 'credit',
          amount,
          status: 'completed',
          paymentGatewayId,
        },
      });
      expect(user).toEqual({ id: userId, creditBalance: 100 });
    });
  });

  describe('requestWithdrawal', () => {
    it('should create a withdrawal request and debit the user', async () => {
      const userId = 'user1';
      const amount = 50;
      const upiId = 'test@upi';

      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ id: userId, creditBalance: 100 });
      (prisma.withdrawalRequest.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (prisma.withdrawalRequest.create as jest.Mock).mockResolvedValueOnce({ id: 'withdrawal1' });
      (prisma.user.update as jest.Mock).mockResolvedValueOnce({ id: userId, creditBalance: 50 });
      (prisma.transaction.create as jest.Mock).mockResolvedValueOnce({});

      const withdrawalRequest = await PaymentsService.requestWithdrawal(userId, amount, upiId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(prisma.withdrawalRequest.create).toHaveBeenCalledWith({
        data: {
          userId,
          amount,
          upiId: 'encrypted_test@upi',
          status: 'pending',
        },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { creditBalance: { decrement: amount } },
      });
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId,
          type: 'debit',
          amount,
          status: 'pending',
          paymentGatewayId: 'withdrawal1',
        },
      });
      expect(withdrawalRequest).toEqual({ id: 'withdrawal1' });
    });
  });
});
