"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const expo_server_sdk_1 = require("expo-server-sdk");
const db_1 = require("../utils/db");
const logger_1 = require("../utils/logger");
// Create a new Expo SDK client
const expo = new expo_server_sdk_1.Expo();
exports.notificationService = {
    async sendPushNotification(userId, title, body, data) {
        try {
            const user = await db_1.prisma.user.findUnique({
                where: { id: userId },
                select: { expoPushToken: true }
            });
            if (!user || !user.expoPushToken) {
                return; // User has no push token registered
            }
            const pushToken = user.expoPushToken;
            if (!expo_server_sdk_1.Expo.isExpoPushToken(pushToken)) {
                logger_1.logger.error(`Push token ${pushToken} is not a valid Expo push token`);
                return;
            }
            const message = {
                to: pushToken,
                sound: 'default',
                title,
                body,
                data: data || {},
            };
            const chunks = expo.chunkPushNotifications([message]);
            const tickets = [];
            for (const chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                }
                catch (error) {
                    logger_1.logger.error('Error sending push notification chunk:', error);
                }
            }
            // Check for errors in tickets
            for (const ticket of tickets) {
                if (ticket.status === 'error') {
                    logger_1.logger.error(`Push notification error: ${ticket.message}`);
                    if (ticket.details && ticket.details.error === 'DeviceNotRegistered') {
                        // Remove token from database if device is no longer registered
                        await db_1.prisma.user.update({
                            where: { id: userId },
                            data: { expoPushToken: null }
                        });
                        logger_1.logger.info(`Removed invalid push token for user ${userId}`);
                    }
                }
            }
        }
        catch (error) {
            logger_1.logger.error('NOTIFICATION_SERVICE_ERROR:', error);
        }
    }
};
