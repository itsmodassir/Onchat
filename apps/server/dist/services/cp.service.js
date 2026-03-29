"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cpService = void 0;
const db_1 = require("../utils/db");
exports.cpService = {
    async getStatus(userId) {
        return await db_1.prisma.couple.findFirst({
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
    async requestCP(userId, targetShortId) {
        const targetUser = await db_1.prisma.user.findUnique({
            where: { shortId: targetShortId },
        });
        if (!targetUser)
            throw new Error('User not found');
        if (targetUser.id === userId)
            throw new Error('Cannot be CP with yourself');
        const existing = await db_1.prisma.couple.findFirst({
            where: {
                OR: [
                    { user1Id: userId, user2Id: targetUser.id },
                    { user1Id: targetUser.id, user2Id: userId },
                ],
            },
        });
        if (existing)
            throw new Error('CP relationship already exists or pending');
        return await db_1.prisma.couple.create({
            data: {
                user1Id: userId,
                user2Id: targetUser.id,
                status: 'ACCEPTED', // Auto-accepting for now to simplify, or set to PENDING
            },
        });
    },
    async addPoints(userId, targetUserId, points) {
        const couple = await db_1.prisma.couple.findFirst({
            where: {
                OR: [
                    { user1Id: userId, user2Id: targetUserId },
                    { user1Id: targetUserId, user2Id: userId },
                ],
                status: 'ACCEPTED',
            },
        });
        if (!couple)
            return;
        const newPoints = couple.points + points;
        const newLevel = Math.floor(Math.sqrt(newPoints / 100)) + 1;
        return await db_1.prisma.couple.update({
            where: { id: couple.id },
            data: {
                points: newPoints,
                level: newLevel,
            },
        });
    },
};
