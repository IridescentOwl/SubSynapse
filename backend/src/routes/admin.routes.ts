import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

router.post('/login', AdminController.login);

// Protected routes
router.get('/dashboard', adminMiddleware, AdminController.getDashboardStats);
router.get('/groups/pending', adminMiddleware, AdminController.getPendingGroups);
router.put('/groups/:id/approve', adminMiddleware, AdminController.approveGroup);
router.put('/groups/:id/reject', adminMiddleware, AdminController.rejectGroup);
router.get('/users', adminMiddleware, AdminController.getUsers);
router.put('/users/:id/suspend', adminMiddleware, AdminController.suspendUser);
router.get('/transactions', adminMiddleware, AdminController.getTransactions);
router.get('/withdrawal-requests', adminMiddleware, AdminController.getWithdrawalRequests);
router.put('/withdrawal/:id/process', adminMiddleware, AdminController.processWithdrawal);
router.get('/reports', adminMiddleware, AdminController.generateReport);

export default router;
