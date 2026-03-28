"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const db_1 = require("../utils/db");
const eventBus_1 = require("../utils/eventBus");
const logger_1 = require("../utils/logger");
exports.chatService = {
    async saveMessage(roomId, userId, content) {
        const message = await db_1.prisma.message.create({
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
    broadcastMessage(io, roomId, message) {
        io.to(roomId).emit('new-message', message);
    },
    handleSocket(io, socket) {
        socket.on('join-room', (roomId) => {
            socket.join(roomId);
        });
        socket.on('send-message', async (data) => {
            try {
                const message = await this.saveMessage(data.roomId, data.userId, data.content);
                this.broadcastMessage(io, data.roomId, message);
                eventBus_1.eventBus.publish(eventBus_1.EVENTS.MESSAGE_SENT, { roomId: data.roomId, userId: data.userId, messageId: message.id });
                logger_1.logger.info(`Message sent in room ${data.roomId} by user ${data.userId}`);
            }
            catch (error) {
                logger_1.logger.error(`Error saving message: ${error}`);
            }
        });
    },
};
