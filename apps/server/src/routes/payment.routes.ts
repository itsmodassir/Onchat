import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/add-coins', authMiddleware, paymentController.addCoins);
router.post('/send-gift', authMiddleware, paymentController.sendGift);

export default router;
