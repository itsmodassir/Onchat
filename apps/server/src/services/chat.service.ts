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
    const userId = socket.userId;
    if (!userId) {
      logger.error(`Socket connected without userId: ${socket.id}`);
      return;
    }

    socket.on('register', (providedUserId?: string) => {
      const activeUserId = userId || providedUserId;
      if (activeUserId) {
        userSockets.set(activeUserId, socket.id);
        logger.info(`User ${activeUserId} registered with socket ${socket.id}`);
      }
    });

    socket.on('join-room', async (data: { roomId: string } | string) => {
      const roomId = typeof data === 'string' ? data : data.roomId;
      if (!roomId) return;

      socket.join(roomId);
      const user = await prisma.user.findUnique({ 
        where: { id: userId }, 
        select: { id: true, name: true, avatar: true, shortId: true } as any 
      });
      
      if (user) {
        io.to(roomId).emit('user-joined', { roomId, user });
        logger.info(`User ${userId} joined room ${roomId}`);
      }
    });

    socket.on('leave-room', (data: { roomId: string }) => {
      const roomId = typeof data === 'string' ? data : data.roomId;
      if (!roomId) return;

      socket.leave(roomId);
      io.to(roomId).emit('user-left', { roomId, userId: userId });
      logger.info(`User ${userId} left room ${roomId}`);
    });

    socket.on('send-message', async (data: { roomId: string; content: string }) => {
      try {
        if (!data.roomId || !data.content) return;
        const message = await chatService.saveMessage(data.roomId, userId, data.content);
        chatService.broadcastMessage(io, data.roomId, message);
        eventBus.publish(EVENTS.MESSAGE_SENT, { roomId: data.roomId, userId: userId, messageId: message.id });
        logger.info(`Message sent in room ${data.roomId} by user ${userId}`);
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

    socket.on('send-gift', async (data: { roomId: string; toUserId: string; giftId: string; points: number }) => {
      try {
        await monetizationService.sendGift(userId, data.toUserId, data.points);
        io.to(data.roomId).emit('new-gift-alert', {
          fromUserId: userId,
          toUserId: data.toUserId,
          giftId: data.giftId,
          points: data.points
        });
        logger.info(`Gift ${data.giftId} sent from ${userId} to ${data.toUserId} in room ${data.roomId}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
        logger.error(`Error sending gift: ${error.message}`);
      }
    });

    socket.on('send-private-message', async (data: { toUserId: string; fromUserId: string; content: string }) => {
      try {
        const privateMessage = await prisma.privateMessage.create({
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
        } else {
          // Target user is offline, send push notification
          try {
            await notificationService.sendPushNotification(
              data.toUserId,
              `New message from ${privateMessage.sender.name}`,
              data.content,
              { type: 'PRIVATE_MESSAGE', fromUserId: data.fromUserId }
            );
          } catch (error) {
            logger.error('Failed to send push notification', error);
          }
        }
        
        // Also emit back to the sender for confirmation/sync across their devices
        socket.emit('private-message-sent', privateMessage);
        
        logger.info(`Private message persisted and sent from ${data.fromUserId} to ${data.toUserId}`);
      } catch (error) {
        logger.error(`Error saving private message: ${error}`);
      }
    });

    socket.on('toggle-mute', (data: { roomId: string; isMuted: boolean }) => {
      io.to(data.roomId).emit('user-mute-updated', { userId, isMuted: data.isMuted });
      logger.info(`User ${userId} mute state in room ${data.roomId}: ${data.isMuted}`);
    });

    socket.on('lock-seat', (data: { roomId: string; seatIndex: number }) => {
      io.to(data.roomId).emit('seat-locked', { seatIndex: data.seatIndex });
    });

    socket.on('unlock-seat', (data: { roomId: string; seatIndex: number }) => {
      io.to(data.roomId).emit('seat-unlocked', { seatIndex: data.seatIndex });
    });

    socket.on('join-seat', (data: { roomId: string; seatIndex: number }) => {
      io.to(data.roomId).emit('seat-joined', { userId, seatIndex: data.seatIndex });
      logger.info(`User ${userId} joined seat ${data.seatIndex} in room ${data.roomId}`);
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
