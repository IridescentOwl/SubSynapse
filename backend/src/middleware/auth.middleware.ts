import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

// Extend the Express Request interface to include the user object
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  const payload = AuthService.verifyToken(token);
  if (!payload) {
    return res.sendStatus(403); // Forbidden
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.sendStatus(404); // Not Found
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
