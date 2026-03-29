import { prisma } from '../utils/db';

export const resellerService = {
  async transferCoins(resellerId: string, targetShortId: string, amount: number) {
    const reseller = await prisma.user.findUnique({ where: { id: resellerId } });
    if (!reseller || !reseller.isReseller) throw new Error('Not a reseller');
    if (reseller.coins < amount) throw new Error('Insufficient coins in reseller wallet');

    const targetUser = await prisma.user.findUnique({ where: { shortId: targetShortId } });
    if (!targetUser) throw new Error('Target user not found');

    return await prisma.$transaction([
      // Deduct from reseller
      prisma.user.update({
        where: { id: resellerId },
        data: { coins: { decrement: amount } }
      }),
      // Credit to user
      prisma.user.update({
        where: { id: targetUser.id },
        data: { coins: { increment: amount } }
      }),
      // Log transaction
      prisma.transaction.create({
        data: {
          userId: targetUser.id,
          amount: amount,
          type: 'RESELLER_TRANSFER',
          status: 'COMPLETED',
          notes: `Received ${amount} coins from reseller ${reseller.shortId}`
        }
      }),
      // Log for reseller too
      prisma.transaction.create({
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

  async getResellerStats(resellerId: string) {
    const reseller = await prisma.user.findUnique({ 
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
