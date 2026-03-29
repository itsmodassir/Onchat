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
  async createRoom(title: string, hostId: string, requiresPermission: boolean = false, isScheduled: boolean = false, scheduledAt?: string) {
    const room = await (prisma.room as any).create({
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
            role: Role.HOST as any,
          },
        },
      },
      include: {
        host: true,
        participants: true,
      },
    });
    logger.info(`Room created: ${room.id} (${isScheduled ? 'SCHEDULED' : 'LIVE'}) by host: ${hostId}`);
    if (!isScheduled) {
      eventBus.publish(EVENTS.ROOM_CREATED, room);
    }
    return room;
  },

  async joinRoom(roomId: string, userId: string) {
    const room = await (prisma.room as any).findUnique({
      where: { id: roomId },
      select: { hostId: true, requiresPermission: true },
    });

    if (!room) throw new Error('Room not found');

    // Check if player is already a participant
    const existingParticipant = await prisma.participant.findUnique({
      where: {
        userId_roomId: { userId, roomId },
      },
    });

    if (existingParticipant) {
      return existingParticipant;
    }

    const status = (room.requiresPermission && room.hostId !== userId) ? 'PENDING' : 'JOINED';

    const participant = await prisma.participant.create({
      data: {
        roomId,
        userId,
        role: (room.hostId === userId ? Role.HOST : Role.LISTENER) as any,
        status: status as any,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, shortId: true } }
      }
    });

    logger.info(`User: ${userId} requested/joined room: ${roomId} with status: ${status}`);
    
    if (status === 'JOINED') {
      eventBus.publish(EVENTS.USER_JOINED_ROOM, { roomId, userId });
    } else {
      // Notify host of pending request
      eventBus.publish('USER_REQUESTED_JOIN', { roomId, userId, user: (participant as any).user });
    }

    return participant;
  },

  async approveJoin(roomId: string, userId: string) {
    const participant = await (prisma.participant as any).update({
      where: { userId_roomId: { userId, roomId } },
      data: { status: 'JOINED' as any },
      include: { user: true }
    });
    eventBus.publish(EVENTS.USER_JOINED_ROOM, { roomId, userId });
    return participant;
  },

  async rejectJoin(roomId: string, userId: string) {
    return await prisma.participant.delete({
      where: { userId_roomId: { userId, roomId } },
    });
  },

  async leaveRoom(roomId: string, userId: string) {
    return await prisma.participant.delete({
      where: {
        userId_roomId: { userId, roomId },
      },
    });
  },

  async getRooms() {
    return await prisma.room.findMany({
      where: { status: RoomStatus.ACTIVE as any },
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

  async getRoomById(roomId: string) {
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

  async getUpcomingRooms() {
    return await prisma.room.findMany({
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

  async startScheduledRoom(roomId: string, hostId: string) {
    const room = await (prisma.room as any).findUnique({ where: { id: roomId } });
    if (!room) throw new Error('Room not found');
    if (room.hostId !== hostId) throw new Error('Only the host can start this room');

    const updatedRoom = await (prisma.room as any).update({
      where: { id: roomId },
      data: { status: 'ACTIVE', isScheduled: false },
      include: { host: true, participants: true },
    });

    eventBus.publish(EVENTS.ROOM_CREATED, updatedRoom);
    return updatedRoom;
  },
};
