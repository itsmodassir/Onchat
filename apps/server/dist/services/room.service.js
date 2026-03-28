import { prisma } from '../utils/db';
import { eventBus, EVENTS } from '../utils/eventBus';
import { logger } from '../utils/logger';
const RoomStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
};
const Role = {
    HOST: 'HOST',
    LISTENER: 'LISTENER',
    SPEAKER: 'SPEAKER',
};
export const roomService = {
    async createRoom(title, hostId) {
        const room = await prisma.room.create({
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
        logger.info(`Room created: ${room.id} by host: ${hostId}`);
        eventBus.publish(EVENTS.ROOM_CREATED, { roomId: room.id, hostId });
        return room;
    },
    async joinRoom(roomId, userId) {
        // Check if player is already a participant
        const existingParticipant = await prisma.participant.findUnique({
            where: {
                userId_roomId: { userId, roomId },
            },
        });
        if (existingParticipant) {
            return existingParticipant;
        }
        const participant = await prisma.participant.create({
            data: {
                roomId,
                userId,
                role: Role.LISTENER,
            },
        });
        logger.info(`User: ${userId} joined room: ${roomId}`);
        eventBus.publish(EVENTS.USER_JOINED_ROOM, { roomId, userId });
        return participant;
    },
    async leaveRoom(roomId, userId) {
        return await prisma.participant.delete({
            where: {
                userId_roomId: { userId, roomId },
            },
        });
    },
    async getRooms() {
        return await prisma.room.findMany({
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
        return await prisma.room.findUnique({
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
