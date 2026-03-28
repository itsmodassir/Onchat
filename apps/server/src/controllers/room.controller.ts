import { Request, Response } from 'express';
import { roomService } from '../services/room.service';
import { voiceService } from '../services/voice.service';
import { RtcRole } from 'agora-token';

export const roomController = {
  async createRoom(req: any, res: Response) {
    try {
      const { title } = req.body;
      const room = await roomService.createRoom(title, req.user.userId);
      res.status(201).json(room);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async joinRoom(req: any, res: Response) {
    try {
      const { roomId } = req.params;
      const participant = await roomService.joinRoom(roomId, req.user.userId);
      
      // Generate Agora Token for the user
      const token = voiceService.generateRtcToken(roomId, Math.floor(Math.random() * 10000), RtcRole.SUBSCRIBER);
      
      res.json({ participant, rtcToken: token });
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

  async getRoomById(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const room = await roomService.getRoomById(roomId);
      res.json(room);
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
};
