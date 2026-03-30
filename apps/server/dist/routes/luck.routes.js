"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const game_service_1 = require("../services/game.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.post('/griddy/play', async (req, res) => {
    try {
        const { betAmount } = req.body;
        const result = await game_service_1.gameService.playGriddy(req.user.userId, betAmount);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get('/griddy/history', async (req, res) => {
    try {
        const history = await game_service_1.gameService.getRecentWins();
        res.json(history);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
