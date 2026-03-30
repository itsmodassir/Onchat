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

  async getDetailedAnalytics(req: Request, res: Response) {
    try {
      const analytics = await adminService.getDetailedAnalytics();
      res.json(analytics);
    } catch (error: any) {
      logger.error('ADMIN_GET_DETAILED_ANALYTICS_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const user = await adminService.updateUser(userId, req.body);
      res.json(user);
    } catch (error: any) {
      logger.error('ADMIN_UPDATE_USER_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      await adminService.deleteUser(userId);
      res.json({ success: true });
    } catch (error: any) {
      logger.error('ADMIN_DELETE_USER_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async banUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { isBanned } = req.body;
      const user = await adminService.toggleUserBan(userId, isBanned);
      res.json(user);
    } catch (error: any) {
      logger.error('ADMIN_BAN_USER_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getActivityStream(req: Request, res: Response) {
    try {
      const stream = await adminService.getGlobalActivityStream();
      res.json(stream);
    } catch (error: any) {
      logger.error('ADMIN_GET_ACTIVITY_STREAM_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getSettings(req: Request, res: Response) {
    try {
      const settings = await adminService.getSystemConfigs();
      res.json(settings);
    } catch (error: any) {
      logger.error('ADMIN_GET_SETTINGS_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async updateSettings(req: Request, res: Response) {
    try {
      const { key, value } = req.body;
      const setting = await adminService.updateSystemConfig(key, value);
      res.json(setting);
    } catch (error: any) {
      logger.error('ADMIN_UPDATE_SETTINGS_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getIdentityLogs(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const logs = await adminService.getIdentityLogs(userId);
      res.json(logs);
    } catch (error: any) {
      logger.error('ADMIN_GET_IDENTITY_LOGS_ERROR:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
