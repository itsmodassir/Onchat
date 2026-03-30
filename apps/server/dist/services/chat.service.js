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
const gamification_service_1 = require("./gamification.service");
const game_service_1 = require("./game.service");
const room_service_1 = require("./room.service");
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
        const userId = socket.userId;
        if (!userId) {
            logger_1.logger.error(`Socket connected without userId: ${socket.id}`);
            return;
        }
        socket.on('register', (providedUserId) => {
            const activeUserId = userId || providedUserId;
            if (activeUserId) {
                userSockets.set(activeUserId, socket.id);
                logger_1.logger.info(`User ${activeUserId} registered with socket ${socket.id}`);
                // Start XP Heartbeat (5 XP every 5 minutes)
                const heartbeatInterval = setInterval(async () => {
                    try {
                        await gamification_service_1.gamificationService.awardXP(activeUserId, 5, 'active_participation');
                    }
                    catch (err) {
                        logger_1.logger.error(`Heartbeat XP error for ${activeUserId}: ${err}`);
                    }
                }, 5 * 60 * 1000);
                socket.heartbeatInterval = heartbeatInterval;
                // Listen for Wallet and Level Updates for this user
                eventBus_1.eventBus.subscribe(eventBus_1.EVENTS.WALLET_UPDATE, (data) => {
                    if (data.userId === activeUserId) {
                        socket.emit('wallet-update', data);
                    }
                });
                eventBus_1.eventBus.subscribe(eventBus_1.EVENTS.LEVEL_UP, (data) => {
                    if (data.userId === activeUserId) {
                        socket.emit('level-up', data);
                    }
                });
            }
        });
        socket.on('join-room', async (data) => {
            const roomId = typeof data === 'string' ? data : data.roomId;
            if (!roomId)
                return;
            socket.join(roomId);
            const user = await db_1.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, avatar: true, shortId: true }
            });
            if (user) {
                io.to(roomId).emit('user-joined', { roomId, user });
                logger_1.logger.info(`User ${userId} joined room ${roomId}`);
                // Award XP for joining
                await gamification_service_1.gamificationService.awardXP(userId, 5, 'room_join');
            }
        });
        socket.on('leave-room', async (data) => {
            const roomId = typeof data === 'string' ? data : data.roomId;
            if (!roomId)
                return;
            try {
                await room_service_1.roomService.leaveRoom(roomId, userId);
                socket.leave(roomId);
                io.to(roomId).emit('user-left', { roomId, userId: userId });
                logger_1.logger.info(`User ${userId} left room ${roomId} (Purged from DB)`);
            }
            catch (err) {
                logger_1.logger.error(`Error leaving room ${roomId}: ${err}`);
            }
        });
        socket.on('send-message', async (data) => {
            try {
                if (!data.roomId || !data.content)
                    return;
                const message = await exports.chatService.saveMessage(data.roomId, userId, data.content);
                exports.chatService.broadcastMessage(io, data.roomId, message);
                eventBus_1.eventBus.publish(eventBus_1.EVENTS.MESSAGE_SENT, { roomId: data.roomId, userId: userId, messageId: message.id });
                logger_1.logger.info(`Message sent in room ${data.roomId} by user ${userId}`);
                // Award XP for messaging
                await gamification_service_1.gamificationService.awardXP(userId, 2, 'message_sent');
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
                await monetization_service_1.monetizationService.sendGift(userId, data.toUserId, data.points);
                io.to(data.roomId).emit('new-gift-alert', {
                    fromUserId: userId,
                    toUserId: data.toUserId,
                    giftId: data.giftId,
                    points: data.points
                });
                logger_1.logger.info(`Gift ${data.giftId} sent from ${userId} to ${data.toUserId} in room ${data.roomId}`);
            }
            catch (error) {
                socket.emit('error', { message: error.message });
                logger_1.logger.error(`Error sending gift: ${error.message}`);
            }
        });
        socket.on('send-private-message', async (data) => {
            try {
                const privateMessage = await db_1.prisma.privateMessage.create({
                    data: {
                        content: data.content,
                        senderId: data.fromUserId,
                        receiverId: data.toUserId,
                    },
                    include: {
                        sender: { select: { name: true, avatar: true } },
                    },
                });
                const targetSocketId = userSockets.get(data.toUserId);
                if (targetSocketId) {
                    io.to(targetSocketId).emit('new-private-message', privateMessage);
                }
                else {
                    // Target user is offline, send push notification
                    try {
                        await notification_service_1.notificationService.sendPushNotification(data.toUserId, `New message from ${privateMessage.sender.name}`, data.content, { type: 'PRIVATE_MESSAGE', fromUserId: data.fromUserId });
                    }
                    catch (error) {
                        logger_1.logger.error('Failed to send push notification', error);
                    }
                }
                // Also emit back to the sender for confirmation/sync across their devices
                socket.emit('private-message-sent', privateMessage);
                logger_1.logger.info(`Private message persisted and sent from ${data.fromUserId} to ${data.toUserId}`);
            }
            catch (error) {
                logger_1.logger.error(`Error saving private message: ${error}`);
            }
        });
        socket.on('toggle-mute', (data) => {
            io.to(data.roomId).emit('user-mute-updated', { userId, isMuted: data.isMuted });
            logger_1.logger.info(`User ${userId} mute state in room ${data.roomId}: ${data.isMuted}`);
        });
        socket.on('lock-seat', (data) => {
            io.to(data.roomId).emit('seat-locked', { seatIndex: data.seatIndex });
        });
        socket.on('unlock-seat', (data) => {
            io.to(data.roomId).emit('seat-unlocked', { seatIndex: data.seatIndex });
        });
        socket.on('join-seat', async (data) => {
            try {
                const participant = await room_service_1.roomService.joinSeat(data.roomId, userId, data.seatIndex);
                io.to(data.roomId).emit('seat-joined', {
                    userId,
                    seatIndex: data.seatIndex,
                    user: participant.user
                });
                logger_1.logger.info(`User ${userId} joined seat ${data.seatIndex} in room ${data.roomId}`);
            }
            catch (err) {
                socket.emit('error', { message: err.message });
            }
        });
        socket.on('leave-seat', async (data) => {
            try {
                await room_service_1.roomService.leaveSeat(data.roomId, userId);
                io.to(data.roomId).emit('seat-left', { userId });
                logger_1.logger.info(`User ${userId} left seat in room ${data.roomId}`);
            }
            catch (err) {
                socket.emit('error', { message: err.message });
            }
        });
        socket.on('remove-from-seat', async (data) => {
            try {
                // Verify host (simplified check: fetch room)
                const room = await db_1.prisma.room.findUnique({ where: { id: data.roomId } });
                if (room?.hostId !== userId)
                    throw new Error('Only host can remove from seat');
                await room_service_1.roomService.leaveSeat(data.roomId, data.targetUserId);
                io.to(data.roomId).emit('seat-left', { userId: data.targetUserId });
                logger_1.logger.info(`Host ${userId} removed ${data.targetUserId} from seat in room ${data.roomId}`);
            }
            catch (err) {
                socket.emit('error', { message: err.message });
            }
        });
        socket.on('kick-user', async (data) => {
            try {
                // Authenticate as host (simplified for now)
                await room_service_1.roomService.kickUser(data.roomId, data.targetUserId);
                // Find target socket and force them to leave
                const targetSocketId = userSockets.get(data.targetUserId);
                if (targetSocketId) {
                    const targetSocket = io.sockets.sockets.get(targetSocketId);
                    if (targetSocket) {
                        targetSocket.leave(data.roomId);
                        targetSocket.emit('kicked-from-room', { roomId: data.roomId });
                    }
                }
                io.to(data.roomId).emit('user-kicked', { userId: data.targetUserId });
            }
            catch (err) {
                socket.emit('error', { message: err.message });
            }
        });
        socket.on('toggle-room-lock', async (data) => {
            try {
                await room_service_1.roomService.toggleRoomLock(data.roomId, data.isLocked);
                io.to(data.roomId).emit('room-lock-updated', { isLocked: data.isLocked });
            }
            catch (err) {
                socket.emit('error', { message: err.message });
            }
        });
        socket.on('start-griddy-round', async (data) => {
            try {
                const roundInfo = await game_service_1.gameService.startRound(data.roomId);
                io.to(data.roomId).emit('griddy-round-started', roundInfo);
                // Start 10s Countdown
                let timeLeft = 10;
                const countdown = setInterval(() => {
                    timeLeft--;
                    if (timeLeft > 0) {
                        io.to(data.roomId).emit('griddy-countdown', { timeLeft });
                    }
                    else {
                        clearInterval(countdown);
                        // Process Round
                        game_service_1.gameService.processRound(data.roomId).then(result => {
                            io.to(data.roomId).emit('griddy-round-result', result);
                        }).catch(err => {
                            logger_1.logger.error(`Error processing round in ${data.roomId}: ${err}`);
                        });
                    }
                }, 1000);
            }
            catch (err) {
                socket.emit('error', { message: err.message });
            }
        });
        socket.on('place-griddy-bet', async (data) => {
            try {
                const betInfo = await game_service_1.gameService.placeBet(data.roomId, userId, data.betAmount);
                io.to(data.roomId).emit('griddy-bet-placed', betInfo);
            }
            catch (err) {
                socket.emit('error', { message: err.message });
            }
        });
        socket.on('disconnect', async () => {
            // Clear Heartbeat
            if (socket.heartbeatInterval) {
                clearInterval(socket.heartbeatInterval);
            }
            for (const [uid, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(uid);
                    // Global Clean-up: Purge any active participation in any room on disconnect
                    try {
                        await db_1.prisma.participant.deleteMany({
                            where: { userId: uid }
                        });
                        logger_1.logger.info(`User ${uid} disconnected. Purged all room memberships.`);
                    }
                    catch (err) {
                        logger_1.logger.error(`Disconnect cleanup error for user ${uid}: ${err}`);
                    }
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
