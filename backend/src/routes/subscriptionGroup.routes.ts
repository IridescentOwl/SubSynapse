import { Router } from 'express';
import { SubscriptionGroupController } from '../controllers/subscriptionGroup.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateSubscriptionGroup } from '../middleware/validation.middleware';
import { cache, clearCache } from '../middleware/cache.middleware';

const router = Router();

import { upload, optimizeAndStore } from '../middleware/middleware/file.middleware';

/**
 * @swagger
 * tags:
 *   name: Subscription Groups
 *   description: Manage subscription groups
 */

/**
 * @swagger
 * /subscription-groups:
 *   post:
 *     summary: Create a new subscription group
 *     tags: [Subscription Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - serviceType
 *               - totalPrice
 *               - slotsTotal
 *               - proofDocument
 *             properties:
 *               name:
 *                 type: string
 *               serviceType:
 *                 type: string
 *               totalPrice:
 *                 type: number
 *               slotsTotal:
 *                 type: integer
 *               proofDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '201':
 *         description: Group created successfully
 *       '400':
 *         description: Invalid input
 */
router.post(
  '/',
  authenticate,
  upload.single('proofDocument'),
  optimizeAndStore,
  validateSubscriptionGroup,
  async (req: any, res: any, next: any) => {
    try {
      clearCache('/groups');
      const result = await SubscriptionGroupController.createGroup(req, res);
      return result;
    } catch (error: any) {
      // If response already sent, don't try to send again
      if (!res.headersSent) {
        return res.status(500).json({ 
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      next(error);
    }
  }
);

/**
 * @swagger
 * /subscription-groups:
 *   get:
 *     summary: Get a list of active subscription groups
 *     tags: [Subscription Groups]
 *     parameters:
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *         description: Filter by service type
 *     responses:
 *       '200':
 *         description: A list of subscription groups
 */
router.get('/', cache(60), SubscriptionGroupController.getGroups);

/**
 * @swagger
 * /subscription-groups/{id}:
 *   get:
 *     summary: Get details of a specific subscription group
 *     tags: [Subscription Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Subscription group details
 *       '404':
 *         description: Group not found
 */
router.get('/:id', SubscriptionGroupController.getGroup);

/**
 * @swagger
 * /subscription-groups/join/{id}:
 *   post:
 *     summary: Join a subscription group
 *     tags: [Subscription Groups]
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
 *         description: Successfully joined group
 *       '400':
 *         description: Group is full
 *       '404':
 *         description: Group not found
 */
router.post('/join/:id', authenticate, (req: any, res: any, next: any) => {
  clearCache('/groups');
  SubscriptionGroupController.joinGroup(req, res);
});

/**
 * @swagger
 * /subscription-groups/{id}:
 *   put:
 *     summary: Update a subscription group (owner only)
 *     tags: [Subscription Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               serviceType:
 *                 type: string
 *               totalPrice:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Group updated successfully
 *       '403':
 *         description: You are not the owner of this group
 *       '404':
 *         description: Group not found
 */
router.put('/:id', authenticate, validateSubscriptionGroup, (req: any, res: any, next: any) => {
  clearCache('/groups');
  SubscriptionGroupController.updateGroup(req, res);
});

/**
 * @swagger
 * /subscription-groups/{id}/leave:
 *   delete:
 *     summary: Leave a subscription group
 *     tags: [Subscription Groups]
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
 *         description: Successfully left group
 *       '404':
 *         description: Membership not found
 */
router.delete('/:id/leave', authenticate, (req: any, res: any, next: any) => {
  clearCache('/groups');
  SubscriptionGroupController.leaveGroup(req, res);
});

/**
 * @swagger
 * /subscription-groups/{id}/members:
 *   get:
 *     summary: Get the members of a subscription group (owner only)
 *     tags: [Subscription Groups]
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
 *         description: A list of group members
 *       '403':
 *         description: You are not the owner of this group
 *       '404':
 *         description: Group not found
 */
router.get('/:id/members', authenticate, SubscriptionGroupController.getGroupMembers);

/**
 * @swagger
 * /subscription-groups/{id}/rating:
 *   get:
 *     summary: Get the average rating of a subscription group
 *     tags: [Subscription Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: The average rating of the group
 */
router.get('/:id/rating', SubscriptionGroupController.getGroupRating);

export default router;
