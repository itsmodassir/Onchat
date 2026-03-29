"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialController = void 0;
const social_service_1 = require("../services/social.service");
exports.socialController = {
    async follow(req, res) {
        try {
            const { userId } = req.body;
            const followerId = req.user.id;
            const result = await social_service_1.socialService.follow(followerId, userId);
            res.status(201).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async unfollow(req, res) {
        try {
            const { userId } = req.params;
            const followerId = req.user.id;
            await social_service_1.socialService.unfollow(followerId, userId);
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getFollowers(req, res) {
        try {
            const { userId } = req.params;
            const followers = await social_service_1.socialService.getFollowers(userId);
            res.json(followers);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getFollowing(req, res) {
        try {
            const { userId } = req.params;
            const following = await social_service_1.socialService.getFollowing(userId);
            res.json(following);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getFriends(req, res) {
        try {
            const userId = req.user.id;
            const friends = await social_service_1.socialService.getFriends(userId);
            res.json(friends);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};
