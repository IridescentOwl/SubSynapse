import express from 'express';
import PaymentsController from '../controllers/payments.controller';
import { isAuthenticated } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = express.Router();

// Add credits to account
router.post('/add-credits', isAuthenticated, PaymentsController.addCredits);

// Request withdrawal
router.post('/withdraw-request', isAuthenticated, PaymentsController.requestWithdrawal);

// Get withdrawal history
router.get('/withdrawal-history', isAuthenticated, PaymentsController.getWithdrawalHistory);

// Admin withdrawal approval
router.put('/withdraw/:id/approve', isAuthenticated, isAdmin, PaymentsController.approveWithdrawal);

// Razorpay webhook handler
router.post('/webhook', PaymentsController.handleWebhook);

// Refund for a failed group
router.post('/refund/:groupId', isAuthenticated, isAdmin, PaymentsController.refund);

export default router;
