import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/send-otp', authController.sendOtp);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/setup-admin-internal', authController.setupAdmin);
router.patch('/update', authMiddleware, authController.updateProfile);
router.patch('/push-token', authMiddleware, authController.savePushToken);
router.get('/me', authMiddleware, authController.me);

export default router;
