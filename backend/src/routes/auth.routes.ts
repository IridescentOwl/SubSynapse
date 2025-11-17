import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { strictRateLimiter } from '../middleware/rateLimiter.middleware';
import { validateRegistration, validateLogin, validateForgotPassword, validateResetPassword, validateOtp } from '../middleware/validation.middleware';
import { authenticateResetToken } from '../middleware/resetPassword.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

// Registration
router.post('/register', strictRateLimiter, validateRegistration, AuthController.register);
router.post('/verify-otp', strictRateLimiter, validateOtp, AuthController.verifyOtp);

// Login & Logout
router.post('/login', strictRateLimiter, validateLogin, AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);

// Password Reset Flow
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: Password reset OTP sent
 *       '404':
 *         description: User not found
 */
router.post('/forgot-password', strictRateLimiter, validateForgotPassword, AuthController.forgotPassword);

/**
 * @swagger
 * /auth/verify-password-otp:
 *   post:
 *     summary: Verify a password reset OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       '200':
 *         description: OTP verified, returns a short-lived reset token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resetToken:
 *                   type: string
 *       '400':
 *         description: Invalid or expired OTP
 */
router.post('/verify-password-otp', strictRateLimiter, validateOtp, AuthController.verifyPasswordOtp);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset a user's password using a reset token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: Password reset successfully
 *       '401':
 *         description: Invalid or expired reset token
 */
router.post('/reset-password', strictRateLimiter, authenticateResetToken, validateResetPassword, AuthController.resetPassword);


export default router;
