"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENTS = exports.eventBus = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
class EventBus {
    constructor() {
        this.publisher = new ioredis_1.default(REDIS_URL);
        this.subscriber = new ioredis_1.default(REDIS_URL);
        this.handlers = new Map();
        this.subscriber.on('message', (channel, message) => {
            const callbacks = this.handlers.get(channel);
            if (callbacks) {
                try {
                    const parsedMessage = JSON.parse(message);
                    callbacks.forEach((cb) => cb(parsedMessage));
                }
                catch (e) {
                    console.error('Failed to parse event message', e);
                }
            }
        });
    }
    publish(channel, event) {
        this.publisher.publish(channel, JSON.stringify(event));
    }
    subscribe(channel, callback) {
        if (!this.handlers.has(channel)) {
            this.handlers.set(channel, []);
            this.subscriber.subscribe(channel);
        }
        this.handlers.get(channel)?.push(callback);
    }
}
exports.eventBus = new EventBus();
// Standard Event Names
exports.EVENTS = {
    USER_JOINED_ROOM: 'USER_JOINED_ROOM',
    MESSAGE_SENT: 'MESSAGE_SENT',
    GIFT_SENT: 'GIFT_SENT',
    ROOM_CREATED: 'ROOM_CREATED',
    LEVEL_UP: 'LEVEL_UP',
    WALLET_UPDATE: 'WALLET_UPDATE',
};
