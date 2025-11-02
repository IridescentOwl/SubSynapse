import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { adminMiddleware } from '../middleware/admin.middleware';
import { apiKeyMiddleware } from '../middleware/apiKey.middleware';

const router = Router();

router.post('/login', AdminController.login);

// Protected routes
router.get('/dashboard', apiKeyMiddleware, adminMiddleware, AdminController.getDashboardStats);
router.get('/groups/pending', apiKeyMiddleware, adminMiddleware, AdminController.getPendingGroups);
router.put('/groups/:id/approve', apiKeyMiddleware, adminMiddleware, AdminController.approveGroup);
router.put('/groups/:id/reject', apiKeyMiddleware, adminMiddleware, AdminController.rejectGroup);
router.get('/users', apiKeyMiddleware, adminMiddleware, AdminController.getUsers);
router.put('/users/:id/suspend', apiKeyMiddleware, adminMiddleware, AdminController.suspendUser);
router.get('/transactions', apiKeyMiddleware, adminMiddleware, AdminController.getTransactions);
router.get('/withdrawal-requests', apiKeyMiddleware, adminMiddleware, AdminController.getWithdrawalRequests);
router.put('/withdrawal/:id/process', apiKeyMiddleware, adminMiddleware, AdminController.processWithdrawal);
router.get('/reports', apiKeyMiddleware, adminMiddleware, AdminController.generateReport);

export default router;
