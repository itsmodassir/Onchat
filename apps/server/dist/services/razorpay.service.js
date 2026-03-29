"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayService = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../utils/db");
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_fallback',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_fallback',
});
exports.razorpayService = {
    async createOrder(userId, amount) {
        // amount is in INR (e.g., 500 for ₹500), but Razorpay expects paisa (amount * 100)
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}_${userId.slice(0, 5)}`,
        };
        const order = await razorpay.orders.create(options);
        // Create a pending transaction in DB
        await db_1.prisma.transaction.create({
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
    async verifyPayment(userId, orderId, paymentId, signature) {
        const text = orderId + '|' + paymentId;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_fallback')
            .update(text)
            .digest('hex');
        const isValid = expectedSignature === signature;
        if (!isValid)
            throw new Error('Invalid payment signature');
        // Update transaction and user coins
        const transaction = await db_1.prisma.transaction.findFirst({
            where: { razorpayOrderId: orderId, userId }
        });
        if (!transaction || transaction.status === 'COMPLETED') {
            throw new Error('Transaction not found or already processed');
        }
        await db_1.prisma.$transaction([
            db_1.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'COMPLETED',
                    razorpayPaymentId: paymentId,
                    razorpaySignature: signature
                }
            }),
            db_1.prisma.user.update({
                where: { id: userId },
                data: {
                    coins: { increment: Math.floor(transaction.amount) } // Assuming 1 INR = 1 Coin for now
                }
            })
        ]);
        return { success: true };
    }
};
