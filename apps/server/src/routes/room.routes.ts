import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, roomController.createRoom);
router.get('/', roomController.getRooms);
router.get('/:roomId', roomController.getRoomById);
router.post('/:roomId/join', authMiddleware, roomController.joinRoom);
router.get('/token/generate', authMiddleware, roomController.getToken);

export default router;
