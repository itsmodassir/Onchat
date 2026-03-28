import { RtcTokenBuilder } from 'agora-token';
import dotenv from 'dotenv';
dotenv.config();
const APP_ID = process.env.AGORA_APP_ID || '';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';
export const voiceService = {
    generateRtcToken(channelName, uid, role = 1) {
        if (!APP_ID || !APP_CERTIFICATE) {
            console.warn('Agora credentials not provided, token generation may fail');
        }
        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
        // Standard agora-token buildTokenWithUid takes 6 arguments
        // If it expects 7, some versions include both token expiry and privilege expiry
        const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpiredTs, privilegeExpiredTs // Some versions expect this twice (token expiry + privilege expiry)
        );
        return token;
    },
};
