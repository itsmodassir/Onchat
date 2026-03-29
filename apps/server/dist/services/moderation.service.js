"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderationService = void 0;
const db_1 = require("../utils/db");
const logger_1 = require("../utils/logger");
const index_1 = require("../index");
exports.moderationService = {
    async reportUser(reporterId, targetUserId, reason) {
        if (reporterId === targetUserId)
            throw new Error('Cannot report yourself.');
        const report = await db_1.prisma.report.create({
            data: { reporterId, targetUserId, reason },
        });
        logger_1.logger.info(`Report created: ${reporterId} reported ${targetUserId} for: ${reason}`);
        return report;
    },
    async getReports(status) {
        return await db_1.prisma.report.findMany({
            where: status ? { status } : undefined,
            include: {
                reporter: { select: { id: true, name: true, avatar: true, email: true } },
                target: { select: { id: true, name: true, avatar: true, email: true, isBanned: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    async updateReportStatus(reportId, status) {
        return await db_1.prisma.report.update({
            where: { id: reportId },
            data: { status },
        });
    },
    async banUser(adminId, targetUserId, durationHours) {
        const bannedUntil = durationHours
            ? new Date(Date.now() + durationHours * 3600000)
            : null; // null = permanent
        const user = await db_1.prisma.user.update({
            where: { id: targetUserId },
            data: { isBanned: true, bannedUntil },
        });
        // Force disconnect via socket
        try {
            index_1.io.emit(`force-logout-${targetUserId}`);
        }
        catch (e) {
            // socket may not be connected
        }
        logger_1.logger.warn(`User ${targetUserId} banned by admin ${adminId}. Duration: ${durationHours || 'permanent'} hours`);
        return user;
    },
    async unbanUser(adminId, targetUserId) {
        const user = await db_1.prisma.user.update({
            where: { id: targetUserId },
            data: { isBanned: false, bannedUntil: null },
        });
        logger_1.logger.info(`User ${targetUserId} unbanned by admin ${adminId}`);
        return user;
    },
    async kickFromRoom(hostId, targetUserId, roomId) {
        try {
            index_1.io.to(roomId).emit('kick-user', { userId: targetUserId, roomId });
        }
        catch (e) {
            logger_1.logger.error('Failed to emit kick-user event');
        }
        // Remove participant record
        await db_1.prisma.participant.deleteMany({
            where: { userId: targetUserId, roomId },
        });
        logger_1.logger.info(`User ${targetUserId} kicked from room ${roomId} by host ${hostId}`);
        return { success: true };
    },
    async checkBanStatus(userId) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: { isBanned: true, bannedUntil: true },
        });
        if (!user?.isBanned)
            return { banned: false };
        // Auto-unban if temp ban expired
        if (user.bannedUntil && user.bannedUntil < new Date()) {
            await db_1.prisma.user.update({
                where: { id: userId },
                data: { isBanned: false, bannedUntil: null },
            });
            return { banned: false };
        }
        return { banned: true, bannedUntil: user.bannedUntil };
    },
    async moderateMessage(content) {
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
