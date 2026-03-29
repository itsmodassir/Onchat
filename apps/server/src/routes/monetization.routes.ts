import { Router } from 'express';
import { monetizationService } from '../services/monetization.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Get creator earnings stats
router.get('/creator-stats', async (req: any, res) => {
  try {
    const stats = await monetizationService.getCreatorStats(req.user.userId);
    res.json(stats);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Request withdrawal
router.post('/withdraw', async (req: any, res) => {
  try {
    const { amount, method, details } = req.body;
    if (!amount || !method || !details) throw new Error('Missing withdrawal info');
    
    const request = await monetizationService.requestWithdrawal(
      req.user.userId,
      amount,
      method,
      details
    );
    res.status(201).json(request);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
