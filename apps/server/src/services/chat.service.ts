import { prisma } from '../utils/db';
import { eventBus, EVENTS } from '../utils/eventBus';
import { logger } from '../utils/logger';

import { monetizationService } from './monetization.service';
import { notificationService } from './notification.service';
import { moderationService } from './moderation.service';
import { gamificationService } from './gamification.service';
import { gameService } from './game.service';
import { roomService } from './room.service';

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

        // Start XP Heartbeat (5 XP every 5 minutes)
        const heartbeatInterval = setInterval(async () => {
          try {
            await gamificationService.awardXP(activeUserId, 5, 'active_participation');
          } catch (err) {
            logger.error(`Heartbeat XP error for ${activeUserId}: ${err}`);
          }
        }, 5 * 60 * 1000);

        socket.heartbeatInterval = heartbeatInterval;

        // Listen for Wallet and Level Updates for this user
        eventBus.subscribe(EVENTS.WALLET_UPDATE, (data: any) => {
          if (data.userId === activeUserId) {
            socket.emit('wallet-update', data);
          }
        });

        eventBus.subscribe(EVENTS.LEVEL_UP, (data: any) => {
          if (data.userId === activeUserId) {
            socket.emit('level-up', data);
          }
        });
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
        
        // Award XP for joining
        await gamificationService.awardXP(userId, 5, 'room_join');
      }
    });

    socket.on('leave-room', async (data: { roomId: string }) => {
      const roomId = typeof data === 'string' ? data : data.roomId;
      if (!roomId) return;

      try {
        await roomService.leaveRoom(roomId, userId);
        socket.leave(roomId);
        io.to(roomId).emit('user-left', { roomId, userId: userId });
        logger.info(`User ${userId} left room ${roomId} (Purged from DB)`);
      } catch (err) {
        logger.error(`Error leaving room ${roomId}: ${err}`);
      }
    });

    socket.on('send-message', async (data: { roomId: string; content: string }) => {
      try {
        if (!data.roomId || !data.content) return;
        const message = await chatService.saveMessage(data.roomId, userId, data.content);
        chatService.broadcastMessage(io, data.roomId, message);
        eventBus.publish(EVENTS.MESSAGE_SENT, { roomId: data.roomId, userId: userId, messageId: message.id });
        logger.info(`Message sent in room ${data.roomId} by user ${userId}`);

        // Award XP for messaging
        await gamificationService.awardXP(userId, 2, 'message_sent');
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

    socket.on('lock-seat', async (data: { roomId: string; seatIndex: number }) => {
      try {
        await roomService.toggleSeatLock(data.roomId, data.seatIndex, true);
        io.to(data.roomId).emit('seat-locked', { seatIndex: data.seatIndex });
        logger.info(`Seat ${data.seatIndex} locked in room ${data.roomId}`);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('unlock-seat', async (data: { roomId: string; seatIndex: number }) => {
      try {
        await roomService.toggleSeatLock(data.roomId, data.seatIndex, false);
        io.to(data.roomId).emit('seat-unlocked', { seatIndex: data.seatIndex });
        logger.info(`Seat ${data.seatIndex} unlocked in room ${data.roomId}`);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('end-room', async (data: { roomId: string }) => {
      try {
        await roomService.endRoom(data.roomId, userId);
        io.to(data.roomId).emit('room-ended', { roomId: data.roomId });
        logger.info(`Host ${userId} initiated Room end for ${data.roomId}`);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('join-seat', async (data: { roomId: string; seatIndex: number }) => {
      try {
        const participant = await roomService.joinSeat(data.roomId, userId, data.seatIndex);
        io.to(data.roomId).emit('seat-joined', { 
          userId, 
          seatIndex: data.seatIndex, 
          user: participant.user 
        });
        logger.info(`User ${userId} joined seat ${data.seatIndex} in room ${data.roomId}`);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('leave-seat', async (data: { roomId: string }) => {
      try {
        await roomService.leaveSeat(data.roomId, userId);
        io.to(data.roomId).emit('seat-left', { userId });
        logger.info(`User ${userId} left seat in room ${data.roomId}`);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('remove-from-seat', async (data: { roomId: string; targetUserId: string }) => {
      try {
        // Verify host (simplified check: fetch room)
        const room = await (prisma.room as any).findUnique({ where: { id: data.roomId } });
        if (room?.hostId !== userId) throw new Error('Only host can remove from seat');

        await roomService.leaveSeat(data.roomId, data.targetUserId);
        io.to(data.roomId).emit('seat-left', { userId: data.targetUserId });
        logger.info(`Host ${userId} removed ${data.targetUserId} from seat in room ${data.roomId}`);
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('kick-user', async (data: { roomId: string; targetUserId: string }) => {
      try {
        // Authenticate as host (simplified for now)
        await roomService.kickUser(data.roomId, data.targetUserId);
        
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
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('toggle-room-lock', async (data: { roomId: string; isLocked: boolean }) => {
      try {
        await roomService.toggleRoomLock(data.roomId, data.isLocked);
        io.to(data.roomId).emit('room-lock-updated', { isLocked: data.isLocked });
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });


    socket.on('start-griddy-round', async (data: { roomId: string }) => {
      try {
        const roundInfo = await gameService.startRound(data.roomId);
        io.to(data.roomId).emit('griddy-round-started', roundInfo);

        // Start 10s Countdown
        let timeLeft = 10;
        const countdown = setInterval(() => {
          timeLeft--;
          if (timeLeft > 0) {
            io.to(data.roomId).emit('griddy-countdown', { timeLeft });
          } else {
            clearInterval(countdown);
            // Process Round
            gameService.processRound(data.roomId).then(result => {
              io.to(data.roomId).emit('griddy-round-result', result);
            }).catch(err => {
              logger.error(`Error processing round in ${data.roomId}: ${err}`);
            });
          }
        }, 1000);

      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('place-griddy-bet', async (data: { roomId: string; betAmount: number }) => {
      try {
        const betInfo = await gameService.placeBet(data.roomId, userId, data.betAmount);
        io.to(data.roomId).emit('griddy-bet-placed', betInfo);
      } catch (err: any) {
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
            await (prisma.participant as any).deleteMany({
              where: { userId: uid }
            });
            logger.info(`User ${uid} disconnected. Purged all room memberships.`);
          } catch (err) {
            logger.error(`Disconnect cleanup error for user ${uid}: ${err}`);
          }
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
