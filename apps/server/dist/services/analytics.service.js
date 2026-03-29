"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const db_1 = require("../utils/db");
exports.analyticsService = {
    async getPlatformOverview() {
        const [userCount, roomCount, totalRevenue, pendingWithdrawals] = await Promise.all([
            db_1.prisma.user.count(),
            db_1.prisma.room.count({ where: { status: 'ACTIVE' } }),
            db_1.prisma.transaction.aggregate({
                where: { type: 'RECHARGE', status: 'COMPLETED' },
                _sum: { amount: true },
            }),
            db_1.prisma.withdrawalRequest.aggregate({
                where: { status: 'PENDING' },
                _sum: { amount: true },
            }),
        ]);
        // Get growth in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newUsersLast7Days = await db_1.prisma.user.count({
            where: { createdAt: { gte: sevenDaysAgo } },
        });
        const revenueLast7Days = await db_1.prisma.transaction.aggregate({
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
        const topRooms = await db_1.prisma.room.findMany({
            where: { status: 'ACTIVE' },
            take: 5,
            include: {
                host: { select: { name: true, avatar: true } },
                _count: { select: { participants: true } },
            },
            orderBy: { participants: { _count: 'desc' } },
        });
        // Recent 5 transactions
        const recentTransactions = await db_1.prisma.transaction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, avatar: true } } },
        });
        return {
            topRooms,
            recentTransactions,
        };
    },
    async getUserEngagement(userId) {
        const giftsSent = await db_1.prisma.transaction.aggregate({
            where: { userId, type: 'GIFT_SEND' },
            _sum: { amount: true }
        });
        const giftsReceived = await db_1.prisma.transaction.aggregate({
            where: { userId, type: 'GIFT_RECEIVE' },
            _sum: { amount: true }
        });
        return {
            totalSpent: giftsSent._sum.amount || 0,
            totalEarned: giftsReceived._sum.amount || 0,
        };
    }
};
