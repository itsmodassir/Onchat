import { prisma } from '../utils/db';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_BASE = path.join(process.cwd(), 'uploads', 'users');

export class StorageService {
  /**
   * Ensure user-specific directory exists
   */
  private static ensureDir(userId: string) {
    const userDir = path.join(UPLOADS_BASE, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    return userDir;
  }

  /**
   * Upload media with quota enforcement
   */
  static async uploadMedia(userId: string, file: Express.Multer.File) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true, storageQuota: true }
    });

    if (!user) throw new Error('User not found');

    // Quota Enforcement (10GB check)
    if (user.storageUsed + file.size > user.storageQuota) {
      throw new Error('Storage quota exceeded (10GB limit)');
    }

    const userDir = this.ensureDir(userId);
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(userDir, filename);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Update database
    const [media] = await prisma.$transaction([
      prisma.media.create({
        data: {
          filename: file.originalname,
          path: `/uploads/users/${userId}/${filename}`,
          size: file.size,
          mimetype: file.mimetype,
          userId
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { storageUsed: { increment: file.size } }
      })
    ]);

    return media;
  }

  /**
   * Get all media for a user
   */
  static async getUserMedia(userId: string) {
    return prisma.media.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Delete media and reclaim quota
   */
  static async deleteMedia(userId: string, mediaId: string) {
    const media = await prisma.media.findFirst({
      where: { id: mediaId, userId }
    });

    if (!media) throw new Error('Media not found or unauthorized');

    const filePath = path.join(process.cwd(), media.path);

    // Remove from disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update database
    await prisma.$transaction([
      prisma.media.delete({ where: { id: mediaId } }),
      prisma.user.update({
        where: { id: userId },
        data: { storageUsed: { decrement: media.size } }
      })
    ]);

    return { success: true };
  }

  /**
   * Get storage stats
   */
  static async getStorageStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { storageUsed: true, storageQuota: true }
    });
    
    if (!user) throw new Error('User not found');
    
    return {
      used: (user as any).storageUsed || 0,
      quota: (user as any).storageQuota || 10737418240, // Default 10GB
      percentage: (((user as any).storageUsed || 0) / ((user as any).storageQuota || 10737418240)) * 100
    };
  }
}
