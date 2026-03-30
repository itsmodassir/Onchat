"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialController = void 0;
const social_service_1 = require("../services/social.service");
exports.socialController = {
    async follow(req, res) {
        try {
            const { userId } = req.body;
            const followerId = req.user.userId;
            const result = await social_service_1.socialService.follow(followerId, userId);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async unfollow(req, res) {
        try {
            const { userId } = req.params;
            const followerId = req.user.userId;
            await social_service_1.socialService.unfollow(followerId, userId);
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getFollowers(req, res) {
        try {
            const { userId } = req.params;
            const followers = await social_service_1.socialService.getFollowers(userId);
            res.json(followers);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getFollowing(req, res) {
        try {
            const { userId } = req.params;
            const following = await social_service_1.socialService.getFollowing(userId);
            res.json(following);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getFriends(req, res) {
        try {
            const userId = req.user.userId;
            const friends = await social_service_1.socialService.getFriends(userId);
            res.json(friends);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getConversations(req, res) {
        try {
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/db')));
            const userId = req.user.userId;
            // Get unique users the current user has chatted with
            const conversations = await prisma.privateMessage.findMany({
                where: {
                    OR: [{ senderId: userId }, { receiverId: userId }]
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    sender: { select: { id: true, name: true, avatar: true, shortId: true } },
                    receiver: { select: { id: true, name: true, avatar: true, shortId: true } }
                }
            });
            // Group by user and get latest message
            const latestMessages = new Map();
            conversations.forEach((msg) => {
                const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
                if (!latestMessages.has(otherUser.id)) {
                    latestMessages.set(otherUser.id, {
                        id: otherUser.id,
                        name: otherUser.name,
                        avatar: otherUser.avatar,
                        shortId: otherUser.shortId,
                        lastMessage: msg.content,
                        time: msg.createdAt,
                        unread: msg.receiverId === userId && !msg.isRead ? 1 : 0
                    });
                }
            });
            res.json(Array.from(latestMessages.values()));
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getMessageHistory(req, res) {
        try {
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/db')));
            const userId = req.user.userId;
            const { targetUserId } = req.params;
            const messages = await prisma.privateMessage.findMany({
                where: {
                    OR: [
                        { senderId: userId, receiverId: targetUserId },
                        { senderId: targetUserId, receiverId: userId }
                    ]
                },
                orderBy: { createdAt: 'asc' },
                take: 50 // Latest 50 messages
            });
            // Mark as read
            await prisma.privateMessage.updateMany({
                where: { senderId: targetUserId, receiverId: userId, isRead: false },
                data: { isRead: true }
            });
            res.json(messages);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};
