import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { AuthenticatedRequest } from '../types/express';

export class PaymentController {
  private paymentService = new PaymentService();

  addCredits = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { amount } = req.body;
      const userId = req.user.id;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
      }

      const order = await this.paymentService.createOrder(amount, userId);
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  withdrawRequest = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { amount, upiId } = req.body;
      const userId = req.user.id;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
      }

      if (!upiId) {
        return res.status(400).json({ message: 'UPI ID is required' });
      }

      await this.paymentService.createWithdrawalRequest(amount, upiId, userId);
      res.status(201).json({ message: 'Withdrawal request created' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  getWithdrawalHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.id;
      const history = await this.paymentService.getWithdrawalHistory(userId);
      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  approveWithdrawal = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.paymentService.approveWithdrawal(id);
      res.status(200).json({ message: 'Withdrawal request approved' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  handleWebhook = async (req: Request, res: Response) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const signature = req.headers['x-razorpay-signature'] as string;

    try {
      await this.paymentService.verifyPayment(req.body, signature, secret);
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      res.status(400).json({ status: 'error' });
    }
  };
}
