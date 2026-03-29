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

// Tier 3: Advanced Analytics
router.get('/analytics', async (req: any, res) => {
  try {
    const { analyticsService } = await import('../services/analytics.service');
    const overview = await analyticsService.getPlatformOverview();
    const activity = await analyticsService.getRecentActivity();
    res.json({ overview, activity });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
