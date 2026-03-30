import { Router } from 'express';
import { gameService } from '../services/game.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.post('/griddy/play', async (req: any, res) => {
  try {
    const { betAmount } = req.body;
    const result = await gameService.playGriddy(req.user.userId, betAmount);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/griddy/history', async (req, res) => {
  try {
    const history = await gameService.getRecentWins();
    res.json(history);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
