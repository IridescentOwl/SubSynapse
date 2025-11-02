import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import razorpay from '../utils/razorpay.util';

import PaymentsService from '../services/payments.service';
import { AuditService } from '../services/audit.service';

class PaymentsController {

  static async addCredits(req: Request, res: Response) {
    const { amount, currency } = req.body;
    const userId = (req as any).user.id;

    try {
      const order = await PaymentsService.createOrder(amount, currency, userId);
      // TODO: Save the order to the database
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Error creating order' });
    }
  }

  static async requestWithdrawal(req: Request, res: Response) {
    const { amount, upiId } = req.body;
    const userId = (req as any).user.id;

    try {
      const withdrawalRequest = await PaymentsService.requestWithdrawal(userId, amount, upiId);
      await AuditService.log('WITHDRAWAL_REQUEST', userId, JSON.stringify(withdrawalRequest), req.ip, 'WithdrawalRequest');
      res.status(200).json(withdrawalRequest);
    } catch (error) {
      res.status(500).json({ message: 'Error creating withdrawal request' });
    }
  }

  static async getWithdrawalHistory(req: Request, res: Response) {
    const userId = (req as any).user.id;

    try {
      const withdrawalHistory = await PaymentsService.getWithdrawalHistory(userId);
      res.status(200).json(withdrawalHistory);
    } catch (error) {
      res.status(500).json({ message: 'Error getting withdrawal history' });
    }
  }

  static async approveWithdrawal(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const withdrawalRequest = await PaymentsService.approveWithdrawal(id);
      res.status(200).json(withdrawalRequest);
    } catch (error) {
      res.status(500).json({ message: 'Error approving withdrawal request' });
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const signature = req.headers['x-razorpay-signature'];

    if (!signature) {
      return res.status(400).json({ message: 'Signature not found' });
    }

    try {
      const isValid = Razorpay.validateWebhookSignature(
        JSON.stringify(req.body),
        signature as string,
        secret
      );

      if (isValid) {
        const { event, payload } = req.body;
        if (event === 'payment.captured') {
          const { order_id, amount, id } = payload.payment.entity;
          const order = await razorpay.orders.fetch(order_id);
          const userId = order.notes.user_id;
          await PaymentsService.addCredits(userId, amount / 100, id);
        }
        res.status(200).json({ message: 'Webhook received' });
      } else {
        res.status(400).json({ message: 'Invalid signature' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error validating signature' });
    }
  }

  static async refund(req: Request, res: Response) {
    const { groupId } = req.params;
    const { userId } = req.body;

    try {
      await PaymentsService.refund(groupId, userId);
      res.status(200).json({ message: 'Refund successful' });
    } catch (error) {
      res.status(500).json({ message: 'Error processing refund' });
    }
  }
}

export default PaymentsController;
