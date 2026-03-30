"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceService = void 0;
const agora_token_1 = require("agora-token");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const APP_ID = process.env.AGORA_APP_ID || '';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';
exports.voiceService = {
    generateRtcToken(channelName, uid, role = 1) {
        if (!APP_ID || !APP_CERTIFICATE) {
            console.warn('Agora credentials not provided, token generation may fail');
        }
        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
        // Standard agora-token buildTokenWithUid takes 6 arguments
        // If it expects 7, some versions include both token expiry and privilege expiry
        const token = agora_token_1.RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpiredTs, privilegeExpiredTs);
        return token;
    },
};
