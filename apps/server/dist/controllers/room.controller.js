"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = void 0;
const room_service_1 = require("../services/room.service");
const voice_service_1 = require("../services/voice.service");
const agora_token_1 = require("agora-token");
exports.roomController = {
    async createRoom(req, res) {
        try {
            const { title, requiresPermission, isScheduled, scheduledAt } = req.body;
            const room = await room_service_1.roomService.createRoom(title, req.user.userId, requiresPermission, isScheduled, scheduledAt);
            res.status(201).json(room);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async joinRoom(req, res) {
        try {
            const { roomId } = req.params;
            const participant = await room_service_1.roomService.joinRoom(roomId, req.user.userId);
            if (participant.status === 'PENDING') {
                return res.json({ participant, status: 'PENDING', message: 'Waiting for host approval' });
            }
            // Generate Agora Token for the user
            const token = voice_service_1.voiceService.generateRtcToken(roomId, Math.floor(Math.random() * 10000), agora_token_1.RtcRole.SUBSCRIBER);
            res.json({ participant, rtcToken: token, status: 'JOINED' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async approveJoin(req, res) {
        try {
            const { roomId, userId } = req.params;
            const participant = await room_service_1.roomService.approveJoin(roomId, userId);
            res.json(participant);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async rejectJoin(req, res) {
        try {
            const { roomId, userId } = req.params;
            await room_service_1.roomService.rejectJoin(roomId, userId);
            res.json({ message: 'Join request rejected' });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getRooms(req, res) {
        try {
            const rooms = await room_service_1.roomService.getRooms();
            res.json(rooms);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getRoomById(req, res) {
        try {
            const { roomId } = req.params;
            const room = await room_service_1.roomService.getRoomById(roomId);
            res.json(room);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    },
    async getToken(req, res) {
        try {
            const { channelName, uid, role } = req.query;
            const rtcRole = role === 'publisher' ? agora_token_1.RtcRole.PUBLISHER : agora_token_1.RtcRole.SUBSCRIBER;
            const token = voice_service_1.voiceService.generateRtcToken(String(channelName), Number(uid), rtcRole);
            res.json({ token });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getUpcomingRooms(req, res) {
        try {
            const rooms = await room_service_1.roomService.getUpcomingRooms();
            res.json(rooms);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async startScheduledRoom(req, res) {
        try {
            const { roomId } = req.params;
            const room = await room_service_1.roomService.startScheduledRoom(roomId, req.user.userId);
            res.json(room);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};
