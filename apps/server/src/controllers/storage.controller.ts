import { Request, Response } from 'express';
import { StorageService } from '../services/storage.service';

export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = (req as any).user.id;
    const media = await StorageService.uploadMedia(userId, req.file);

    res.status(201).json(media);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserMedia = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const media = await StorageService.getUserMedia(userId);
    res.json(media);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    await StorageService.deleteMedia(userId, id);
    res.json({ message: 'Media deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getStorageStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const stats = await StorageService.getStorageStats(userId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
