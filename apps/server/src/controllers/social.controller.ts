import { Request, Response } from 'express';
import { socialService } from '../services/social.service';

export const socialController = {
  async follow(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const followerId = (req as any).user.id;
      const result = await socialService.follow(followerId, userId);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async unfollow(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const followerId = (req as any).user.id;
      await socialService.unfollow(followerId, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getFollowers(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const followers = await socialService.getFollowers(userId);
      res.json(followers);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getFollowing(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const following = await socialService.getFollowing(userId);
      res.json(following);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getFriends(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const friends = await socialService.getFriends(userId);
      res.json(friends);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
