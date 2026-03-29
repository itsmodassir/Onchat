import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { prisma } from '../utils/db';
import { logger } from '../utils/logger';

// Create a new Expo SDK client
const expo = new Expo();

export const notificationService = {
  async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { expoPushToken: true } as any
      });

      if (!user || !(user as any).expoPushToken) {
        return; // User has no push token registered
      }

      const pushToken = (user as any).expoPushToken;

      if (!Expo.isExpoPushToken(pushToken)) {
        logger.error(`Push token ${pushToken} is not a valid Expo push token`);
        return;
      }

      const message: ExpoPushMessage = {
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
        } catch (error) {
          logger.error('Error sending push notification chunk:', error);
        }
      }

      // Check for errors in tickets
      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          logger.error(`Push notification error: ${ticket.message}`);
          if (ticket.details && ticket.details.error === 'DeviceNotRegistered') {
            // Remove token from database if device is no longer registered
            await (prisma.user as any).update({
              where: { id: userId },
              data: { expoPushToken: null }
            });
            logger.info(`Removed invalid push token for user ${userId}`);
          }
        }
      }
    } catch (error) {
      logger.error('NOTIFICATION_SERVICE_ERROR:', error);
    }
  }
};
