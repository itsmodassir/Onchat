import { Request, Response } from 'express';
import { razorpayService } from '../services/razorpay.service';

export const razorpayController = {
  async createOrder(req: any, res: Response) {
    try {
      const { amount } = req.body;
      const order = await razorpayService.createOrder(req.user.userId, amount);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async verifyPayment(req: any, res: Response) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const result = await razorpayService.verifyPayment(
        req.user.userId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
