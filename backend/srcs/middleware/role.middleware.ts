import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement proper role-based access control
  // For now, we'll just assume the user is an admin if they are authenticated.
  // In a real application, you would check the user's role from the database.
  if ((req as any).user) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admins only' });
  }
};
