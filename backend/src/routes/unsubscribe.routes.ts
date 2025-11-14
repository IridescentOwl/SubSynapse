import { Router } from 'express';
import { UnsubscribeController } from '../controllers/unsubscribe.controller';

const router = Router();

router.post('/', UnsubscribeController.unsubscribe);

export default router;
