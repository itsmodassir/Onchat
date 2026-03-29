"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gamification_service_1 = require("../services/gamification.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Leaderboard — public within auth
router.get('/leaderboard', async (req, res) => {
    try {
        const type = req.query.type?.toUpperCase() || 'COINS';
        const limit = parseInt(req.query.limit) || 50;
        const data = await gamification_service_1.gamificationService.getLeaderboard(type, limit);
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Daily reward claim
router.post('/daily-reward', async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await gamification_service_1.gamificationService.claimDailyReward(userId);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Daily reward status
router.get('/daily-reward', async (req, res) => {
    try {
        const userId = req.user.userId;
        const status = await gamification_service_1.gamificationService.getDailyRewardStatus(userId);
        res.json(status);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// User badges
router.get('/badges/:userId', async (req, res) => {
    try {
        const badges = await gamification_service_1.gamificationService.getBadges(req.params.userId);
        res.json(badges);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
