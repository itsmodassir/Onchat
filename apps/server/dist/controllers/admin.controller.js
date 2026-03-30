"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const admin_service_1 = require("../services/admin.service");
const logger_1 = require("../utils/logger");
exports.adminController = {
    async getUsers(req, res) {
        try {
            const users = await admin_service_1.adminService.getAllUsers();
            res.json(users);
        }
        catch (error) {
            logger_1.logger.error('ADMIN_GET_USERS_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async updateBalance(req, res) {
        try {
            const { userId } = req.params;
            const { coins, diamonds, crystals } = req.body;
            const user = await admin_service_1.adminService.updateUserBalance(userId, { coins, diamonds, crystals });
            res.json(user);
        }
        catch (error) {
            logger_1.logger.error('ADMIN_UPDATE_BALANCE_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async addCoins(req, res) {
        try {
            const { userId } = req.params;
            const { amount } = req.body;
            if (!amount || amount <= 0) {
                return res.status(400).json({ error: 'Invalid coin amount' });
            }
            const user = await admin_service_1.adminService.addCoins(userId, amount);
            res.json(user);
        }
        catch (error) {
            logger_1.logger.error('ADMIN_ADD_COINS_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async toggleReseller(req, res) {
        try {
            const { userId } = req.params;
            const { isReseller } = req.body;
            const user = await admin_service_1.adminService.toggleReseller(userId, isReseller);
            res.json(user);
        }
        catch (error) {
            logger_1.logger.error('ADMIN_TOGGLE_RESELLER_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getStats(req, res) {
        try {
            const stats = await admin_service_1.adminService.getAdminStats();
            res.json(stats);
        }
        catch (error) {
            logger_1.logger.error('ADMIN_GET_STATS_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getDetailedAnalytics(req, res) {
        try {
            const analytics = await admin_service_1.adminService.getDetailedAnalytics();
            res.json(analytics);
        }
        catch (error) {
            logger_1.logger.error('ADMIN_GET_DETAILED_ANALYTICS_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const user = await admin_service_1.adminService.updateUser(userId, req.body);
            res.json(user);
        }
        catch (error) {
            logger_1.logger.error('ADMIN_UPDATE_USER_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            await admin_service_1.adminService.deleteUser(userId);
            res.json({ success: true });
        }
        catch (error) {
            logger_1.logger.error('ADMIN_DELETE_USER_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async banUser(req, res) {
        try {
            const { userId } = req.params;
            const { isBanned } = req.body;
            const user = await admin_service_1.adminService.toggleUserBan(userId, isBanned);
            res.json(user);
        }
        catch (error) {
            logger_1.logger.error('ADMIN_BAN_USER_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getActivityStream(req, res) {
        try {
            const stream = await admin_service_1.adminService.getGlobalActivityStream();
            res.json(stream);
        }
        catch (error) {
            logger_1.logger.error('ADMIN_GET_ACTIVITY_STREAM_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getSettings(req, res) {
        try {
            const settings = await admin_service_1.adminService.getSystemConfigs();
            res.json(settings);
        }
        catch (error) {
            logger_1.logger.error('ADMIN_GET_SETTINGS_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async updateSettings(req, res) {
        try {
            const { key, value } = req.body;
            const setting = await admin_service_1.adminService.updateSystemConfig(key, value);
            res.json(setting);
        }
        catch (error) {
            logger_1.logger.error('ADMIN_UPDATE_SETTINGS_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getIdentityLogs(req, res) {
        try {
            const { userId } = req.params;
            const logs = await admin_service_1.adminService.getIdentityLogs(userId);
            res.json(logs);
        }
        catch (error) {
            logger_1.logger.error('ADMIN_GET_IDENTITY_LOGS_ERROR:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
