import { prisma } from '../utils/db';
import { logger } from '../utils/logger';

const LEVEL_XP_TABLE: number[] = [
  0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5700, // levels 1-10
  7500, 9800, 12600, 16000, 20000, 25000, 31000, 38500, 47500, 58000, // levels 11-20
];

const BADGES = {
  FIRST_ROOM: { label: '🎙️ First Room', condition: 'Hosted your first room' },
  LEVEL_5: { label: '⬆️ Level 5', condition: 'Reached level 5' },
  LEVEL_10: { label: '🔥 Level 10', condition: 'Reached level 10' },
  TOP_GIFTER: { label: '🎁 Top Gifter', condition: 'Sent 10 gifts' },
  DAILY_7: { label: '📅 Weekly Streak', condition: 'Claimed daily reward 7 days in a row' },
  COIN_RICH: { label: '💰 Coin Rich', condition: 'Accumulated 10,000 coins' },
};

const DAILY_REWARDS = [
  { day: 1, coins: 50, diamonds: 0 },
  { day: 2, coins: 100, diamonds: 0 },
  { day: 3, coins: 150, diamonds: 1 },
  { day: 4, coins: 200, diamonds: 0 },
  { day: 5, coins: 250, diamonds: 2 },
  { day: 6, coins: 300, diamonds: 0 },
  { day: 7, coins: 500, diamonds: 5 }, // big bonus on day 7
];

export const gamificationService = {
  async awardXP(userId: string, amount: number, reason: string) {
    const user = await (prisma.user as any).update({
      where: { id: userId },
      data: { exp: { increment: amount } },
    });

    // Check for level up
    const newLevel = LEVEL_XP_TABLE.findIndex((xp) => xp > user.exp);
    const calculatedLevel = newLevel === -1 ? LEVEL_XP_TABLE.length : newLevel;

    if (calculatedLevel > user.level) {
      await (prisma.user as any).update({
        where: { id: userId },
        data: { level: calculatedLevel },
      });
      logger.info(`User ${userId} leveled up to ${calculatedLevel}`);

      // Award level badges
      if (calculatedLevel >= 5) {
        await this.awardBadge(userId, 'LEVEL_5');
      }
      if (calculatedLevel >= 10) {
        await this.awardBadge(userId, 'LEVEL_10');
      }
    }

    logger.info(`Awarded ${amount} XP to ${userId} for: ${reason}`);
    return user;
  },

  async awardBadge(userId: string, type: string) {
    try {
      await (prisma as any).badge.upsert({
        where: { userId_type: { userId, type } },
        update: {},
        create: { userId, type },
      });
      logger.info(`Badge ${type} awarded to ${userId}`);
    } catch {
      // already has badge — silently skip
    }
  },

  async getBadges(userId: string) {
    const badges = await (prisma as any).badge.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });
    return badges.map((b: any) => ({
      ...b,
      label: BADGES[b.type as keyof typeof BADGES]?.label || b.type,
      condition: BADGES[b.type as keyof typeof BADGES]?.condition || '',
    }));
  },

  async claimDailyReward(userId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let record = await (prisma as any).dailyReward.findUnique({ where: { userId } });

    if (!record) {
      record = await (prisma as any).dailyReward.create({
        data: { userId, streak: 0 },
      });
    }

    // Already claimed today?
    if (record.lastClaimedAt && record.lastClaimedAt >= todayStart) {
      throw new Error('Already claimed today. Come back tomorrow!');
    }

    // Check if streak is broken (missed yesterday)
    const yesterday = new Date(todayStart.getTime() - 86400000);
    const streakBroken = record.lastClaimedAt && record.lastClaimedAt < yesterday;
    const newStreak = streakBroken ? 1 : Math.min((record.streak || 0) + 1, 7);

    const rewardDay = ((newStreak - 1) % 7); // 0-6
    const reward = DAILY_REWARDS[rewardDay];

    await (prisma as any).dailyReward.update({
      where: { userId },
      data: { streak: newStreak, lastClaimedAt: now },
    });

    // Credit rewards
    await (prisma.user as any).update({
      where: { id: userId },
      data: {
        coins: { increment: reward.coins },
        diamonds: { increment: reward.diamonds },
      },
    });

    // Award weekly streak badge
    if (newStreak >= 7) {
      await this.awardBadge(userId, 'DAILY_7');
    }

    // Award XP for daily check-in
    await this.awardXP(userId, 25, 'daily_reward');

    return { reward, streak: newStreak, nextStreak: (newStreak % 7) + 1 };
  },

  async getDailyRewardStatus(userId: string) {
    const record = await (prisma as any).dailyReward.findUnique({ where: { userId } });
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const claimed = record?.lastClaimedAt && record.lastClaimedAt >= todayStart;
    return {
      streak: record?.streak || 0,
      claimed,
      rewards: DAILY_REWARDS,
      nextRewardDay: record ? ((record.streak % 7)) : 0,
    };
  },

  async getLeaderboard(type: 'COINS' | 'LEVEL' | 'ROOMS_HOSTED', limit = 50) {
    if (type === 'ROOMS_HOSTED') {
      const users = await (prisma.user as any).findMany({
        where: { isBanned: false },
        select: {
          id: true, name: true, avatar: true, shortId: true, level: true,
          _count: { select: { rooms: true } },
        },
        orderBy: { rooms: { _count: 'desc' } },
        take: limit,
      });
      return users.map((u: any, i: number) => ({ ...u, rank: i + 1, value: u._count.rooms }));
    }

    const orderField = type === 'COINS' ? 'coins' : 'level';
    const users = await (prisma.user as any).findMany({
      where: { isBanned: false },
      select: {
        id: true, name: true, avatar: true, shortId: true,
        coins: true, level: true, exp: true,
      },
      orderBy: { [orderField]: 'desc' },
      take: limit,
    });

    return users.map((u: any, i: number) => ({
      ...u,
      rank: i + 1,
      value: type === 'COINS' ? u.coins : u.level,
    }));
  },
};
