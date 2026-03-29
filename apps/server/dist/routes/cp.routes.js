"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cp_service_1 = require("../services/cp.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/status', async (req, res) => {
    try {
        const status = await cp_service_1.cpService.getStatus(req.user.userId);
        res.json(status);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/request', async (req, res) => {
    try {
        const { targetShortId } = req.body;
        const request = await cp_service_1.cpService.requestCP(req.user.userId, targetShortId);
        res.json(request);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
