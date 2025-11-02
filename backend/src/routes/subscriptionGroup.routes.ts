import { Router } from 'express';
import { SubscriptionGroupController } from '../controllers/subscriptionGroup.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateSubscriptionGroup } from '../middleware/validation.middleware';

const router = Router();

import { upload } from '../middleware/file.middleware';

router.post('/', authenticate, upload.single('proofDocument'), validateSubscriptionGroup, SubscriptionGroupController.createGroup);
router.get('/', SubscriptionGroupController.getGroups);
router.get('/:id', SubscriptionGroupController.getGroup);
router.post('/join/:id', authenticate, SubscriptionGroupController.joinGroup);
router.put('/:id', authenticate, validateSubscriptionGroup, SubscriptionGroupController.updateGroup);
router.delete('/:id/leave', authenticate, SubscriptionGroupController.leaveGroup);
router.put('/:id/revoke-access', authenticate, SubscriptionGroupController.revokeAccess);
router.get('/:id/members', authenticate, SubscriptionGroupController.getGroupMembers);
router.get('/:id/rating', SubscriptionGroupController.getGroupRating);

export default router;
