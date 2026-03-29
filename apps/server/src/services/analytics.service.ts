import { prisma } from '../utils/db';

export const analyticsService = {
  async getPlatformOverview() {
    const [userCount, roomCount, totalRevenue, pendingWithdrawals] = await Promise.all([
      prisma.user.count(),
      prisma.room.count({ where: { status: 'ACTIVE' } }),
      prisma.transaction.aggregate({
        where: { type: 'RECHARGE', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      (prisma as any).withdrawalRequest.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
    ]);

    // Get growth in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsersLast7Days = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    const revenueLast7Days = await prisma.transaction.aggregate({
      where: { 
        type: 'RECHARGE', 
        status: 'COMPLETED',
        createdAt: { gte: sevenDaysAgo }
      },
      _sum: { amount: true },
    });

    return {
      totalUsers: userCount,
      activeRooms: roomCount,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingWithdrawalAmount: pendingWithdrawals._sum.amount || 0,
      growth: {
        newUsers7d: newUsersLast7Days,
        revenue7d: revenueLast7Days._sum.amount || 0,
      },
      timestamp: new Date().toISOString(),
    };
  },

  async getRecentActivity() {
    // Top 5 active rooms by participant count
    const topRooms = await prisma.room.findMany({
      where: { status: 'ACTIVE' },
      take: 5,
      include: {
        host: { select: { name: true, avatar: true } },
        _count: { select: { participants: true } },
      },
      orderBy: { participants: { _count: 'desc' } },
    });

    // Recent 5 transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, avatar: true } } },
    });

    return {
      topRooms,
      recentTransactions,
    };
  },

  async getUserEngagement(userId: string) {
    const giftsSent = await prisma.transaction.aggregate({
        where: { userId, type: 'GIFT_SEND' },
        _sum: { amount: true }
    });

    const giftsReceived = await prisma.transaction.aggregate({
        where: { userId, type: 'GIFT_RECEIVE' },
        _sum: { amount: true }
    });

    return {
        totalSpent: giftsSent._sum.amount || 0,
        totalEarned: giftsReceived._sum.amount || 0,
    };
  }
};
