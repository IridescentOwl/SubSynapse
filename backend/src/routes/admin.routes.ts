import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { adminMiddleware } from '../middleware/admin.middleware';
import { apiKeyMiddleware } from '../middleware/apiKey.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints for managing the platform
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Log in an admin user
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: Admin logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       '401':
 *         description: Invalid credentials
 */
router.post('/login', AdminController.login);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       '200':
 *         description: Dashboard statistics retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get('/dashboard', apiKeyMiddleware, adminMiddleware, AdminController.getDashboardStats);

/**
 * @swagger
 * /admin/groups/pending:
 *   get:
 *     summary: Get all pending subscription groups
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       '200':
 *         description: Pending groups retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get('/groups/pending', apiKeyMiddleware, adminMiddleware, AdminController.getPendingGroups);

/**
 * @swagger
 * /admin/groups/{id}/approve:
 *   put:
 *     summary: Approve a pending subscription group
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Group approved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Group not found
 */
router.put('/groups/:id/approve', apiKeyMiddleware, adminMiddleware, AdminController.approveGroup);

/**
 * @swagger
 * /admin/groups/{id}/reject:
 *   put:
 *     summary: Reject a pending subscription group
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Group rejected successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Group not found
 */
router.put('/groups/:id/reject', apiKeyMiddleware, adminMiddleware, AdminController.rejectGroup);

/**
 * @swagger
 * /admin/groups/{id}:
 *   delete:
 *     summary: Delete a subscription group as an admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Group deleted and members refunded successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Group not found
 */
router.delete('/groups/:id', apiKeyMiddleware, adminMiddleware, AdminController.deleteGroup);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       '200':
 *         description: Users retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get('/users', apiKeyMiddleware, adminMiddleware, AdminController.getUsers);

/**
 * @swagger
 * /admin/users/{id}/suspend:
 *   put:
 *     summary: Suspend a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User suspended successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: User not found
 */
router.put('/users/:id/suspend', apiKeyMiddleware, adminMiddleware, AdminController.suspendUser);

/**
 * @swagger
 * /admin/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       '200':
 *         description: Transactions retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get('/transactions', apiKeyMiddleware, adminMiddleware, AdminController.getTransactions);

/**
 * @swagger
 * /admin/withdrawal-requests:
 *   get:
 *     summary: Get all withdrawal requests
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       '200':
 *         description: Withdrawal requests retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get('/withdrawal-requests', apiKeyMiddleware, adminMiddleware, AdminController.getWithdrawalRequests);

/**
 * @swagger
 * /admin/withdrawal/{id}/process:
 *   put:
 *     summary: Process a withdrawal request
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Withdrawal request processed successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Withdrawal request not found
 */
router.put('/withdrawal/:id/process', apiKeyMiddleware, adminMiddleware, AdminController.processWithdrawal);

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     summary: Generate a report
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     responses:
 *       '200':
 *         description: Report generated successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get('/reports', apiKeyMiddleware, adminMiddleware, AdminController.generateReport);

export default router;
