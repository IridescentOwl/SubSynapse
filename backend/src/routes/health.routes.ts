import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma.util';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$connect();
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  } finally {
    await prisma.$disconnect();
  }
});

export default router;
