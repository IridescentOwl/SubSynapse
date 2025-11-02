import { Router } from 'express';
import { CredentialController } from '../controllers/credential.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/:groupId', authenticate, CredentialController.storeCredentials);
router.get('/:groupId', authenticate, CredentialController.getCredentials);
router.put('/:groupId', authenticate, CredentialController.updateCredentials);
router.delete('/:groupId', authenticate, CredentialController.deleteCredentials);

export default router;
