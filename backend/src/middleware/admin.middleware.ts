import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      // @ts-ignore
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
