import { Router } from 'express';
import { SubscriptionGroupController } from '../controllers/subscriptionGroup.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, SubscriptionGroupController.createGroup);
router.get('/', SubscriptionGroupController.getGroups);
router.get('/:id', SubscriptionGroupController.getGroup);
router.post('/join/:id', authenticate, SubscriptionGroupController.joinGroup);

export default router;
