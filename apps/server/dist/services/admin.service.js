"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const db_1 = require("../utils/db");
exports.adminService = {
    async getAllUsers() {
        return await db_1.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
    },
    async updateUserBalance(userId, data) {
        return await db_1.prisma.user.update({
            where: { id: userId },
            data: {
                coins: data.coins !== undefined ? { set: data.coins } : undefined,
                diamonds: data.diamonds !== undefined ? { set: data.diamonds } : undefined,
                crystals: data.crystals !== undefined ? { set: data.crystals } : undefined,
            },
        });
    },
    async addCoins(userId, amount) {
        if (amount <= 0)
            throw new Error('Amount must be positive');
        return await db_1.prisma.user.update({
            where: { id: userId },
            data: {
                coins: { increment: amount }
            }
        });
    },
    async toggleReseller(userId, isReseller) {
        return await db_1.prisma.user.update({
            where: { id: userId },
            data: { isReseller },
        });
    },
    async getAdminStats() {
        const userCount = await db_1.prisma.user.count();
        const roomCount = await db_1.prisma.room.count();
        const familyCount = await db_1.prisma.family.count();
        const transactions = await db_1.prisma.transaction.aggregate({
            _sum: { amount: true },
        });
        const agencies = await db_1.prisma.agency.count();
        const couples = await db_1.prisma.couple.count();
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
        const agencies = await db_1.prisma.agency.findMany({
            include: {
                owner: { select: { name: true, shortId: true } },
                _count: { select: { members: true } }
            }
        });
        const cpCouples = await db_1.prisma.couple.findMany({
            include: {
                user1: { select: { name: true, shortId: true, avatar: true } },
                user2: { select: { name: true, shortId: true, avatar: true } }
            },
            orderBy: { points: 'desc' },
            take: 20
        });
        const gameLogs = await db_1.prisma.griddyBet.findMany({
            include: { user: { select: { name: true, shortId: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        const financeLogs = await db_1.prisma.transaction.findMany({
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
