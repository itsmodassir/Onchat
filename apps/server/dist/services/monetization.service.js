"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monetizationService = void 0;
const db_1 = require("../utils/db");
const client_1 = require("@prisma/client");
exports.monetizationService = {
    async recharge(userId, amount, coins) {
        return await db_1.prisma.$transaction(async (tx) => {
            // 1. Create transaction record
            await tx.transaction.create({
                data: {
                    userId,
                    amount,
                    type: client_1.TransactionType.RECHARGE,
                    status: 'COMPLETED',
                },
            });
            // 2. Update user coins
            return await tx.user.update({
                where: { id: userId },
                data: {
                    coins: { increment: coins },
                },
            });
        });
    },
    async spin(userId, stake) {
        const prizes = [
            { name: '10 Coins', type: 'COIN', value: 10 },
            { name: '50 Coins', type: 'COIN', value: 50 },
            { name: '100 Coins', type: 'COIN', value: 100 },
            { name: '500 Coins', type: 'COIN', value: 500 },
            { name: 'Headwear', type: 'ASSET', value: 'headwear_1' },
            { name: 'Try Again', type: 'NONE', value: 0 },
        ];
        return await db_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user || user.coins < stake)
                throw new Error('Insufficient coins');
            await tx.user.update({
                where: { id: userId },
                data: { coins: { decrement: stake } },
            });
            const win = prizes[Math.floor(Math.random() * prizes.length)];
            if (win.type === 'COIN') {
                await tx.user.update({
                    where: { id: userId },
                    data: { coins: { increment: win.value } },
                });
            }
            await tx.transaction.create({
                data: { userId, amount: -stake, type: 'PURCHASE', status: 'SPIN' },
            });
            return { prize: win };
        });
    },
    async exchangeDiamonds(userId, diamonds, coins) {
        return await db_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user || user.diamonds < diamonds) {
                throw new Error('Insufficient diamonds');
            }
            // 1. Deduct diamonds and add coins
            await tx.user.update({
                where: { id: userId },
                data: {
                    diamonds: { decrement: diamonds },
                    coins: { increment: coins },
                },
            });
            // 2. Log transaction
            return await tx.transaction.create({
                data: {
                    userId,
                    amount: diamonds,
                    type: client_1.TransactionType.EXCHANGE,
                },
            });
        });
    },
    async sendGift(fromUserId, toUserId, coinAmount) {
        return await db_1.prisma.$transaction(async (tx) => {
            const sender = await tx.user.findUnique({ where: { id: fromUserId } });
            if (!sender || sender.coins < coinAmount) {
                throw new Error('Insufficient coins');
            }
            // 1. Deduct from sender
            await tx.user.update({
                where: { id: fromUserId },
                data: { coins: { decrement: coinAmount } },
            });
            // 2. Add to recipient
            await tx.user.update({
                where: { id: toUserId },
                data: { coins: { increment: coinAmount } },
            });
            // 3. Log transactions
            await tx.transaction.create({
                data: { userId: fromUserId, amount: -coinAmount, type: 'GIFT_SEND' },
            });
            await tx.transaction.create({
                data: { userId: toUserId, amount: coinAmount, type: 'GIFT_RECEIVE' },
            });
            return { success: true };
        });
    },
    async getWallet(userId) {
        return await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                coins: true,
                diamonds: true,
                crystals: true,
            },
        });
    },
    async getCreatorStats(userId) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: { diamonds: true },
        });
        const pendingWithdrawals = await db_1.prisma.withdrawalRequest.aggregate({
            where: { userId, status: 'PENDING' },
            _sum: { amount: true },
        });
        const totalWithdrawn = await db_1.prisma.withdrawalRequest.aggregate({
            where: { userId, status: 'APPROVED' },
            _sum: { amount: true },
        });
        return {
            currentDiamonds: user?.diamonds || 0,
            pendingDiamonds: pendingWithdrawals._sum.amount || 0,
            totalWithdrawnDiamonds: totalWithdrawn._sum.amount || 0,
            lifetimeEarnings: (user?.diamonds || 0) + (totalWithdrawn._sum.amount || 0) + (pendingWithdrawals._sum.amount || 0),
        };
    },
    async requestWithdrawal(userId, amount, method, details) {
        return await db_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user || user.diamonds < amount) {
                throw new Error('Insufficient diamonds for withdrawal');
            }
            // 1. Deduct diamonds
            await tx.user.update({
                where: { id: userId },
                data: { diamonds: { decrement: amount } },
            });
            // 2. Create withdrawal request
            const request = await tx.withdrawalRequest.create({
                data: {
                    userId,
                    amount,
                    paymentMethod: method,
                    paymentDetails: details,
                    status: 'PENDING',
                },
            });
            // 3. Log transaction
            await tx.transaction.create({
                data: {
                    userId,
                    amount: -amount,
                    type: 'WITHDRAWAL',
                    status: 'PENDING',
                },
            });
            return request;
        });
    },
};
