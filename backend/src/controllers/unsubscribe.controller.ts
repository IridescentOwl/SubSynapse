import { Request, Response } from 'express';
import prisma from '../utils/prisma.singleton';
import jwt from 'jsonwebtoken';
import { validateEnvironment } from '../config/env.validation';

export class UnsubscribeController {
  public static async unsubscribe(req: Request, res: Response): Promise<Response> {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    try {
      const env = validateEnvironment();
      const decoded = jwt.verify(token, env.JWT_SECRET) as { email: string };
      const email = decoded.email;

      const user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        await prisma.user.update({
          where: { email },
          data: {
            notifications: {
              ...(user.notifications as any),
              email: false,
            },
          },
        });
      }

      return res.status(200).json({ message: 'Successfully unsubscribed' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
