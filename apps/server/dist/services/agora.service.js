"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agoraService = void 0;
const agora_token_1 = require("agora-token");
const logger_1 = require("../utils/logger");
const APP_ID = process.env.AGORA_APP_ID || '';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';
exports.agoraService = {
    generateRtcToken(channelName, uid, role = 'subscriber') {
        if (!APP_ID || !APP_CERTIFICATE) {
            logger_1.logger.error('Agora APP_ID or APP_CERTIFICATE not set');
            throw new Error('Agora configuration missing');
        }
        const agoraRole = role === 'publisher' ? agora_token_1.RtcRole.PUBLISHER : agora_token_1.RtcRole.SUBSCRIBER;
        const expirationTimeInSeconds = 3600; // 1 hour
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
        const token = agora_token_1.RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, agoraRole, privilegeExpiredTs, privilegeExpiredTs);
        return token;
    },
};
