import { prisma } from '../utils/db';
import { eventBus, EVENTS } from '../utils/eventBus';
import { logger } from '../utils/logger';

export const chatService = {
  async saveMessage(roomId: string, userId: string, content: string) {
    const message = await prisma.message.create({
      data: {
        roomId,
        userId,
        content,
      },
      include: {
        user: { select: { name: true } },
      },
    });
    return message;
  },

  broadcastMessage(io: any, roomId: string, message: any) {
    io.to(roomId).emit('new-message', message);
  },

  handleSocket(io: any, socket: any) {
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
    });

    socket.on('send-message', async (data: { roomId: string; userId: string; content: string }) => {
      try {
        const message = await this.saveMessage(data.roomId, data.userId, data.content);
        this.broadcastMessage(io, data.roomId, message);
        eventBus.publish(EVENTS.MESSAGE_SENT, { roomId: data.roomId, userId: data.userId, messageId: message.id });
        logger.info(`Message sent in room ${data.roomId} by user ${data.userId}`);
      } catch (error) {
        logger.error(`Error saving message: ${error}`);
      }
    });
  },
};
