import { prisma } from '../utils/db';
import { TransactionType } from '@prisma/client';
import { gamificationService } from './gamification.service';
import { eventBus, EVENTS } from '../utils/eventBus';

export const monetizationService = {
  async recharge(userId: string, amount: number, coins: number) {
    return await prisma.$transaction(async (tx: any) => {
      // 1. Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          amount,
          type: (TransactionType as any).RECHARGE,
          status: 'COMPLETED',
        },
      });

      // 2. Update user coins
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: coins },
        },
      });

      eventBus.publish(EVENTS.WALLET_UPDATE, { userId, coins: user.coins, diamonds: user.diamonds });
      return user;
    });
  },

  async spin(userId: string, stake: number) {
    const prizes = [
      { name: '10 Coins', type: 'COIN', value: 10 },
      { name: '50 Coins', type: 'COIN', value: 50 },
      { name: '100 Coins', type: 'COIN', value: 100 },
      { name: '500 Coins', type: 'COIN', value: 500 },
      { name: 'Headwear', type: 'ASSET', value: 'headwear_1' },
      { name: 'Try Again', type: 'NONE', value: 0 },
    ];

    return await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.coins < stake) throw new Error('Insufficient coins');

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
        data: { userId, amount: -stake, type: 'PURCHASE' as any, status: 'SPIN' },
      });

      return { prize: win };
    });
  },

  async exchangeDiamonds(userId: string, diamonds: number, coins: number) {
    return await prisma.$transaction(async (tx: any) => {
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
      const txRecord = await tx.transaction.create({
        data: {
          userId,
          amount: diamonds,
          type: (TransactionType as any).EXCHANGE,
        },
      });

      eventBus.publish(EVENTS.WALLET_UPDATE, { userId, coins: user.coins + coins, diamonds: user.diamonds - diamonds });
      return txRecord;
    });
  },

  async sendGift(fromUserId: string, toUserId: string, coinAmount: number) {
    return await prisma.$transaction(async (tx: any) => {
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
        data: { userId: fromUserId, amount: -coinAmount, type: 'GIFT_SEND' as any },
      });
      await tx.transaction.create({
        data: { userId: toUserId, amount: coinAmount, type: 'GIFT_RECEIVE' as any },
      });

      // 4. Award XP (10 base + 5% of amount)
      const xpAmount = 10 + Math.floor(coinAmount * 0.05);
      await gamificationService.awardXP(fromUserId, xpAmount, 'GIFT_SENT');
      await gamificationService.awardXP(toUserId, xpAmount, 'GIFT_RECEIVED');

      // 5. Publish Wallet Updates
      eventBus.publish(EVENTS.WALLET_UPDATE, { userId: fromUserId, coins: sender.coins - coinAmount });
      eventBus.publish(EVENTS.WALLET_UPDATE, { userId: toUserId, coins: (await tx.user.findUnique({ where: { id: toUserId }, select: { coins: true } })).coins });

      return { success: true };
    });
  },

  async getWallet(userId: string) {
    return await (prisma.user as any).findUnique({
      where: { id: userId },
      select: {
        coins: true,
        diamonds: true,
        crystals: true,
      },
    });
  },

  async getCreatorStats(userId: string) {
    const user = await (prisma.user as any).findUnique({
      where: { id: userId },
      select: { diamonds: true },
    });

    const pendingWithdrawals = await (prisma as any).withdrawalRequest.aggregate({
      where: { userId, status: 'PENDING' },
      _sum: { amount: true },
    });

    const totalWithdrawn = await (prisma as any).withdrawalRequest.aggregate({
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

  async requestWithdrawal(userId: string, amount: number, method: string, details: string) {
    return await prisma.$transaction(async (tx: any) => {
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
          type: 'WITHDRAWAL' as any,
          status: 'PENDING',
        },
      });

      return request;
    });
  },
};
