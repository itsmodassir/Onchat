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
exports.userController = void 0;
const user_service_1 = require("../services/user.service");
exports.userController = {
    /**
     * Get public profile by query string (id or shortId)
     */
    async getProfile(req, res) {
        try {
            const { query } = req.params;
            const profile = await user_service_1.UserService.getProfile(query);
            res.json(profile);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    },
    /**
     * Search users by keyword
     */
    async searchUsers(req, res) {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                return res.status(400).json({ error: 'Search query is required' });
            }
            const users = await user_service_1.UserService.searchUsers(q);
            res.json(users);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    /**
     * Update current user's bio
     */
    async updateBio(req, res) {
        try {
            const userId = req.user.id;
            const { bio } = req.body;
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/db')));
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { bio }
            });
            res.json(updatedUser);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};
