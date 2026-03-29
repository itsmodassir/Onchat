import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
import { io } from '../index';

export const moderationService = {
  async reportUser(reporterId: string, targetUserId: string, reason: string) {
    if (reporterId === targetUserId) throw new Error('Cannot report yourself.');

    const report = await (prisma as any).report.create({
      data: { reporterId, targetUserId, reason },
    });

    logger.info(`Report created: ${reporterId} reported ${targetUserId} for: ${reason}`);
    return report;
  },

  async getReports(status?: string) {
    return await (prisma as any).report.findMany({
      where: status ? { status } : undefined,
      include: {
        reporter: { select: { id: true, name: true, avatar: true, email: true } },
        target: { select: { id: true, name: true, avatar: true, email: true, isBanned: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateReportStatus(reportId: string, status: 'REVIEWED' | 'DISMISSED') {
    return await (prisma as any).report.update({
      where: { id: reportId },
      data: { status },
    });
  },

  async banUser(adminId: string, targetUserId: string, durationHours?: number) {
    const bannedUntil = durationHours
      ? new Date(Date.now() + durationHours * 3600000)
      : null; // null = permanent

    const user = await (prisma.user as any).update({
      where: { id: targetUserId },
      data: { isBanned: true, bannedUntil },
    });

    // Force disconnect via socket
    try {
      io.emit(`force-logout-${targetUserId}`);
    } catch (e) {
      // socket may not be connected
    }

    logger.warn(`User ${targetUserId} banned by admin ${adminId}. Duration: ${durationHours || 'permanent'} hours`);
    return user;
  },

  async unbanUser(adminId: string, targetUserId: string) {
    const user = await (prisma.user as any).update({
      where: { id: targetUserId },
      data: { isBanned: false, bannedUntil: null },
    });
    logger.info(`User ${targetUserId} unbanned by admin ${adminId}`);
    return user;
  },

  async kickFromRoom(hostId: string, targetUserId: string, roomId: string) {
    try {
      io.to(roomId).emit('kick-user', { userId: targetUserId, roomId });
    } catch (e) {
      logger.error('Failed to emit kick-user event');
    }

    // Remove participant record
    await (prisma as any).participant.deleteMany({
      where: { userId: targetUserId, roomId },
    });

    logger.info(`User ${targetUserId} kicked from room ${roomId} by host ${hostId}`);
    return { success: true };
  },

  async checkBanStatus(userId: string) {
    const user = await (prisma.user as any).findUnique({
      where: { id: userId },
      select: { isBanned: true, bannedUntil: true },
    });

    if (!user?.isBanned) return { banned: false };

    // Auto-unban if temp ban expired
    if (user.bannedUntil && user.bannedUntil < new Date()) {
      await (prisma.user as any).update({
        where: { id: userId },
        data: { isBanned: false, bannedUntil: null },
      });
      return { banned: false };
    }

    return { banned: true, bannedUntil: user.bannedUntil };
  },

  async moderateMessage(content: string) {
    // Simple local filter for high-priority toxic words
    // In production, this would call Google Perspective API or OpenAI Moderation
    const toxicWords = ['spam', 'scam', 'hate', 'toxic', 'abuse']; // Placeholder list
    const lowerContent = content.toLowerCase();
    
    const matched = toxicWords.filter(word => lowerContent.includes(word));
    const isToxic = matched.length > 0;

    return {
      isToxic,
      score: isToxic ? 0.9 : 0.1,
      reason: isToxic ? `Contains flagged words: ${matched.join(', ')}` : null,
    };
  },
};
