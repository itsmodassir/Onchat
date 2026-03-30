import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export const userController = {
  /**
   * Get public profile by query string (id or shortId)
   */
  async getProfile(req: Request, res: Response) {
    try {
      const { query } = req.params;
      const profile = await UserService.getProfile(query);
      res.json(profile);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  /**
   * Search users by keyword
   */
  async searchUsers(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const users = await UserService.searchUsers(q);
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Update current user's bio
   */
  async updateBio(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { bio } = req.body;
      const { prisma } = await import('../utils/db');
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { bio }
      });
      res.json(updatedUser);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Get top creators
   */
  async getTopCreators(req: Request, res: Response) {
    try {
      const creators = await UserService.getTopCreators();
      res.json(creators);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
