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

    // Enforce SINGLE ROOM JOIN: Remove user from all other rooms first
    await (prisma.participant as any).deleteMany({
      where: { 
        userId,
        roomId: { not: roomId } // Remove from any room except the one they are joining
      }
    });

    // Check if player is already a participant in THIS room
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

  async joinSeat(roomId: string, userId: string, seatIndex: number) {
    // Check if room is locked or this specific seat is locked
    const room = await (prisma.room as any).findUnique({
      where: { id: roomId },
      select: { hostId: true, isLocked: true, lockedSeats: true }
    });

    if (room?.isLocked && room.hostId !== userId) {
      throw new Error('Room is locked by host. No new speakers allowed.');
    }

    if (room?.lockedSeats?.includes(seatIndex) && room.hostId !== userId) {
      throw new Error('This seat is locked by the host.');
    }

    // Check if seat is already occupied
    const occupied = await prisma.participant.findFirst({
      where: { roomId, seatIndex }
    });
    if (occupied) throw new Error('Seat already occupied');

    const participant = await (prisma.participant as any).update({
      where: { userId_roomId: { userId, roomId } },
      data: { 
        seatIndex, 
        role: Role.SPEAKER as any 
      },
      include: { user: true }
    });

    logger.info(`User ${userId} joined seat ${seatIndex} in room ${roomId}`);
    return participant;
  },

  async toggleSeatLock(roomId: string, seatIndex: number, isLocked: boolean) {
    const room = await (prisma.room as any).findUnique({
      where: { id: roomId },
      select: { lockedSeats: true }
    });

    let lockedSeats = room?.lockedSeats || [];
    if (isLocked) {
      if (!lockedSeats.includes(seatIndex)) {
        lockedSeats.push(seatIndex);
      }
    } else {
      lockedSeats = lockedSeats.filter((s: number) => s !== seatIndex);
    }

    return await (prisma.room as any).update({
      where: { id: roomId },
      data: { lockedSeats }
    });
  },


  async leaveSeat(roomId: string, userId: string) {
    const participant = await (prisma.participant as any).update({
      where: { userId_roomId: { userId, roomId } },
      data: { 
        seatIndex: null, 
        role: Role.LISTENER as any 
      },
      include: { user: true }
    });

    logger.info(`User ${userId} left seat in room ${roomId}`);
    return participant;
  },

  async kickUser(roomId: string, userId: string) {
    await prisma.participant.delete({
      where: { userId_roomId: { userId, roomId } }
    });
    logger.info(`User ${userId} kicked from room ${roomId}`);
  },

  async toggleRoomLock(roomId: string, isLocked: boolean) {
    return await (prisma.room as any).update({
      where: { id: roomId },
      data: { isLocked }
    });
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
    // 1. Remove the participant record
    const participant = await prisma.participant.delete({
      where: {
        userId_roomId: { userId, roomId },
      },
    });

    // 2. Log if host is leaving, but let the room stay ACTIVE
    const room = await (prisma.room as any).findUnique({
      where: { id: roomId },
      select: { hostId: true }
    });

    if (room && room.hostId === userId) {
      logger.info(`Host ${userId} left. Room ${roomId} remains ACTIVE.`);
    }

    return participant;
  },

  async endRoom(roomId: string, userId: string) {
    const room = await (prisma.room as any).findUnique({
      where: { id: roomId },
      select: { hostId: true }
    });

    if (room && room.hostId === userId) {
      await (prisma.room as any).update({
        where: { id: roomId },
        data: { status: 'INACTIVE' }
      });
      logger.info(`Host ${userId} ended session. Room ${roomId} set to INACTIVE.`);
      eventBus.publish('ROOM_CLOSED', { roomId });
    } else {
      throw new Error('Only the host can end the session.');
    }
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
