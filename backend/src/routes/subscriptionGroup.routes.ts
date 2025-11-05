import { Router } from 'express';
import { SubscriptionGroupController } from '../controllers/subscriptionGroup.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

import { upload } from '../middleware/upload.middleware';

router.post('/', authenticate, upload.single('proof'), SubscriptionGroupController.createGroup);
router.get('/', SubscriptionGroupController.getGroups);
router.get('/:id', SubscriptionGroupController.getGroup);
router.post('/:id/join', authenticate, SubscriptionGroupController.joinGroup);
router.put('/:id', authenticate, SubscriptionGroupController.updateGroup);
router.delete('/:id/leave', authenticate, SubscriptionGroupController.leaveGroup);
router.post('/check-status', authenticate, SubscriptionGroupController.checkGroupStatus); // Should be admin only in a real app
router.get('/:id/credentials', authenticate, SubscriptionGroupController.getCredentials);
router.post('/:id/credentials', authenticate, SubscriptionGroupController.storeCredentials);
router.put('/:id/revoke-access', authenticate, SubscriptionGroupController.revokeAccess);
router.get('/:id/members', authenticate, SubscriptionGroupController.getMembers);

export default router;
