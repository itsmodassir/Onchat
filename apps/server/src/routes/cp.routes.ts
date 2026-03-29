import { Router } from 'express';
import { cpService } from '../services/cp.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/status', async (req: any, res) => {
  try {
    const status = await cpService.getStatus(req.user.userId);
    res.json(status);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/request', async (req: any, res) => {
  try {
    const { targetShortId } = req.body;
    const request = await cpService.requestCP(req.user.userId, targetShortId);
    res.json(request);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
