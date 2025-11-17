import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/express';
import prisma from '../utils/prisma.singleton';

export const authenticateResetToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; purpose: string };

    if (decoded.purpose !== 'password-reset') {
      return res.status(401).json({ message: 'Invalid token purpose.' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
        return res.status(401).json({ message: 'User not found.' });
    }

    req.user = { id: user.id, email: user.email, userId: user.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired password reset token.' });
  }
};
