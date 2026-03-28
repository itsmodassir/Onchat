"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const payment_service_1 = require("../services/payment.service");
const uuid_1 = require("uuid");
exports.paymentController = {
    async addCoins(req, res) {
        try {
            const { amount } = req.body;
            const idempotencyKey = req.headers['x-idempotency-key'] || (0, uuid_1.v4)();
            const user = await payment_service_1.paymentService.addCoins(req.user.userId, amount, idempotencyKey);
            res.json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async sendGift(req, res) {
        try {
            const { toUserId, amount } = req.body;
            const idempotencyKey = req.headers['x-idempotency-key'] || (0, uuid_1.v4)();
            const result = await payment_service_1.paymentService.sendGift(req.user.userId, toUserId, amount, idempotencyKey);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};
