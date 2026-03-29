import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', adminController.getUsers);
router.get('/stats', adminController.getStats);
router.patch('/users/:userId/balance', adminController.updateBalance);
router.post('/users/:userId/add-coins', adminController.addCoins);
router.patch('/users/:userId/reseller', adminController.toggleReseller);

router.get('/analytics/detailed', adminController.getDetailedAnalytics);

export default router;
