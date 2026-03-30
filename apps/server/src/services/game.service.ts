import { prisma } from '../utils/db';
import { logger } from '../utils/logger';
import { monetizationService } from './monetization.service';
import { gamificationService } from './gamification.service';
import { eventBus, EVENTS } from '../utils/eventBus';

const activeRounds = new Map<string, {
  bets: Map<string, number>, // userId -> betAmount
  status: 'BETTING' | 'SPINNING',
  startTime: number
}>();

export const gameService = {
  async playGriddy(userId: string, betAmount: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.coins < betAmount) throw new Error('Insufficient coins');

    // Deduct bet
    await prisma.user.update({
      where: { id: userId },
      data: { coins: { decrement: betAmount } }
    });

    // Random result (1-9)
    const result = Math.floor(Math.random() * 9) + 1;
    
    // Multiplier logic:
    // 1-5: 0x (lost) -> 55.5%
    // 6-7: 2x -> 22.2%
    // 8: 5x -> 11.1%
    // 9: 20x -> 11.1%
    let multiplier = 0;
    if (result >= 6 && result <= 7) multiplier = 2;
    else if (result === 8) multiplier = 5;
    else if (result === 9) multiplier = 20;

    const wonAmount = Math.floor(betAmount * multiplier);
    const isWon = wonAmount > 0;

    if (isWon) {
      await prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: wonAmount } }
      });
    }

    // Log bet
    await prisma.griddyBet.create({
      data: {
        userId,
        amount: betAmount,
        multiplier,
        won: isWon,
        result
      }
    });

    return {
      result,
      multiplier,
      wonAmount,
      isWon,
      newBalance: user.coins - betAmount + wonAmount
    };
  },

  async getRecentWins() {
    return await prisma.griddyBet.findMany({
      where: { won: true, multiplier: { gt: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            shortId: true
          }
        }
      }
    });
  },

  // --- Shared Room Game Logic ---

  async startRound(roomId: string) {
    if (activeRounds.has(roomId)) {
      throw new Error('A round is already in progress');
    }

    activeRounds.set(roomId, {
      bets: new Map(),
      status: 'BETTING',
      startTime: Date.now()
    });

    logger.info(`Started Griddy round in room ${roomId}`);
    return { status: 'BETTING', timeLeft: 10 };
  },

  async placeBet(roomId: string, userId: string, betAmount: number) {
    const round = activeRounds.get(roomId);
    if (!round) throw new Error('No active round in this room');
    if (round.status !== 'BETTING') throw new Error('Betting phase has ended');
    if (round.bets.has(userId)) throw new Error('Already placed a bet in this round');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.coins < betAmount) throw new Error('Insufficient coins');

    // Deduct coins via monetizationService (which also awards XP and publishes events)
    await prisma.user.update({
      where: { id: userId },
      data: { coins: { decrement: betAmount } }
    });

    round.bets.set(userId, betAmount);
    logger.info(`User ${userId} placed bet ${betAmount} in room ${roomId}`);
    
    eventBus.publish(EVENTS.WALLET_UPDATE, { userId, coins: user.coins - betAmount });
    
    return { userId, betAmount, totalBets: round.bets.size };
  },

  async processRound(roomId: string) {
    const round = activeRounds.get(roomId);
    if (!round) throw new Error('No active round');

    round.status = 'SPINNING';
    
    // Random result (1-9)
    const result = Math.floor(Math.random() * 9) + 1;
    let multiplier = 0;
    if (result >= 6 && result <= 7) multiplier = 2;
    else if (result === 8) multiplier = 5;
    else if (result === 9) multiplier = 20;

    const winners: any[] = [];
    
    for (const [userId, betAmount] of round.bets.entries()) {
      const wonAmount = Math.floor(betAmount * multiplier);
      const isWon = wonAmount > 0;

      if (isWon) {
        await prisma.user.update({
          where: { id: userId },
          data: { coins: { increment: wonAmount } }
        });
        winners.push({ userId, wonAmount, multiplier });
        
        // Award Game XP (10 per win + bonus)
        await gamificationService.awardXP(userId, 10 + Math.floor(wonAmount * 0.01), 'GAME_WIN');
        eventBus.publish(EVENTS.WALLET_UPDATE, { userId, coins: (await prisma.user.findUnique({ where: { id: userId } }))?.coins });
      }

      // Log bet
      await prisma.griddyBet.create({
        data: { userId, amount: betAmount, multiplier, won: isWon, result }
      });
    }

    activeRounds.delete(roomId);
    logger.info(`Processed Griddy round in ${roomId}. Result: ${result}. Winners: ${winners.length}`);

    return { result, multiplier, winners };
  }
};
