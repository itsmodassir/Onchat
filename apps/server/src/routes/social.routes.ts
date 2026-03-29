import { Router } from 'express';
import { socialController } from '../controllers/social.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/follow', socialController.follow);
router.delete('/unfollow/:userId', socialController.unfollow);
router.get('/followers/:userId', socialController.getFollowers);
router.get('/following/:userId', socialController.getFollowing);
router.get('/friends', socialController.getFriends);

// Tier 3: AI Personalization
router.patch('/interests', async (req: any, res) => {
  try {
    const { prisma } = await import('../utils/db');
    const { interests } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { interests } as any
    });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/recommended-rooms', async (req: any, res) => {
  try {
    const { recommendationService } = await import('../services/recommendation.service');
    const rooms = await recommendationService.getUserRecommendations(req.user.userId);
    res.json(rooms);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
