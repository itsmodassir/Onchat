import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class EventBus {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers: Map<string, Function[]>;

  constructor() {
    this.publisher = new Redis(REDIS_URL);
    this.subscriber = new Redis(REDIS_URL);
    this.handlers = new Map();

    this.subscriber.on('message', (channel, message) => {
      const callbacks = this.handlers.get(channel);
      if (callbacks) {
        try {
          const parsedMessage = JSON.parse(message);
          callbacks.forEach((cb) => cb(parsedMessage));
        } catch (e) {
          console.error('Failed to parse event message', e);
        }
      }
    });
  }

  publish(channel: string, event: Record<string, any>) {
    this.publisher.publish(channel, JSON.stringify(event));
  }

  subscribe(channel: string, callback: (event: any) => void) {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, []);
      this.subscriber.subscribe(channel);
    }
    this.handlers.get(channel)?.push(callback);
  }
}

export const eventBus = new EventBus();

// Standard Event Names
export const EVENTS = {
  USER_JOINED_ROOM: 'USER_JOINED_ROOM',
  MESSAGE_SENT: 'MESSAGE_SENT',
  GIFT_SENT: 'GIFT_SENT',
  ROOM_CREATED: 'ROOM_CREATED',
};
