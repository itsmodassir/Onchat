"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agency_service_1 = require("../services/agency.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/stats', async (req, res) => {
    try {
        const stats = await agency_service_1.agencyService.getAgencyStats(req.user.userId);
        res.json(stats);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/create', async (req, res) => {
    try {
        const { name } = req.body;
        const agency = await agency_service_1.agencyService.createAgency(req.user.userId, name);
        res.json(agency);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
