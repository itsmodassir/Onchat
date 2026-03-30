import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public/Authenticated Profile viewing
router.get('/profile/:query', authMiddleware, userController.getProfile);

// User search
router.get('/search', authMiddleware, userController.searchUsers);

// Profile updates
router.patch('/bio', authMiddleware, userController.updateBio);

export default router;
