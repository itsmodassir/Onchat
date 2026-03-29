import { Router } from 'express';
import { resellerController } from '../controllers/reseller.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/transfer', authMiddleware, resellerController.transferCoins);
router.get('/stats', authMiddleware, resellerController.getStats);

export default router;
