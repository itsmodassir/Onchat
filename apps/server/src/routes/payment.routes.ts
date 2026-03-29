import { Router } from 'express';
import { razorpayController } from '../controllers/razorpay.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/razorpay/order', authMiddleware, razorpayController.createOrder);
router.post('/razorpay/verify', authMiddleware, razorpayController.verifyPayment);

export default router;
