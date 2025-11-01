import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { AuditService } from '../services/audit.service';
import { generateOtp, generateSecureToken } from '../utils/crypto.util';
import { log } from '../utils/logging.util';

const prisma = new PrismaClient();

export class AuthController {
  public static async register(req: Request, res: Response): Promise<Response> {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Thapar-exclusive email validation
    if (!email.endsWith('@thapar.edu')) {
      return res.status(400).json({ message: 'Only @thapar.edu emails are allowed' });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
      }

      const hashedPassword = await AuthService.hashPassword(password);
      const verificationToken = generateOtp();
      const verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          verificationToken,
          verificationTokenExpires,
        },
      });

      await EmailService.sendVerificationEmail(email, verificationToken);

      await AuditService.log('USER_REGISTER', user.id, JSON.stringify(user), req.ip, 'User');

      return res.status(201).json({ message: 'User registered. Please check your email for verification OTP.' });
    } catch (error) {
      log('error', 'An error occurred during registration', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async verifyEmail(req: Request, res: Response): Promise<Response> {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          verificationToken: token,
          verificationTokenExpires: { gt: new Date() },
        },
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpires: null,
        },
      });

      return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      log('error', 'An error occurred during email verification', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (user.lockoutUntil && user.lockoutUntil > new Date()) {
        return res.status(403).json({ message: 'Account is locked. Please try again later.' });
      }

      const isPasswordValid = await AuthService.comparePasswords(password, user.password);

      if (!isPasswordValid) {
        const newFailedAttempts = user.failedLoginAttempts + 1;
        let lockoutUntil: Date | null = null;

        if (newFailedAttempts >= 5) {
          lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: newFailedAttempts, lockoutUntil },
        });

        await AuditService.log('LOGIN_FAILURE', user.id, `User ${email} failed to login`, req.ip, 'User');

        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.emailVerified) {
        return res.status(403).json({ message: 'Please verify your email before logging in.' });
      }

      // Reset failed login attempts on successful login
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockoutUntil: null },
      });

      const { accessToken, refreshToken } = await AuthService.generateTokens(user, req.ip, req.headers['user-agent']);

      await AuditService.log('LOGIN_SUCCESS', user.id, `User ${email} logged in successfully`, req.ip, 'User');

      return res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      log('error', 'An error occurred during login', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async forgotPassword(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        const passwordResetToken = generateSecureToken();
        const passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
          where: { id: user.id },
          data: { passwordResetToken, passwordResetTokenExpires },
        });

        await EmailService.sendPasswordResetEmail(email, passwordResetToken);

        await AuditService.log('PASSWORD_RESET_REQUEST', user.id, `User ${email} requested a password reset`, req.ip, 'User');
      }

      // Always return a success message to prevent email enumeration
      return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
    } catch (error) {
      log('error', 'An error occurred during forgot password', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async resetPassword(req: Request, res: Response): Promise<Response> {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    try {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetTokenExpires: { gt: new Date() },
        },
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired password reset token' });
      }

      const hashedPassword = await AuthService.hashPassword(password);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetTokenExpires: null,
          failedLoginAttempts: 0,
          lockoutUntil: null,
        },
      });

      await AuditService.log('PASSWORD_RESET_SUCCESS', user.id, `User ${user.email} successfully reset their password`, req.ip, 'User');

      return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      log('error', 'An error occurred during password reset', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async validateResetToken(req: Request, res: Response): Promise<Response> {
    const { token } = req.params;

    try {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetTokenExpires: { gt: new Date() },
        },
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired password reset token' });
      }

      return res.status(200).json({ message: 'Token is valid' });
    } catch (error) {
      log('error', 'An error occurred during token validation', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async logout(req: Request, res: Response): Promise<Response> {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
      await AuthService.invalidateRefreshToken(refreshToken);
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      log('error', 'An error occurred during logout', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async refreshToken(req: Request, res: Response): Promise<Response> {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
      const decoded = await AuthService.verifyRefreshToken(refreshToken);

      if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { accessToken } = await AuthService.generateTokens(user, req.ip, req.headers['user-agent']);

      return res.status(200).json({ accessToken });
    } catch (error) {
      log('error', 'An error occurred during token refresh', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
