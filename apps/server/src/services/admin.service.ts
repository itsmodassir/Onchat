import { prisma } from '../utils/db';
import { logger } from '../utils/logger';

export const adminService = {
  async getAllUsers() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateUserBalance(userId: string, data: { coins?: number, diamonds?: number, crystals?: number }) {
    return await (prisma.user as any).update({
      where: { id: userId },
      data: {
        coins: data.coins !== undefined ? { set: data.coins } : undefined,
        diamonds: data.diamonds !== undefined ? { set: data.diamonds } : undefined,
        crystals: data.crystals !== undefined ? { set: data.crystals } : undefined,
      },
    });
  },

  async addCoins(userId: string, amount: number) {
    if (amount <= 0) throw new Error('Amount must be positive');
    return await (prisma.user as any).update({
      where: { id: userId },
      data: {
        coins: { increment: amount }
      }
    });
  },

  async toggleReseller(userId: string, isReseller: boolean) {
    return await (prisma.user as any).update({
      where: { id: userId },
      data: { isReseller },
    });
  },

  async getAdminStats() {
    const userCount = await prisma.user.count();
    const roomCount = await prisma.room.count();
    const familyCount = await prisma.family.count();
    const transactions = await prisma.transaction.aggregate({
      _sum: { amount: true },
    });

    const agencies = await prisma.agency.count();
    const couples = await prisma.couple.count();

    return {
      userCount,
      roomCount,
      familyCount,
      agencyCount: agencies,
      coupleCount: couples,
      totalRevenue: transactions._sum.amount || 0,
    };
  },

  async getDetailedAnalytics() {
    const agencies = await prisma.agency.findMany({
      include: { 
        owner: { select: { name: true, shortId: true } },
        _count: { select: { members: true } }
      }
    });

    const cpCouples = await prisma.couple.findMany({
      include: {
        user1: { select: { name: true, shortId: true, avatar: true } },
        user2: { select: { name: true, shortId: true, avatar: true } }
      },
      orderBy: { points: 'desc' },
      take: 20
    });

    const gameLogs = await prisma.griddyBet.findMany({
      include: { user: { select: { name: true, shortId: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const financeLogs = await prisma.transaction.findMany({
      where: { type: { in: ['RECHARGE', 'WITHDRAWAL', 'RESELLER_TRANSFER'] } },
      include: { user: { select: { name: true, shortId: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return {
      agencies,
      cpCouples,
      gameLogs,
      financeLogs
    };
  }
};
