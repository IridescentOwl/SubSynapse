import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', SubscriptionController.createSubscription);
router.get('/', SubscriptionController.getSubscriptions);
router.get('/:id', SubscriptionController.getSubscription);
router.put('/:id', SubscriptionController.updateSubscription);
router.delete('/:id', SubscriptionController.deleteSubscription);

export default router;
