import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { adminMiddleware } from '../middleware/admin.middleware';


const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints for managing the platform
 */


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
router.get('/dashboard', adminMiddleware, AdminController.getDashboardStats);

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
router.get('/groups/pending', adminMiddleware, AdminController.getPendingGroups);

/**
 * @swagger
 * /admin/groups/active:
 *   get:
 *     summary: Get all active subscription groups
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Active groups retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get('/groups/active', adminMiddleware, AdminController.getActiveGroups);

/**
 * @swagger
 * /admin/groups/{id}/approve:
 *   put:
 *     summary: Approve a pending subscription group
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
router.put('/groups/:id/approve', adminMiddleware, AdminController.approveGroup);

/**
 * @swagger
 * /admin/groups/{id}/reject:
 *   put:
 *     summary: Reject a pending subscription group
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
router.put('/groups/:id/reject', adminMiddleware, AdminController.rejectGroup);

/**
 * @swagger
 * /admin/groups/{id}:
 *   delete:
 *     summary: Delete a subscription group as an admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
router.delete('/groups/:id', adminMiddleware, AdminController.deleteGroup);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Users retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.get('/users', adminMiddleware, AdminController.getUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User details retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: User not found
 */
router.get('/users/:id', adminMiddleware, AdminController.getUserDetails);

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
router.put('/users/:id/suspend', adminMiddleware, AdminController.suspendUser);

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
router.get('/transactions', adminMiddleware, AdminController.getTransactions);

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
router.get('/withdrawal-requests', adminMiddleware, AdminController.getWithdrawalRequests);

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
router.put('/withdrawal/:id/process', adminMiddleware, AdminController.processWithdrawal);

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
router.get('/reports', adminMiddleware, AdminController.generateReport);

export default router;
