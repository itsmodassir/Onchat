import { Router } from 'express';
import { gamificationService } from '../services/gamification.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Leaderboard — public within auth
router.get('/leaderboard', async (req: any, res) => {
  try {
    const type = (req.query.type as string)?.toUpperCase() || 'COINS';
    const limit = parseInt(req.query.limit as string) || 50;
    const data = await gamificationService.getLeaderboard(type as any, limit);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Daily reward claim
router.post('/daily-reward', async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const result = await gamificationService.claimDailyReward(userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Daily reward status
router.get('/daily-reward', async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const status = await gamificationService.getDailyRewardStatus(userId);
    res.json(status);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// User badges
router.get('/badges/:userId', async (req, res) => {
  try {
    const badges = await gamificationService.getBadges(req.params.userId);
    res.json(badges);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
