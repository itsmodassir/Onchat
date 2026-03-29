import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { logger } from '../utils/logger';

const APP_ID = process.env.AGORA_APP_ID || '';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';

export const agoraService = {
  generateRtcToken(channelName: string, uid: number, role: 'publisher' | 'subscriber' = 'subscriber') {
    if (!APP_ID || !APP_CERTIFICATE) {
      logger.error('Agora APP_ID or APP_CERTIFICATE not set');
      throw new Error('Agora configuration missing');
    }

    const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      agoraRole,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    return token;
  },
};
