import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from '../payment.service';
import { prisma } from '../../utils/db';

vi.mock('../../utils/db', () => ({
  prisma: {
    user: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    transaction: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock('../../utils/kafka', () => ({
  kafkaBus: {
    publish: vi.fn().mockResolvedValue(true),
  },
  KAFKA_TOPICS: {
    GIFT_SENT: 'GIFT_SENT',
  },
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PaymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processLedgerEntry', () => {
    it('should process a new transaction successfully', async () => {
      (prisma.transaction.findFirst as any).mockResolvedValue(null);
      (prisma.user.update as any).mockResolvedValue({ id: 'u1', coins: 100 });
      (prisma.transaction.create as any).mockResolvedValue({ id: 'tx-1' });

      const result = await paymentService.processLedgerEntry(
        'u1',
        50,
        'PURCHASE',
        'tx-unique-123'
      );

      expect(result).toBeDefined();
      expect(prisma.transaction.create).toHaveBeenCalled();
    });

    it('should handle idempotency and return existing transaction', async () => {
      const existingTx = { id: 'tx-1', status: 'COMPLETED' };
      (prisma.transaction.findFirst as any).mockResolvedValue(existingTx);

      const result = await paymentService.processLedgerEntry(
        'u1',
        50,
        'PURCHASE',
        'tx-unique-123'
      );

      expect(result).toEqual(existingTx);
      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });
  });
});
