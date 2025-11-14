import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateUpdateProfile } from '../middleware/validation.middleware';

const router = Router();

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, validateUpdateProfile, UserController.updateProfile);
router.post('/upload-avatar', authenticate, UserController.uploadAvatar);
router.get('/transactions', authenticate, UserController.getTransactions);
router.post('/deactivate-account', authenticate, UserController.deactivateAccount);
router.get('/my-subscriptions', authenticate, UserController.getMySubscriptions);

export default router;
