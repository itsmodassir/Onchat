import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { logger } from '../utils/logger';

export const adminController = {
  async getUsers(req: Request, res: Response) {
    try {
      const users = await adminService.getAllUsers();
      res.json(users);
    } catch (error: any) {
      logger.error('ADMIN_GET_USERS_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateBalance(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { coins, diamonds, crystals } = req.body;
      const user = await adminService.updateUserBalance(userId, { coins, diamonds, crystals });
      res.json(user);
    } catch (error: any) {
      logger.error('ADMIN_UPDATE_BALANCE_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async addCoins(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid coin amount' });
      }
      const user = await adminService.addCoins(userId, amount);
      res.json(user);
    } catch (error: any) {
      logger.error('ADMIN_ADD_COINS_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async toggleReseller(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { isReseller } = req.body;
      const user = await adminService.toggleReseller(userId, isReseller);
      res.json(user);
    } catch (error: any) {
      logger.error('ADMIN_TOGGLE_RESELLER_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      logger.error('ADMIN_GET_STATS_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
