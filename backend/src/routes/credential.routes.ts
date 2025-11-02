import { Router } from 'express';
import { CredentialController } from '../controllers/credential.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateCredentials } from '../middleware/validation.middleware';

const router = Router();

router.post('/:groupId', authenticate, validateCredentials, CredentialController.storeCredentials);
router.get('/:groupId', authenticate, CredentialController.getCredentials);
router.put('/:groupId', authenticate, validateCredentials, CredentialController.updateCredentials);
router.delete('/:groupId', authenticate, CredentialController.deleteCredentials);

export default router;
