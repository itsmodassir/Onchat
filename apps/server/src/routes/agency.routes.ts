import { Router } from 'express';
import { agencyService } from '../services/agency.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/stats', async (req: any, res) => {
  try {
    const stats = await agencyService.getAgencyStats(req.user.userId);
    res.json(stats);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/create', async (req: any, res) => {
  try {
    const { name } = req.body;
    const agency = await agencyService.createAgency(req.user.userId, name);
    res.json(agency);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
