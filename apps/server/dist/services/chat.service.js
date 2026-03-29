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
exports.chatService = void 0;
const db_1 = require("../utils/db");
const eventBus_1 = require("../utils/eventBus");
const logger_1 = require("../utils/logger");
const monetization_service_1 = require("./monetization.service");
const notification_service_1 = require("./notification.service");
const moderation_service_1 = require("./moderation.service");
const userSockets = new Map();
exports.chatService = {
    async saveMessage(roomId, userId, content) {
        const moderation = await moderation_service_1.moderationService.moderateMessage(content);
        const message = await db_1.prisma.message.create({
            data: {
                roomId,
                userId,
                content,
                isHidden: moderation.isToxic,
            },
            include: {
                user: { select: { name: true } },
                reactions: true,
            },
        });
        return message;
    },
    broadcastMessage(io, roomId, message) {
        io.to(roomId).emit('new-message', message);
    },
    handleSocket(io, socket) {
        socket.on('register', (userId) => {
            userSockets.set(userId, socket.id);
            logger_1.logger.info(`User ${userId} registered with socket ${socket.id}`);
        });
        socket.on('join-room', async (data) => {
            socket.join(data.roomId);
            const user = await db_1.prisma.user.findUnique({
                where: { id: data.userId },
                select: { id: true, name: true, avatar: true, shortId: true }
            });
            io.to(data.roomId).emit('user-joined', { roomId: data.roomId, user });
            logger_1.logger.info(`User ${data.userId} joined room ${data.roomId}`);
        });
        socket.on('leave-room', (data) => {
            socket.leave(data.roomId);
            io.to(data.roomId).emit('user-left', { roomId: data.roomId, userId: data.userId });
            logger_1.logger.info(`User ${data.userId} left room ${data.roomId}`);
        });
        socket.on('send-message', async (data) => {
            try {
                const message = await exports.chatService.saveMessage(data.roomId, data.userId, data.content);
                exports.chatService.broadcastMessage(io, data.roomId, message);
                eventBus_1.eventBus.publish(eventBus_1.EVENTS.MESSAGE_SENT, { roomId: data.roomId, userId: data.userId, messageId: message.id });
                logger_1.logger.info(`Message sent in room ${data.roomId} by user ${data.userId}`);
            }
            catch (error) {
                logger_1.logger.error(`Error saving message: ${error}`);
            }
        });
        socket.on('react-message', async (data) => {
            try {
                const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/db')));
                await prisma.messageReaction.upsert({
                    where: { messageId_userId: { messageId: data.messageId, userId: data.userId } },
                    update: { emoji: data.emoji },
                    create: { messageId: data.messageId, userId: data.userId, emoji: data.emoji },
                });
                io.to(data.roomId).emit('message-reaction', {
                    messageId: data.messageId,
                    userId: data.userId,
                    emoji: data.emoji,
                });
            }
            catch (error) {
                logger_1.logger.error(`Error saving reaction: ${error}`);
            }
        });
        socket.on('send-gift', async (data) => {
            try {
                await monetization_service_1.monetizationService.sendGift(data.fromUserId, data.toUserId, data.points);
                io.to(data.roomId).emit('new-gift', data);
                logger_1.logger.info(`Gift ${data.giftName} sent from ${data.fromUserId} to ${data.toUserId} in room ${data.roomId}`);
            }
            catch (error) {
                socket.emit('error', { message: error.message });
                logger_1.logger.error(`Error sending gift: ${error.message}`);
            }
        });
        socket.on('send-private-message', async (data) => {
            const targetSocketId = userSockets.get(data.toUserId);
            if (targetSocketId) {
                io.to(targetSocketId).emit('new-private-message', data);
            }
            else {
                // Target user is offline, send push notification
                try {
                    const sender = await db_1.prisma.user.findUnique({ where: { id: data.fromUserId }, select: { name: true } });
                    const senderName = sender?.name || 'Someone';
                    await notification_service_1.notificationService.sendPushNotification(data.toUserId, `New message from ${senderName}`, data.content, { type: 'PRIVATE_MESSAGE', fromUserId: data.fromUserId });
                }
                catch (error) {
                    logger_1.logger.error('Failed to send push notification', error);
                }
            }
            logger_1.logger.info(`Private message from ${data.fromUserId} to ${data.toUserId}`);
        });
        socket.on('disconnect', () => {
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        });
    },
    init(io) {
        eventBus_1.eventBus.subscribe('USER_JOINED_ROOM', (data) => {
            io.to(data.roomId).emit('user-joined', data);
            const targetSocketId = userSockets.get(data.userId);
            if (targetSocketId) {
                io.to(targetSocketId).emit('join-approved', data);
            }
        });
        eventBus_1.eventBus.subscribe('USER_REQUESTED_JOIN', (data) => {
            // Notify only the host
            // We need room hostId. Let's assume data has it or we fetch it.
            // For now, emit to the room but with a 'request' tag
            io.to(data.roomId).emit('new-join-request', data);
        });
        eventBus_1.eventBus.subscribe(eventBus_1.EVENTS.ROOM_CREATED, (data) => {
            // Global broadcast to all connected clients so the HomeScreen updates instantly
            io.emit('new-room-active', data);
        });
    }
};
