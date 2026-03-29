"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resellerController = void 0;
const reseller_service_1 = require("../services/reseller.service");
exports.resellerController = {
    async transferCoins(req, res) {
        try {
            const { targetShortId, amount } = req.body;
            const result = await reseller_service_1.resellerService.transferCoins(req.user.userId, targetShortId, amount);
            res.json({ success: true, transactions: result });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getStats(req, res) {
        try {
            const stats = await reseller_service_1.resellerService.getResellerStats(req.user.userId);
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
