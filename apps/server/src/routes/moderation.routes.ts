import { Router } from 'express';
import { moderationService } from '../services/moderation.service';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// User-facing: report someone
router.post('/report', authMiddleware, async (req: any, res) => {
  try {
    const reporterId = req.user.userId;
    const { targetUserId, reason } = req.body;
    if (!targetUserId || !reason) throw new Error('targetUserId and reason are required');
    const report = await moderationService.reportUser(reporterId, targetUserId, reason);
    res.status(201).json(report);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Host-facing: kick user from room
router.post('/kick', authMiddleware, async (req: any, res) => {
  try {
    const hostId = req.user.userId;
    const { targetUserId, roomId } = req.body;
    if (!targetUserId || !roomId) throw new Error('targetUserId and roomId are required');
    const result = await moderationService.kickFromRoom(hostId, targetUserId, roomId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: get all reports
router.get('/reports', authMiddleware, adminMiddleware, async (req: any, res) => {
  try {
    const { status } = req.query;
    const reports = await moderationService.getReports(status as string);
    res.json(reports);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: update report status
router.patch('/reports/:id', authMiddleware, adminMiddleware, async (req: any, res) => {
  try {
    const { status } = req.body;
    const report = await moderationService.updateReportStatus(req.params.id, status);
    res.json(report);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: ban user
router.post('/ban', authMiddleware, adminMiddleware, async (req: any, res) => {
  try {
    const adminId = req.user.userId;
    const { targetUserId, durationHours } = req.body;
    const result = await moderationService.banUser(adminId, targetUserId, durationHours);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Admin: unban user
router.post('/unban', authMiddleware, adminMiddleware, async (req: any, res) => {
  try {
    const adminId = req.user.userId;
    const { targetUserId } = req.body;
    const result = await moderationService.unbanUser(adminId, targetUserId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
