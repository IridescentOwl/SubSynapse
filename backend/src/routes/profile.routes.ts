import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, (req: Request, res: Response) => {
  // The user object is attached to the request by the authenticateToken middleware
  const { password, ...userProfile } = req.user!;
  res.json(userProfile);
});

export default router;
