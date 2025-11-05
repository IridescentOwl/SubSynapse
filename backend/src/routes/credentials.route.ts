import { Router } from 'express';
import { storeCredentials, getCredentials, updateCredentials, deleteCredentials } from '../controllers/credentials.controller';
import { authenticate } from '../middleware/auth.middleware';
import { oneActiveSessionPerSubscription } from '../middleware/session.middleware';

const router = Router();

router.post('/store', authenticate, storeCredentials);
router.get('/:groupId', authenticate, oneActiveSessionPerSubscription, getCredentials);
router.put('/:groupId', authenticate, updateCredentials);
router.delete('/:groupId', authenticate, deleteCredentials);

export default router;
