import { Request, Response } from 'express';
import { resellerService } from '../services/reseller.service';

export const resellerController = {
  async transferCoins(req: any, res: Response) {
    try {
      const { targetShortId, amount } = req.body;
      const result = await resellerService.transferCoins(req.user.userId, targetShortId, amount);
      res.json({ success: true, transactions: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getStats(req: any, res: Response) {
    try {
      const stats = await resellerService.getResellerStats(req.user.userId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
