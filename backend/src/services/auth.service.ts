import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

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

  public static generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  public static verifyToken(token: string, isRefreshToken = false): any {
    try {
      return jwt.verify(token, isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}
