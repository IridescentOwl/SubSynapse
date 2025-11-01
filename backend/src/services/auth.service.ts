import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import prisma from '../utils/prisma.util';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-jwt-refresh-secret';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  public static async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public static async generateTokens(
    user: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.activeSession.create({
      data: {
        userId: user.id,
        token: refreshToken,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  public static verifyToken(token: string, isRefreshToken = false): any {
    try {
      return jwt.verify(token, isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  public static async verifyRefreshToken(token: string): Promise<any | null> {
    const decoded = this.verifyToken(token, true);
    if (!decoded) {
      return null;
    }

    const session = await prisma.activeSession.findUnique({
      where: { token },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return decoded;
  }

  public static async invalidateRefreshToken(token: string): Promise<void> {
    await prisma.activeSession.delete({
      where: { token },
    });
  }
}
