import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { validateEnvironment } from '../config/env.validation';
import prisma from '../utils/prisma.singleton';

const env = validateEnvironment();

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Assuming auth middleware has already run and populated req.user
  // If not, we should probably combine them or ensure order. 
  // But let's make this standalone for safety or check if req.user exists.

  // Actually, let's just use the token verification logic here if it's not chained.
  // But better pattern: use authenticate middleware first, then admin check.
  // However, existing routes use: apiKeyMiddleware, adminMiddleware.
  // We need to change routes to: authenticate, adminMiddleware.

  // Let's rewrite this to expect req.user from previous middleware, OR verify token itself if needed.
  // Given the current route structure, it seems adminMiddleware was doing the auth.
  // Now we want standard auth.

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization header required' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;

    // Check if user is admin
    if (!decoded.isAdmin) {
      // Double check database to be sure (optional but safer)
      // const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      // if (!user || !user.isAdmin) ...
      // For performance, trust the token if it has isAdmin, or fetch if critical.
      // Let's fetch to be safe and populate req.user

      // Actually, let's just fetch the user to be sure and populate req.user
    }

    // We need to fetch user anyway to ensure they exist and are active
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) return res.status(401).json({ error: 'User not found' });
    if (!user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
