# Onchat Backend Server 🚀

A high-scale, event-driven backend for social audio platforms.

## 🛠 Features
- **Prisma 7 + PostgreSQL**: ACID-compliant data layer.
- **Kafka Event Bus**: Durable inter-service event streaming.
- **Socket.io + Redis**: Scalable real-time messaging and status.
- **Winston**: Structured production logging.
- **Bcrypt + JWT**: Native authentication.
- **Agora Token SDK**: Dynamic RTC token generation for audio channels.

## 📄 Key Environment Variables
Create a `.env` file in this directory:
```text
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/onchat
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_here
AGORA_APP_ID=your_id_here
AGORA_APP_CERTIFICATE=your_cert_here
KAFKA_BROKERS=localhost:9092
```

## 🧪 Testing
Run unit tests for logic validation:
```bash
npm test
```

## 🏗 Build & Deploy
```bash
npm run build      # Compile TypeScript to dist/
npm start          # Run compiled code
pm2 start dist/index.js --name onchat-server # Process manager
```
