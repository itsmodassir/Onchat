import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../utils/db';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_fallback',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_fallback',
});

export const razorpayService = {
  async createOrder(userId: string, amount: number) {
    // amount is in INR (e.g., 500 for ₹500), but Razorpay expects paisa (amount * 100)
    const options = {
      amount: amount * 100, 
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${userId.slice(0, 5)}`,
    };

    const order = await razorpay.orders.create(options);

    // Create a pending transaction in DB
    await prisma.transaction.create({
      data: {
        userId,
        amount: amount,
        type: 'RECHARGE',
        status: 'PENDING',
        razorpayOrderId: order.id,
        notes: `Recharge for ${amount} coins`,
      }
    });

    return order;
  },

  async verifyPayment(userId: string, orderId: string, paymentId: string, signature: string) {
    const text = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_fallback')
      .update(text)
      .digest('hex');

    const isValid = expectedSignature === signature;

    if (!isValid) throw new Error('Invalid payment signature');

    // Update transaction and user coins
    const transaction = await prisma.transaction.findFirst({
      where: { razorpayOrderId: orderId, userId }
    });

    if (!transaction || transaction.status === 'COMPLETED') {
      throw new Error('Transaction not found or already processed');
    }

    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'COMPLETED',
          razorpayPaymentId: paymentId,
          razorpaySignature: signature
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: Math.floor(transaction.amount) } // Assuming 1 INR = 1 Coin for now
        }
      })
    ]);

    return { success: true };
  }
};
