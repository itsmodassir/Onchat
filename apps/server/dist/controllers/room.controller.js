"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = void 0;
const room_service_1 = require("../services/room.service");
const voice_service_1 = require("../services/voice.service");
const agora_token_1 = require("agora-token");
exports.roomController = {
    async createRoom(req, res) {
        try {
            const { title } = req.body;
            const room = await room_service_1.roomService.createRoom(title, req.user.userId);
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
            // Generate Agora Token for the user
            const token = voice_service_1.voiceService.generateRtcToken(roomId, Math.floor(Math.random() * 10000), agora_token_1.RtcRole.SUBSCRIBER);
            res.json({ participant, rtcToken: token });
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
};
