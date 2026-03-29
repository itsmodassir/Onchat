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

    return {
      userCount,
      roomCount,
      familyCount,
      totalRevenue: transactions._sum.amount || 0,
    };
  },
};
