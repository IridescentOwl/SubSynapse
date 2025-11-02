import express from 'express';
import PaymentsController from '../controllers/payments.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import { validateAddCredits, validateRequestWithdrawal } from '../middleware/validation.middleware';

const router = express.Router();

// Add credits to account
router.post('/add-credits', authenticate, validateAddCredits, PaymentsController.addCredits);

// Request withdrawal
router.post('/withdraw-request', authenticate, validateRequestWithdrawal, PaymentsController.requestWithdrawal);

// Get withdrawal history
router.get('/withdrawal-history', authenticate, PaymentsController.getWithdrawalHistory);

// Admin withdrawal approval
router.put('/withdraw/:id/approve', authenticate, isAdmin, PaymentsController.approveWithdrawal);

// Razorpay webhook handler
router.post('/webhook', PaymentsController.handleWebhook);

// Refund for a failed group
router.post('/refund/:groupId', authenticate, isAdmin, PaymentsController.refund);

export default router;
