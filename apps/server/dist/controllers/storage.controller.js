"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCoverPhoto = exports.setProfilePhoto = exports.getStorageStats = exports.deleteMedia = exports.getUserMedia = exports.uploadMedia = void 0;
const storage_service_1 = require("../services/storage.service");
const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const userId = req.user.id;
        const media = await storage_service_1.StorageService.uploadMedia(userId, req.file);
        res.status(201).json(media);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.uploadMedia = uploadMedia;
const getUserMedia = async (req, res) => {
    try {
        const userId = req.user.id;
        const media = await storage_service_1.StorageService.getUserMedia(userId);
        res.json(media);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserMedia = getUserMedia;
const deleteMedia = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        await storage_service_1.StorageService.deleteMedia(userId, id);
        res.json({ message: 'Media deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.deleteMedia = deleteMedia;
const getStorageStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const stats = await storage_service_1.StorageService.getStorageStats(userId);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getStorageStats = getStorageStats;
const setProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;
        const { mediaId } = req.body;
        const updatedUser = await storage_service_1.StorageService.setProfilePhoto(userId, mediaId);
        res.json(updatedUser);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.setProfilePhoto = setProfilePhoto;
const setCoverPhoto = async (req, res) => {
    try {
        const userId = req.user.id;
        const { mediaId } = req.body;
        const updatedUser = await storage_service_1.StorageService.setCoverPhoto(userId, mediaId);
        res.json(updatedUser);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.setCoverPhoto = setCoverPhoto;
