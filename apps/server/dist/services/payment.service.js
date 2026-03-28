"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const db_1 = require("../utils/db");
const kafka_1 = require("../utils/kafka");
const logger_1 = require("../utils/logger");
const TransactionType = {
    PURCHASE: 'PURCHASE',
    GIFT_SEND: 'GIFT_SEND',
    GIFT_RECEIVE: 'GIFT_RECEIVE',
};
exports.paymentService = {
    async processLedgerEntry(userId, amount, type, referenceId) {
        // Basic double-entry log in Transaction table
        logger_1.logger.info(`Processing ledger entry for user ${userId}: ${amount} (${type})`);
        return await db_1.prisma.$transaction(async (tx) => {
            // 1. Idempotency Check: Prevent duplicate transactions
            const existingTx = await tx.transaction.findFirst({
                where: { userId, status: referenceId },
            });
            if (existingTx) {
                logger_1.logger.warn(`Idempotent transaction detected and skipped: ${referenceId}`);
                return existingTx;
            }
            // 2. Adjust Balance
            const user = await tx.user.update({
                where: { id: userId },
                data: { coins: { increment: amount } }, // amount can be negative
            });
            // 3. Record Ledger Entry
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    amount: Math.abs(amount),
                    type: type,
                    status: referenceId, // Using status as idempotency key for this mock
                },
            });
            return transaction;
        });
    },
    async addCoins(userId, amount, idempotencyKey) {
        if (amount <= 0)
            throw new Error('Invalid amount');
        await this.processLedgerEntry(userId, amount, TransactionType.PURCHASE, idempotencyKey);
        logger_1.logger.info(`Added ${amount} coins to wallet ${userId}`);
        return { success: true };
    },
    async sendGift(fromUserId, toUserId, giftValue, idempotencyKey) {
        if (giftValue <= 0)
            throw new Error('Invalid gift value');
        // Double-entry transaction ensures atomic consistency
        await db_1.prisma.$transaction(async (tx) => {
            const sender = await tx.user.findUnique({ where: { id: fromUserId } });
            if (!sender || sender.coins < giftValue) {
                throw new Error('Insufficient wallet balance');
            }
            // Debit Sender
            await this.processLedgerEntry(fromUserId, -giftValue, TransactionType.GIFT_SEND, `${idempotencyKey}_SND`);
            // Credit Receiver (Future: calculate platform cut here)
            const platformFee = 0;
            const netCredit = giftValue - platformFee;
            await this.processLedgerEntry(toUserId, netCredit, TransactionType.GIFT_RECEIVE, `${idempotencyKey}_RCV`);
        });
        kafka_1.kafkaBus.publish(kafka_1.KAFKA_TOPICS.GIFT_SENT, { fromUserId, toUserId, giftValue });
        return { success: true };
    },
};
