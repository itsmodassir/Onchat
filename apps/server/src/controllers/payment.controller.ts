import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { v4 as uuidv4 } from 'uuid';

export const paymentController = {
  async addCoins(req: any, res: Response) {
    try {
      const { amount } = req.body;
      const idempotencyKey = req.headers['x-idempotency-key'] || uuidv4();
      const user = await paymentService.addCoins(req.user.userId, amount, idempotencyKey as string);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async sendGift(req: any, res: Response) {
    try {
      const { toUserId, amount } = req.body;
      const idempotencyKey = req.headers['x-idempotency-key'] || uuidv4();
      const result = await paymentService.sendGift(req.user.userId, toUserId, amount, idempotencyKey as string);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
