"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moderation_service_1 = require("../services/moderation.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// User-facing: report someone
router.post('/report', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const reporterId = req.user.userId;
        const { targetUserId, reason } = req.body;
        if (!targetUserId || !reason)
            throw new Error('targetUserId and reason are required');
        const report = await moderation_service_1.moderationService.reportUser(reporterId, targetUserId, reason);
        res.status(201).json(report);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Host-facing: kick user from room
router.post('/kick', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const hostId = req.user.userId;
        const { targetUserId, roomId } = req.body;
        if (!targetUserId || !roomId)
            throw new Error('targetUserId and roomId are required');
        const result = await moderation_service_1.moderationService.kickFromRoom(hostId, targetUserId, roomId);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Admin: get all reports
router.get('/reports', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, async (req, res) => {
    try {
        const { status } = req.query;
        const reports = await moderation_service_1.moderationService.getReports(status);
        res.json(reports);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Admin: update report status
router.patch('/reports/:id', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const report = await moderation_service_1.moderationService.updateReportStatus(req.params.id, status);
        res.json(report);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Admin: ban user
router.post('/ban', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, async (req, res) => {
    try {
        const adminId = req.user.userId;
        const { targetUserId, durationHours } = req.body;
        const result = await moderation_service_1.moderationService.banUser(adminId, targetUserId, durationHours);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Admin: unban user
router.post('/unban', auth_middleware_1.authMiddleware, auth_middleware_1.adminMiddleware, async (req, res) => {
    try {
        const adminId = req.user.userId;
        const { targetUserId } = req.body;
        const result = await moderation_service_1.moderationService.unbanUser(adminId, targetUserId);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
