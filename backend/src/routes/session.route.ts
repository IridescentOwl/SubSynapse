import { Router } from 'express';
import { getActiveSessions, revokeSession } from '../controllers/session.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getActiveSessions);
router.delete('/:sessionId', authenticate, revokeSession);

export default router;
