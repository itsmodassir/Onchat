import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware';
import * as StorageController from '../controllers/storage.controller';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB per file limit
});

router.use(authMiddleware as any);

(router as any).post('/upload', upload.single('file'), StorageController.uploadMedia);
(router as any).get('/media', StorageController.getUserMedia);
(router as any).delete('/media/:id', StorageController.deleteMedia);
(router as any).get('/stats', StorageController.getStorageStats);
(router as any).post('/set-profile', StorageController.setProfilePhoto);
(router as any).post('/set-cover', StorageController.setCoverPhoto);

export default router;
