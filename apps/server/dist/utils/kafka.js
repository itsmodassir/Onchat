import { Kafka } from 'kafkajs';
import { logger } from './logger';
import dotenv from 'dotenv';
dotenv.config();
const KAFKA_BROKERS = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];
const CLIENT_ID = 'onchat-server';
class KafkaEventBus {
    kafka;
    producer;
    consumers = new Map();
    isConnected = false;
    constructor() {
        this.kafka = new Kafka({
            clientId: CLIENT_ID,
            brokers: KAFKA_BROKERS,
        });
        this.producer = this.kafka.producer();
    }
    async connect() {
        if (this.isConnected)
            return;
        try {
            await this.producer.connect();
            this.isConnected = true;
            logger.info('Kafka producer connected successfully.');
        }
        catch (error) {
            logger.error(`Failed to connect Kafka producer: ${error}`);
        }
    }
    async publish(topic, event) {
        if (!this.isConnected) {
            logger.warn('Kafka producer not connected. Attempting to connect...');
            await this.connect();
        }
        try {
            await this.producer.send({
                topic,
                messages: [{ value: JSON.stringify(event) }],
            });
            logger.info(`Message published to Kafka topic: ${topic}`);
        }
        catch (error) {
            logger.error(`Failed to publish message to Kafka topic ${topic}: ${error}`);
        }
    }
    async subscribe(topic, groupId, callback) {
        const consumer = this.kafka.consumer({ groupId });
        try {
            await consumer.connect();
            await consumer.subscribe({ topic, fromBeginning: true });
            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    if (message.value) {
                        try {
                            const event = JSON.parse(message.value.toString());
                            await callback(event);
                        }
                        catch (err) {
                            logger.error(`Error processing Kafka message on topic ${topic}: ${err}`);
                        }
                    }
                },
            });
            this.consumers.set(`${groupId}-${topic}`, consumer);
            logger.info(`Kafka consumer connected for topic: ${topic}, group: ${groupId}`);
        }
        catch (error) {
            logger.error(`Failed to start Kafka consumer for topic ${topic}: ${error}`);
        }
    }
}
export const kafkaBus = new KafkaEventBus();
// Standard Kafka Topics
export const KAFKA_TOPICS = {
    USER_JOINED_ROOM: 'events.room.user_joined',
    MESSAGE_SENT: 'events.chat.message_sent',
    GIFT_SENT: 'events.payment.gift_sent',
    ROOM_CREATED: 'events.room.created',
};
