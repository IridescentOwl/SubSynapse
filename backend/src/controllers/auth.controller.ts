import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { EncryptionService } from '../services/encryption.service';
import { AuditService } from '../services/audit.service';
import { generateOtp, generateSecureToken } from '../utils/crypto.util';
import { log } from '../utils/logging.util';
import prisma from '../utils/prisma.singleton';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<Response> {
    const { email, password, name, website } = req.body;

    // Bot detection (honeypot field)
    if (website) {
        return res.status(400).json({ message: 'Bot detected' });
    }

    // Additional validation (though express-validator should have caught this)
    if (!email || !email.endsWith('@thapar.edu')) {
      return res.status(400).json({ message: 'Only @thapar.edu emails are allowed' });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.emailVerified) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // If a user exists but is not verified, or a pending user exists, delete them to start fresh.
      if (existingUser && !existingUser.emailVerified) {
        await prisma.user.delete({ where: { email } });
      }
      await prisma.pendingUser.deleteMany({ where: { email } });


      const hashedPassword = await AuthService.hashPassword(password);
      const otp = generateOtp();
      const expiresAt = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 minutes

      const encryptedName = EncryptionService.encrypt(name);

      await prisma.pendingUser.create({
        data: {
          email,
          name: encryptedName,
          password: hashedPassword,
          otp,
          expiresAt,
        },
      });

      // Send emails (non-blocking - don't fail registration if email fails)
      try {
        await EmailService.sendVerificationEmail(email, otp);
      } catch (error) {
        log('warn', 'Failed to send verification email, but registration continues', { error });
        // In development, log the verification token
        if (process.env.NODE_ENV === 'development') {
          log('info', `Verification OTP for ${email}: ${otp}`, {});
          console.log(`\n📧 Verification OTP for ${email}: ${otp}\n`);
        }
      }

      const responseMessage = 'Verification OTP sent. Please check your email.';

      return res.status(201).json({
        message: responseMessage,
      });
    } catch (error) {
      log('error', 'An error occurred during registration', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async verifyOtp(req: Request, res: Response): Promise<Response> {
    const { email, otp } = req.body;

    if (!otp || typeof otp !== 'string' || !email) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
      const pendingUser = await prisma.pendingUser.findUnique({ where: { email } });
      if (!pendingUser) {
        return res.status(404).json({ message: 'User not found or registration expired.' });
      }

      if (pendingUser.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP.' });
      }

      const now = new Date();
      if (pendingUser.expiresAt <= now) {
        return res.status(400).json({ message: 'OTP is expired.' });
      }

      const user = await prisma.user.create({
        data: {
          email: pendingUser.email,
          name: pendingUser.name,
          password: pendingUser.password,
          emailVerified: true,
        }
      });

      await prisma.pendingUser.delete({ where: { email } });
      
      try {
        await EmailService.sendWelcomeEmail(email, EncryptionService.decrypt(pendingUser.name));
      } catch (error) {
        log('warn', 'Failed to send welcome email, but registration continues', { error });
      }

      const { accessToken, refreshToken } = await AuthService.generateTokens(user, req.ip, req.headers['user-agent']);

      await AuditService.log('USER_REGISTER', user.id, JSON.stringify(user), req.ip, 'User');
      await AuditService.log('EMAIL_VERIFIED', user.id, `User ${email} verified their email`, req.ip, 'User');

      return res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      log('error', 'An error occurred during OTP verification', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

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
    const { email, website } = req.body;

    if (website) {
        return res.status(400).json({ message: 'Bot detected' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        const passwordResetToken = generateSecureToken();
        const passwordResetTokenExpires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 1 day

        await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            token: passwordResetToken,
            expiresAt: passwordResetTokenExpires,
          },
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

    try {
      const resetRecord = await prisma.passwordResetToken.findFirst({
        where: {
          token: token,
          expiresAt: { gt: new Date() },
          usedAt: null,
        },
      });

      if (!resetRecord) {
        return res.status(400).json({ message: 'Invalid or expired password reset token' });
      }

      const hashedPassword = await AuthService.hashPassword(password);

      await prisma.user.update({
        where: { id: resetRecord.userId },
        data: {
          password: hashedPassword,
          failedLoginAttempts: 0,
          lockoutUntil: null,
        },
      });

      await prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      });

      // Fetch user for audit logging
      const user = await prisma.user.findUnique({ where: { id: resetRecord.userId } });
      if (user) {
        await AuditService.log('PASSWORD_RESET_SUCCESS', user.id, `User ${user.email} successfully reset their password`, req.ip, 'User');
        if (user.phone) {
          await (new (require('../services/sms.service')).SmsService()).sendSms(user.phone, 'Your password has been reset successfully.');
        }
      }

      return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      log('error', 'An error occurred during password reset', { error });
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async validateResetToken(req: Request, res: Response): Promise<Response> {
    const { token } = req.params;

    try {
      const resetRecord = await prisma.passwordResetToken.findFirst({
        where: {
          token: token,
          expiresAt: { gt: new Date() },
          usedAt: null,
        },
      });

      if (!resetRecord) {
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
