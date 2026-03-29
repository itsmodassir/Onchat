import { prisma } from '../utils/db';
import { logger } from '../utils/logger';

export const socialService = {
  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('You cannot follow yourself');
    }

    try {
      return await (prisma as any).follow.create({
        data: {
          followerId,
          followingId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Already following this user');
      }
      throw error;
    }
  },

  async unfollow(followerId: string, followingId: string) {
    try {
      return await (prisma as any).follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
    } catch (error: any) {
      throw new Error('Follow record not found');
    }
  },

  async getFollowers(userId: string) {
    return await (prisma as any).follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            avatar: true,
            level: true,
          },
        },
      },
    });
  },

  async getFollowing(userId: string) {
    return await (prisma as any).follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            avatar: true,
            level: true,
          },
        },
      },
    });
  },

  async getFriends(userId: string) {
    // Friends are mutual follows
    const following = await (prisma as any).follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f: { followingId: string }) => f.followingId);

    const friends = await (prisma as any).follow.findMany({
      where: {
        followerId: { in: followingIds },
        followingId: userId,
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            avatar: true,
            level: true,
          },
        },
      },
    });

    return friends.map((f: any) => f.follower);
  },
};
