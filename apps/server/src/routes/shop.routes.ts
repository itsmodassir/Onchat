import { Router } from 'express';
import { shopController, familyController } from '../controllers/shop.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Wallet & Store
router.get('/wallet', shopController.getWallet);
router.post('/recharge', shopController.recharge);
router.post('/exchange', shopController.exchange);
router.get('/store', shopController.getStoreItems);
router.post('/store/buy', shopController.buyItem);
router.post('/spin', shopController.spin);

// Family
router.post('/family', familyController.create);
router.post('/family/join', familyController.join);
router.get('/family/:familyId', familyController.getInfo);

export default router;
