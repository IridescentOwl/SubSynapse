import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { admin } from '../middleware/admin.middleware';

const router = Router();
const paymentController = new PaymentController();

// User routes
router.post('/add-credits', authenticate, paymentController.addCredits);
router.post('/withdraw-request', authenticate, paymentController.withdrawRequest);
router.get('/withdrawal-history', authenticate, paymentController.getWithdrawalHistory);

// Admin route
router.put('/withdraw/:id/approve', authenticate, admin, paymentController.approveWithdrawal);

// Webhook
router.post('/webhook', paymentController.handleWebhook);

export default router;
