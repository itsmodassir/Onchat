import { prisma } from '../utils/db';

export class UserService {
  /**
   * Get public profile by ID or shortId
   */
  static async getProfile(query: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: query },
          { shortId: query }
        ]
      },
      select: {
        id: true,
        shortId: true,
        name: true,
        avatar: true,
        level: true,
        bio: true,
        coins: true,
        diamonds: true,
        _count: {
          select: {
            followers: true,
            following: true
          }
        },
        rooms: {
          where: { status: 'ACTIVE' },
          take: 1
        },
        family: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    if (!user) throw new Error('User not found');
    return user;
  }

  /**
   * Search users by name or shortId
   */
  static async searchUsers(query: string) {
    return prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { shortId: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        shortId: true,
        name: true,
        avatar: true,
        level: true
      },
      take: 20
    });
  }

  /**
   * Update user profile stats (reputation, etc.)
   */
  static async updateReputation(userId: string, points: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { reputationScore: { increment: points } }
    });
  }

  /**
   * Get top creators for dashboard scroller
   */
  static async getTopCreators() {
    return prisma.user.findMany({
      take: 10,
      orderBy: {
        level: 'desc'
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        level: true,
        shortId: true
      }
    });
  }
}
