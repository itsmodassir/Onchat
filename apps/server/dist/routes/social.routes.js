"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const social_controller_1 = require("../controllers/social.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.post('/follow', social_controller_1.socialController.follow);
router.delete('/unfollow/:userId', social_controller_1.socialController.unfollow);
router.get('/followers/:userId', social_controller_1.socialController.getFollowers);
router.get('/following/:userId', social_controller_1.socialController.getFollowing);
router.get('/friends', social_controller_1.socialController.getFriends);
router.get('/conversations', social_controller_1.socialController.getConversations);
router.get('/history/:targetUserId', social_controller_1.socialController.getMessageHistory);
// Tier 3: AI Personalization
router.patch('/interests', async (req, res) => {
    try {
        const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/db')));
        const { interests } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user.userId },
            data: { interests }
        });
        res.json(user);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.get('/recommended-rooms', async (req, res) => {
    try {
        const { recommendationService } = await Promise.resolve().then(() => __importStar(require('../services/recommendation.service')));
        const rooms = await recommendationService.getUserRecommendations(req.user.userId);
        res.json(rooms);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
exports.default = router;
