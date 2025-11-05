import { Router } from 'express';
import { SubscriptionGroupController } from '../controllers/subscriptionGroup.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, SubscriptionGroupController.createGroup);
router.get('/', SubscriptionGroupController.getGroups);
router.get('/:id', SubscriptionGroupController.getGroup);
router.post('/:id/join', authenticate, SubscriptionGroupController.joinGroup);
router.post('/check-status', authenticate, SubscriptionGroupController.checkGroupStatus); // Should be admin only in a real app

export default router;
