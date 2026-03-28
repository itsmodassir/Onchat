"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KAFKA_TOPICS = exports.kafkaBus = void 0;
const kafkajs_1 = require("kafkajs");
const logger_1 = require("./logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const KAFKA_BROKERS = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'];
const CLIENT_ID = 'onchat-server';
class KafkaEventBus {
    constructor() {
        this.consumers = new Map();
        this.isConnected = false;
        this.kafka = new kafkajs_1.Kafka({
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
            logger_1.logger.info('Kafka producer connected successfully.');
        }
        catch (error) {
            logger_1.logger.error(`Failed to connect Kafka producer: ${error}`);
        }
    }
    async publish(topic, event) {
        if (!this.isConnected) {
            logger_1.logger.warn('Kafka producer not connected. Attempting to connect...');
            await this.connect();
        }
        try {
            await this.producer.send({
                topic,
                messages: [{ value: JSON.stringify(event) }],
            });
            logger_1.logger.info(`Message published to Kafka topic: ${topic}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to publish message to Kafka topic ${topic}: ${error}`);
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
                            logger_1.logger.error(`Error processing Kafka message on topic ${topic}: ${err}`);
                        }
                    }
                },
            });
            this.consumers.set(`${groupId}-${topic}`, consumer);
            logger_1.logger.info(`Kafka consumer connected for topic: ${topic}, group: ${groupId}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to start Kafka consumer for topic ${topic}: ${error}`);
        }
    }
}
exports.kafkaBus = new KafkaEventBus();
// Standard Kafka Topics
exports.KAFKA_TOPICS = {
    USER_JOINED_ROOM: 'events.room.user_joined',
    MESSAGE_SENT: 'events.chat.message_sent',
    GIFT_SENT: 'events.payment.gift_sent',
    ROOM_CREATED: 'events.room.created',
};
