import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/express';

export const authenticateResetToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
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

    req.user = { id: decoded.userId }; // Attach user ID for the controller
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired password reset token.' });
  }
};
