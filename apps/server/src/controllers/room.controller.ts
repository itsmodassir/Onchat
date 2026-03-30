import { Request, Response } from 'express';
import { roomService } from '../services/room.service';
import { voiceService } from '../services/voice.service';
import { RtcRole } from 'agora-token';

export const roomController = {
  async createRoom(req: any, res: Response) {
    try {
      const { title, requiresPermission, isScheduled, scheduledAt } = req.body;
      const room = await roomService.createRoom(title, req.user.userId, requiresPermission, isScheduled, scheduledAt);
      res.status(201).json(room);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async joinRoom(req: any, res: Response) {
    try {
      const { roomId } = req.params;
      const participant = await roomService.joinRoom(roomId, req.user.userId);
      
      if ((participant as any).status === 'PENDING') {
        return res.json({ participant, status: 'PENDING', message: 'Waiting for host approval' });
      }

      // Generate Agora Token for the user
      const token = voiceService.generateRtcToken(roomId, Math.floor(Math.random() * 10000), RtcRole.SUBSCRIBER);
      
      res.json({ participant, rtcToken: token, status: 'JOINED' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async approveJoin(req: any, res: Response) {
    try {
      const { roomId, userId } = req.params;
      const participant = await roomService.approveJoin(roomId, userId);
      res.json(participant);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async rejectJoin(req: any, res: Response) {
    try {
      const { roomId, userId } = req.params;
      await roomService.rejectJoin(roomId, userId);
      res.json({ message: 'Join request rejected' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getRooms(req: Request, res: Response) {
    try {
      const rooms = await roomService.getRooms();
      res.json(rooms);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getRoomById(req: any, res: Response) {
    try {
      const { roomId } = req.params;
      const room = await roomService.getRoomById(roomId);
      
      // Generate an audience token for the viewer
      // Use shortId numeric part as UID or a random one
      const uid = req.user?.userId ? (Number(req.user.userId.slice(0, 8)) || Math.floor(Math.random() * 100000)) : Math.floor(Math.random() * 100000);
      const rtcToken = voiceService.generateRtcToken(roomId, uid, RtcRole.SUBSCRIBER);

      res.json({ ...room, rtcToken });
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async getToken(req: any, res: Response) {
    try {
      const { channelName, uid, role } = req.query;
      const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
      const token = voiceService.generateRtcToken(String(channelName), Number(uid), rtcRole);
      res.json({ token });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async getUpcomingRooms(req: Request, res: Response) {
    try {
      const rooms = await roomService.getUpcomingRooms();
      res.json(rooms);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async startScheduledRoom(req: any, res: Response) {
    try {
      const { roomId } = req.params;
      const room = await roomService.startScheduledRoom(roomId, req.user.userId);
      res.json(room);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
