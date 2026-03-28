"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomService = void 0;
const db_1 = require("../utils/db");
const eventBus_1 = require("../utils/eventBus");
const logger_1 = require("../utils/logger");
const RoomStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
};
const Role = {
    HOST: 'HOST',
    LISTENER: 'LISTENER',
    SPEAKER: 'SPEAKER',
};
exports.roomService = {
    async createRoom(title, hostId) {
        const room = await db_1.prisma.room.create({
            data: {
                title,
                hostId,
                participants: {
                    create: {
                        userId: hostId,
                        role: Role.HOST,
                    },
                },
            },
            include: {
                host: true,
                participants: true,
            },
        });
        logger_1.logger.info(`Room created: ${room.id} by host: ${hostId}`);
        eventBus_1.eventBus.publish(eventBus_1.EVENTS.ROOM_CREATED, { roomId: room.id, hostId });
        return room;
    },
    async joinRoom(roomId, userId) {
        // Check if player is already a participant
        const existingParticipant = await db_1.prisma.participant.findUnique({
            where: {
                userId_roomId: { userId, roomId },
            },
        });
        if (existingParticipant) {
            return existingParticipant;
        }
        const participant = await db_1.prisma.participant.create({
            data: {
                roomId,
                userId,
                role: Role.LISTENER,
            },
        });
        logger_1.logger.info(`User: ${userId} joined room: ${roomId}`);
        eventBus_1.eventBus.publish(eventBus_1.EVENTS.USER_JOINED_ROOM, { roomId, userId });
        return participant;
    },
    async leaveRoom(roomId, userId) {
        return await db_1.prisma.participant.delete({
            where: {
                userId_roomId: { userId, roomId },
            },
        });
    },
    async getRooms() {
        return await db_1.prisma.room.findMany({
            where: { status: RoomStatus.ACTIVE },
            include: {
                host: {
                    select: { name: true, email: true },
                },
                _count: {
                    select: { participants: true },
                },
            },
        });
    },
    async getRoomById(roomId) {
        return await db_1.prisma.room.findUnique({
            where: { id: roomId },
            include: {
                host: true,
                participants: {
                    include: {
                        user: {
                            select: { name: true, email: true, coins: true },
                        },
                    },
                },
                messages: {
                    take: 50,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
        });
    },
};
