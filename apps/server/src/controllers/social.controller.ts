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

  async getConversations(req: Request, res: Response) {
    try {
      const { prisma } = await import('../utils/db');
      const userId = (req as any).user.id;

      // Get unique users the current user has chatted with
      const conversations = await prisma.privateMessage.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, name: true, avatar: true, shortId: true } },
          receiver: { select: { id: true, name: true, avatar: true, shortId: true } }
        }
      }) as any;

      // Group by user and get latest message
      const latestMessages = new Map<string, any>();
      conversations.forEach((msg: any) => {
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        if (!latestMessages.has(otherUser.id)) {
          latestMessages.set(otherUser.id, {
            id: otherUser.id,
            name: otherUser.name,
            avatar: otherUser.avatar,
            shortId: otherUser.shortId,
            lastMessage: msg.content,
            time: msg.createdAt,
            unread: msg.receiverId === userId && !msg.isRead ? 1 : 0
          });
        }
      });

      res.json(Array.from(latestMessages.values()));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getMessageHistory(req: Request, res: Response) {
    try {
      const { prisma } = await import('../utils/db');
      const userId = (req as any).user.id;
      const { targetUserId } = req.params;

      const messages = await prisma.privateMessage.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: userId }
          ]
        },
        orderBy: { createdAt: 'asc' },
        take: 50 // Latest 50 messages
      });

      // Mark as read
      await prisma.privateMessage.updateMany({
        where: { senderId: targetUserId, receiverId: userId, isRead: false },
        data: { isRead: true }
      });

      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
