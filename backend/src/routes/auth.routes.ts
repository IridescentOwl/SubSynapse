import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { loginRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', AuthController.register);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/login', loginRateLimiter, AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.get('/reset-password/:token', AuthController.validateResetToken);
router.post('/reset-password/:token', AuthController.resetPassword);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);

export default router;
