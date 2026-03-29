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
        return {
            userCount,
            roomCount,
            familyCount,
            totalRevenue: transactions._sum.amount || 0,
        };
    },
};
