"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const monetization_service_1 = require("../services/monetization.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Get creator earnings stats
router.get('/creator-stats', async (req, res) => {
    try {
        const stats = await monetization_service_1.monetizationService.getCreatorStats(req.user.userId);
        res.json(stats);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Request withdrawal
router.post('/withdraw', async (req, res) => {
    try {
        const { amount, method, details } = req.body;
        if (!amount || !method || !details)
            throw new Error('Missing withdrawal info');
        const request = await monetization_service_1.monetizationService.requestWithdrawal(req.user.userId, amount, method, details);
        res.status(201).json(request);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
