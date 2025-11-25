import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import { User } from '@prisma/client'; // Type removed due to import issues
import prisma from '../utils/prisma.singleton';

// Remove fallback values - these should be validated at startup
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  public static async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public static async generateTokens(
    user: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.activeSession.create({
      data: {
        userId: user.id,
        sessionToken: refreshToken,
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
      where: { sessionToken: token },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return decoded;
  }

  public static async invalidateRefreshToken(token: string): Promise<void> {
    await prisma.activeSession.delete({
      where: { sessionToken: token },
    });
  }
}
