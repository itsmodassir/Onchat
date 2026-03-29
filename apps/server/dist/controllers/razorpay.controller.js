"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayController = void 0;
const razorpay_service_1 = require("../services/razorpay.service");
exports.razorpayController = {
    async createOrder(req, res) {
        try {
            const { amount } = req.body;
            const order = await razorpay_service_1.razorpayService.createOrder(req.user.userId, amount);
            res.json(order);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async verifyPayment(req, res) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
            const result = await razorpay_service_1.razorpayService.verifyPayment(req.user.userId, razorpay_order_id, razorpay_payment_id, razorpay_signature);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
