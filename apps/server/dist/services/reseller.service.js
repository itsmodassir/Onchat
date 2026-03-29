"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resellerService = void 0;
const db_1 = require("../utils/db");
exports.resellerService = {
    async transferCoins(resellerId, targetShortId, amount) {
        const reseller = await db_1.prisma.user.findUnique({ where: { id: resellerId } });
        if (!reseller || !reseller.isReseller)
            throw new Error('Not a reseller');
        if (reseller.coins < amount)
            throw new Error('Insufficient coins in reseller wallet');
        const targetUser = await db_1.prisma.user.findUnique({ where: { shortId: targetShortId } });
        if (!targetUser)
            throw new Error('Target user not found');
        return await db_1.prisma.$transaction([
            // Deduct from reseller
            db_1.prisma.user.update({
                where: { id: resellerId },
                data: { coins: { decrement: amount } }
            }),
            // Credit to user
            db_1.prisma.user.update({
                where: { id: targetUser.id },
                data: { coins: { increment: amount } }
            }),
            // Log transaction
            db_1.prisma.transaction.create({
                data: {
                    userId: targetUser.id,
                    amount: amount,
                    type: 'RESELLER_TRANSFER',
                    status: 'COMPLETED',
                    notes: `Received ${amount} coins from reseller ${reseller.shortId}`
                }
            }),
            // Log for reseller too
            db_1.prisma.transaction.create({
                data: {
                    userId: resellerId,
                    amount: -amount,
                    type: 'RESELLER_TRANSFER',
                    status: 'COMPLETED',
                    notes: `Transferred ${amount} coins to ${targetShortId}`
                }
            })
        ]);
    },
    async getResellerStats(resellerId) {
        const reseller = await db_1.prisma.user.findUnique({
            where: { id: resellerId },
            include: {
                transactions: {
                    where: { type: 'RESELLER_TRANSFER' },
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        });
        return reseller;
    }
};
