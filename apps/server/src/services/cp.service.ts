import { prisma } from '../utils/db';

export const cpService = {
  async getStatus(userId: string) {
    return await prisma.couple.findFirst({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
        status: 'ACCEPTED',
      },
      include: {
        user1: { select: { id: true, name: true, avatar: true, shortId: true } },
        user2: { select: { id: true, name: true, avatar: true, shortId: true } },
      },
    });
  },

  async requestCP(userId: string, targetShortId: string) {
    const targetUser = await prisma.user.findUnique({
      where: { shortId: targetShortId },
    });

    if (!targetUser) throw new Error('User not found');
    if (targetUser.id === userId) throw new Error('Cannot be CP with yourself');

    const existing = await prisma.couple.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUser.id },
          { user1Id: targetUser.id, user2Id: userId },
        ],
      },
    });

    if (existing) throw new Error('CP relationship already exists or pending');

    return await prisma.couple.create({
      data: {
        user1Id: userId,
        user2Id: targetUser.id,
        status: 'ACCEPTED', // Auto-accepting for now to simplify, or set to PENDING
      },
    });
  },

  async addPoints(userId: string, targetUserId: string, points: number) {
    const couple = await prisma.couple.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId },
        ],
        status: 'ACCEPTED',
      },
    });

    if (!couple) return;

    const newPoints = couple.points + points;
    const newLevel = Math.floor(Math.sqrt(newPoints / 100)) + 1;

    return await prisma.couple.update({
      where: { id: couple.id },
      data: {
        points: newPoints,
        level: newLevel,
      },
    });
  },
};
