import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { strictRateLimiter } from '../middleware/rateLimiter.middleware';
import { validateRegistration, validateLogin, validateForgotPassword, validateResetPassword } from '../middleware/validation.middleware';

const router = Router();

router.post('/register', strictRateLimiter, validateRegistration, AuthController.register);
router.post('/verify-email', strictRateLimiter, AuthController.verifyEmail);
router.post('/login', strictRateLimiter, validateLogin, AuthController.login);
router.post('/forgot-password', strictRateLimiter, validateForgotPassword, AuthController.forgotPassword);
router.get('/reset-password/:token', strictRateLimiter, AuthController.validateResetToken);
router.post('/reset-password/:token', strictRateLimiter, validateResetPassword, AuthController.resetPassword);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);

export default router;
