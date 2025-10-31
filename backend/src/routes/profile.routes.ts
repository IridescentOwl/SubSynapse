import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { ProfileController } from '../controllers/profile.controller';

const router = Router();

router.get('/', authenticate, ProfileController.getProfile);

export default router;
