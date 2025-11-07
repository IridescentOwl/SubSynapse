import { Router } from 'express';
import PaymentsController from '../controllers/payments.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment and credit management
 */

/**
 * @swagger
 * /payments/add-credits:
 *   post:
 *     summary: Create a payment order to add credits
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: INR
 *     responses:
 *       '200':
 *         description: Order created successfully
 *       '401':
 *         description: Unauthorized
 */
router.post('/add-credits', authenticate, PaymentsController.addCredits);

/**
 * @swagger
 * /payments/withdrawal:
 *   post:
 *     summary: Request a withdrawal
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - upiId
 *             properties:
 *               amount:
 *                 type: number
 *               upiId:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Withdrawal request created successfully
 *       '401':
 *         description: Unauthorized
 */
router.post('/withdrawal', authenticate, PaymentsController.requestWithdrawal);

/**
 * @swagger
 * /payments/withdrawal-history:
 *   get:
 *     summary: Get withdrawal history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Withdrawal history retrieved successfully
 *       '401':
 *         description: Unauthorized
 */
router.get('/withdrawal-history', authenticate, PaymentsController.getWithdrawalHistory);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Razorpay webhook endpoint
 *     tags: [Payments]
 *     responses:
 *       '200':
 *         description: Webhook processed successfully
 */
router.post('/webhook', PaymentsController.handleWebhook);

export default router;


