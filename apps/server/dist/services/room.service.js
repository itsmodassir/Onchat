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
    async createRoom(title, hostId, requiresPermission = false, isScheduled = false, scheduledAt) {
        const room = await db_1.prisma.room.create({
            data: {
                title,
                hostId,
                requiresPermission,
                isScheduled,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                status: isScheduled ? 'INACTIVE' : 'ACTIVE',
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
        logger_1.logger.info(`Room created: ${room.id} (${isScheduled ? 'SCHEDULED' : 'LIVE'}) by host: ${hostId}`);
        if (!isScheduled) {
            eventBus_1.eventBus.publish(eventBus_1.EVENTS.ROOM_CREATED, room);
        }
        return room;
    },
    async joinRoom(roomId, userId) {
        const room = await db_1.prisma.room.findUnique({
            where: { id: roomId },
            select: { hostId: true, requiresPermission: true },
        });
        if (!room)
            throw new Error('Room not found');
        // Check if player is already a participant
        const existingParticipant = await db_1.prisma.participant.findUnique({
            where: {
                userId_roomId: { userId, roomId },
            },
        });
        if (existingParticipant) {
            return existingParticipant;
        }
        const status = (room.requiresPermission && room.hostId !== userId) ? 'PENDING' : 'JOINED';
        const participant = await db_1.prisma.participant.create({
            data: {
                roomId,
                userId,
                role: (room.hostId === userId ? Role.HOST : Role.LISTENER),
                status: status,
            },
            include: {
                user: { select: { id: true, name: true, avatar: true, shortId: true } }
            }
        });
        logger_1.logger.info(`User: ${userId} requested/joined room: ${roomId} with status: ${status}`);
        if (status === 'JOINED') {
            eventBus_1.eventBus.publish(eventBus_1.EVENTS.USER_JOINED_ROOM, { roomId, userId });
        }
        else {
            // Notify host of pending request
            eventBus_1.eventBus.publish('USER_REQUESTED_JOIN', { roomId, userId, user: participant.user });
        }
        return participant;
    },
    async joinSeat(roomId, userId, seatIndex) {
        // Check if room is locked
        const room = await db_1.prisma.room.findUnique({
            where: { id: roomId },
            select: { hostId: true, isLocked: true }
        });
        if (room?.isLocked && room.hostId !== userId) {
            throw new Error('Room is locked by host. No new speakers allowed.');
        }
        // Check if seat is already occupied
        const occupied = await db_1.prisma.participant.findFirst({
            where: { roomId, seatIndex }
        });
        if (occupied)
            throw new Error('Seat already occupied');
        const participant = await db_1.prisma.participant.update({
            where: { userId_roomId: { userId, roomId } },
            data: {
                seatIndex,
                role: Role.SPEAKER
            },
            include: { user: true }
        });
        logger_1.logger.info(`User ${userId} joined seat ${seatIndex} in room ${roomId}`);
        return participant;
    },
    async leaveSeat(roomId, userId) {
        const participant = await db_1.prisma.participant.update({
            where: { userId_roomId: { userId, roomId } },
            data: {
                seatIndex: null,
                role: Role.LISTENER
            },
            include: { user: true }
        });
        logger_1.logger.info(`User ${userId} left seat in room ${roomId}`);
        return participant;
    },
    async kickUser(roomId, userId) {
        await db_1.prisma.participant.delete({
            where: { userId_roomId: { userId, roomId } }
        });
        logger_1.logger.info(`User ${userId} kicked from room ${roomId}`);
    },
    async toggleRoomLock(roomId, isLocked) {
        return await db_1.prisma.room.update({
            where: { id: roomId },
            data: { isLocked }
        });
    },
    async approveJoin(roomId, userId) {
        const participant = await db_1.prisma.participant.update({
            where: { userId_roomId: { userId, roomId } },
            data: { status: 'JOINED' },
            include: { user: true }
        });
        eventBus_1.eventBus.publish(eventBus_1.EVENTS.USER_JOINED_ROOM, { roomId, userId });
        return participant;
    },
    async rejectJoin(roomId, userId) {
        return await db_1.prisma.participant.delete({
            where: { userId_roomId: { userId, roomId } },
        });
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
    async getUpcomingRooms() {
        return await db_1.prisma.room.findMany({
            where: {
                isScheduled: true,
                status: 'INACTIVE',
                scheduledAt: { gt: new Date() },
            },
            include: {
                host: { select: { name: true, avatar: true } },
                _count: { select: { participants: true } },
            },
            orderBy: { scheduledAt: 'asc' },
        });
    },
    async startScheduledRoom(roomId, hostId) {
        const room = await db_1.prisma.room.findUnique({ where: { id: roomId } });
        if (!room)
            throw new Error('Room not found');
        if (room.hostId !== hostId)
            throw new Error('Only the host can start this room');
        const updatedRoom = await db_1.prisma.room.update({
            where: { id: roomId },
            data: { status: 'ACTIVE', isScheduled: false },
            include: { host: true, participants: true },
        });
        eventBus_1.eventBus.publish(eventBus_1.EVENTS.ROOM_CREATED, updatedRoom);
        return updatedRoom;
    },
};
