"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameService = void 0;
const db_1 = require("../utils/db");
exports.gameService = {
    async playGriddy(userId, betAmount) {
        const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.coins < betAmount)
            throw new Error('Insufficient coins');
        // Deduct bet
        await db_1.prisma.user.update({
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
        if (result >= 6 && result <= 7)
            multiplier = 2;
        else if (result === 8)
            multiplier = 5;
        else if (result === 9)
            multiplier = 20;
        const wonAmount = Math.floor(betAmount * multiplier);
        const isWon = wonAmount > 0;
        if (isWon) {
            await db_1.prisma.user.update({
                where: { id: userId },
                data: { coins: { increment: wonAmount } }
            });
        }
        // Log bet
        await db_1.prisma.griddyBet.create({
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
    }
};
