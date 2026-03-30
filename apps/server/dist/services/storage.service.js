"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const db_1 = require("../utils/db");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const UPLOADS_BASE = path_1.default.join(process.cwd(), 'uploads', 'users');
class StorageService {
    /**
     * Ensure user-specific directory exists
     */
    static ensureDir(userId) {
        const userDir = path_1.default.join(UPLOADS_BASE, userId);
        if (!fs_1.default.existsSync(userDir)) {
            fs_1.default.mkdirSync(userDir, { recursive: true });
        }
        return userDir;
    }
    /**
     * Upload media with quota enforcement
     */
    static async uploadMedia(userId, file) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: { storageUsed: true, storageQuota: true }
        });
        if (!user)
            throw new Error('User not found');
        // Quota Enforcement (10GB check)
        if (user.storageUsed + file.size > user.storageQuota) {
            throw new Error('Storage quota exceeded (10GB limit)');
        }
        const userDir = this.ensureDir(userId);
        const filename = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        const filePath = path_1.default.join(userDir, filename);
        // Save file to disk
        fs_1.default.writeFileSync(filePath, file.buffer);
        // Update database
        const [media] = await db_1.prisma.$transaction([
            db_1.prisma.media.create({
                data: {
                    filename: file.originalname,
                    path: `/uploads/users/${userId}/${filename}`,
                    size: file.size,
                    mimetype: file.mimetype,
                    userId
                }
            }),
            db_1.prisma.user.update({
                where: { id: userId },
                data: { storageUsed: { increment: file.size } }
            })
        ]);
        return media;
    }
    /**
     * Get all media for a user
     */
    static async getUserMedia(userId) {
        return db_1.prisma.media.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    /**
     * Delete media and reclaim quota
     */
    static async deleteMedia(userId, mediaId) {
        const media = await db_1.prisma.media.findFirst({
            where: { id: mediaId, userId }
        });
        if (!media)
            throw new Error('Media not found or unauthorized');
        const filePath = path_1.default.join(process.cwd(), media.path);
        // Remove from disk
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        // Update database
        await db_1.prisma.$transaction([
            db_1.prisma.media.delete({ where: { id: mediaId } }),
            db_1.prisma.user.update({
                where: { id: userId },
                data: { storageUsed: { decrement: media.size } }
            })
        ]);
        return { success: true };
    }
    /**
     * Get storage stats
     */
    static async getStorageStats(userId) {
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            select: { storageUsed: true, storageQuota: true }
        });
        if (!user)
            throw new Error('User not found');
        return {
            used: user.storageUsed || 0,
            quota: user.storageQuota || 10737418240, // Default 10GB
            percentage: ((user.storageUsed || 0) / (user.storageQuota || 10737418240)) * 100
        };
    }
    /**
     * Set user profile photo from existing media
     */
    static async setProfilePhoto(userId, mediaId) {
        const media = await db_1.prisma.media.findUnique({
            where: { id: mediaId, userId }
        });
        if (!media)
            throw new Error('Media not found');
        return db_1.prisma.user.update({
            where: { id: userId },
            data: { avatar: media.path }
        });
    }
    /**
     * Set user cover photo from existing media
     */
    static async setCoverPhoto(userId, mediaId) {
        const media = await db_1.prisma.media.findUnique({
            where: { id: mediaId, userId }
        });
        if (!media)
            throw new Error('Media not found');
        return db_1.prisma.user.update({
            where: { id: userId },
            data: { coverPhoto: media.path }
        });
    }
}
exports.StorageService = StorageService;
