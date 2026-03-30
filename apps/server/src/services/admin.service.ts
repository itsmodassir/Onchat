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

  async updateUser(userId: string, data: any) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        bio: data.bio,
        shortId: data.shortId
      }
    });
  },

  async deleteUser(userId: string) {
    return await prisma.user.delete({
      where: { id: userId }
    });
  },

  async toggleUserBan(userId: string, isBanned: boolean) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isBanned }
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
  },

  async getGlobalActivityStream() {
    const [transactions, gameLogs, reports, participants] = await Promise.all([
      prisma.transaction.findMany({ take: 20, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, shortId: true } } } }),
      prisma.griddyBet.findMany({ take: 20, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, shortId: true } } } }),
      prisma.report.findMany({ take: 20, orderBy: { createdAt: 'desc' }, include: { reporter: { select: { name: true } }, target: { select: { name: true } } } }),
      prisma.participant.findMany({ take: 20, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, shortId: true } }, room: { select: { title: true } } } })
    ]);

    // Format all into a unified stream
    const stream = [
      ...transactions.map(t => ({ id: t.id, type: 'FINANCE', content: `${t.user.name} processed ${t.amount} assets (${t.type})`, createdAt: t.createdAt })),
      ...gameLogs.map(g => ({ id: g.id, type: 'GAME', content: `${g.user.name} bet ${g.amount} coins and ${g.won ? 'WON' : 'LOST'}`, createdAt: g.createdAt })),
      ...reports.map(r => ({ id: r.id, type: 'MODERATION', content: `${r.reporter.name} reported ${r.target.name}: ${r.reason}`, createdAt: r.createdAt })),
      ...participants.map(p => ({ id: p.id, type: 'SOCIAL', content: `${p.user.name} joined room: ${p.room.title}`, createdAt: p.createdAt }))
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return stream;
  },

  async getSystemConfigs() {
    return (prisma as any).systemConfig.findMany();
  },

  async updateSystemConfig(key: string, value: string) {
    return (prisma as any).systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  },

  async getIdentityLogs(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Identity not found');
    
    return (prisma as any).otp.findMany({
      where: { email: user.email },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }
};
