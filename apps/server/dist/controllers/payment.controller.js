import { paymentService } from '../services/payment.service';
import { v4 as uuidv4 } from 'uuid';
export const paymentController = {
    async addCoins(req, res) {
        try {
            const { amount } = req.body;
            const idempotencyKey = req.headers['x-idempotency-key'] || uuidv4();
            const user = await paymentService.addCoins(req.user.userId, amount, idempotencyKey);
            res.json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async sendGift(req, res) {
        try {
            const { toUserId, amount } = req.body;
            const idempotencyKey = req.headers['x-idempotency-key'] || uuidv4();
            const result = await paymentService.sendGift(req.user.userId, toUserId, amount, idempotencyKey);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};
