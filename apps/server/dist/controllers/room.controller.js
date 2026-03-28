import { roomService } from '../services/room.service';
import { voiceService } from '../services/voice.service';
import { RtcRole } from 'agora-token';
export const roomController = {
    async createRoom(req, res) {
        try {
            const { title } = req.body;
            const room = await roomService.createRoom(title, req.user.userId);
            res.status(201).json(room);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async joinRoom(req, res) {
        try {
            const { roomId } = req.params;
            const participant = await roomService.joinRoom(roomId, req.user.userId);
            // Generate Agora Token for the user
            const token = voiceService.generateRtcToken(roomId, Math.floor(Math.random() * 10000), RtcRole.SUBSCRIBER);
            res.json({ participant, rtcToken: token });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getRooms(req, res) {
        try {
            const rooms = await roomService.getRooms();
            res.json(rooms);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getRoomById(req, res) {
        try {
            const { roomId } = req.params;
            const room = await roomService.getRoomById(roomId);
            res.json(room);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    },
    async getToken(req, res) {
        try {
            const { channelName, uid, role } = req.query;
            const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
            const token = voiceService.generateRtcToken(String(channelName), Number(uid), rtcRole);
            res.json({ token });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};
