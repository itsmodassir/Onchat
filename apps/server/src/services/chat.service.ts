import { prisma } from '../utils/db';
import { eventBus, EVENTS } from '../utils/eventBus';
import { logger } from '../utils/logger';

import { monetizationService } from './monetization.service';
import { notificationService } from './notification.service';
import { moderationService } from './moderation.service';

const userSockets = new Map<string, string>();

export const chatService = {
  async saveMessage(roomId: string, userId: string, content: string) {
    const moderation = await moderationService.moderateMessage(content);
    
    const message = await prisma.message.create({
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

  broadcastMessage(io: any, roomId: string, message: any) {
    io.to(roomId).emit('new-message', message);
  },

  handleSocket(io: any, socket: any) {
    socket.on('register', (userId: string) => {
      userSockets.set(userId, socket.id);
      logger.info(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('join-room', async (data: { roomId: string; userId: string }) => {
      socket.join(data.roomId);
      const user = await prisma.user.findUnique({ 
        where: { id: data.userId }, 
        select: { id: true, name: true, avatar: true, shortId: true } as any 
      });
      io.to(data.roomId).emit('user-joined', { roomId: data.roomId, user });
      logger.info(`User ${data.userId} joined room ${data.roomId}`);
    });

    socket.on('leave-room', (data: { roomId: string; userId: string }) => {
      socket.leave(data.roomId);
      io.to(data.roomId).emit('user-left', { roomId: data.roomId, userId: data.userId });
      logger.info(`User ${data.userId} left room ${data.roomId}`);
    });

    socket.on('send-message', async (data: { roomId: string; userId: string; content: string }) => {
      try {
        const message = await chatService.saveMessage(data.roomId, data.userId, data.content);
        chatService.broadcastMessage(io, data.roomId, message);
        eventBus.publish(EVENTS.MESSAGE_SENT, { roomId: data.roomId, userId: data.userId, messageId: message.id });
        logger.info(`Message sent in room ${data.roomId} by user ${data.userId}`);
      } catch (error) {
        logger.error(`Error saving message: ${error}`);
      }
    });

    socket.on('react-message', async (data: { messageId: string; userId: string; roomId: string; emoji: string }) => {
      try {
        const { prisma } = await import('../utils/db');
        await (prisma as any).messageReaction.upsert({
          where: { messageId_userId: { messageId: data.messageId, userId: data.userId } },
          update: { emoji: data.emoji },
          create: { messageId: data.messageId, userId: data.userId, emoji: data.emoji },
        });
        io.to(data.roomId).emit('message-reaction', {
          messageId: data.messageId,
          userId: data.userId,
          emoji: data.emoji,
        });
      } catch (error) {
        logger.error(`Error saving reaction: ${error}`);
      }
    });

    socket.on('send-gift', async (data: { roomId: string; fromUserId: string; toUserId: string; giftName: string; points: number }) => {
      try {
        await monetizationService.sendGift(data.fromUserId, data.toUserId, data.points);
        io.to(data.roomId).emit('new-gift', data);
        logger.info(`Gift ${data.giftName} sent from ${data.fromUserId} to ${data.toUserId} in room ${data.roomId}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
        logger.error(`Error sending gift: ${error.message}`);
      }
    });

    socket.on('send-private-message', async (data: { toUserId: string; fromUserId: string; content: string }) => {
      const targetSocketId = userSockets.get(data.toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('new-private-message', data);
      } else {
        // Target user is offline, send push notification
        try {
          const sender = await prisma.user.findUnique({ where: { id: data.fromUserId }, select: { name: true } as any });
          const senderName = sender?.name || 'Someone';
          await notificationService.sendPushNotification(
            data.toUserId,
            `New message from ${senderName}`,
            data.content,
            { type: 'PRIVATE_MESSAGE', fromUserId: data.fromUserId }
          );
        } catch (error) {
          logger.error('Failed to send push notification', error);
        }
      }
      logger.info(`Private message from ${data.fromUserId} to ${data.toUserId}`);
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

  init(io: any) {
    eventBus.subscribe('USER_JOINED_ROOM', (data: any) => {
      io.to(data.roomId).emit('user-joined', data);
      const targetSocketId = userSockets.get(data.userId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('join-approved', data);
      }
    });

    eventBus.subscribe('USER_REQUESTED_JOIN', (data: any) => {
      // Notify only the host
      // We need room hostId. Let's assume data has it or we fetch it.
      // For now, emit to the room but with a 'request' tag
      io.to(data.roomId).emit('new-join-request', data);
    });

    eventBus.subscribe(EVENTS.ROOM_CREATED, (data: any) => {
      // Global broadcast to all connected clients so the HomeScreen updates instantly
      io.emit('new-room-active', data);
    });
  }
};
