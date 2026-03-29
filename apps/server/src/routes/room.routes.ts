import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, roomController.createRoom);
router.get('/upcoming', roomController.getUpcomingRooms);
router.get('/', roomController.getRooms);
router.get('/:roomId', roomController.getRoomById);
router.post('/:roomId/join', authMiddleware, roomController.joinRoom);
router.post('/:roomId/start', authMiddleware, roomController.startScheduledRoom);
router.post('/:roomId/approve/:userId', authMiddleware, roomController.approveJoin);
router.post('/:roomId/reject/:userId', authMiddleware, roomController.rejectJoin);
router.get('/token/generate', authMiddleware, roomController.getToken);

export default router;
