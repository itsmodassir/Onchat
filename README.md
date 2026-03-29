# Onchat - Voice Social Platform 🎙️

Onchat is a startup-grade, production-ready social audio platform (HelloYo clone) built for high scale. 

## 🏗️ Architecture Overview

Onchat follows a decoupled, event-driven microservices-inspired architecture.

- **Frontend**: React Native (Expo) - Cross-platform (Android/iOS) mobile client.
- **Backend**: Node.js + Express + TypeScript.
- **Real-time Engine**: Socket.io + Redis Adapter (for horizontal scaling).
- **Event Bus**: Kafka (kafkajs) for durable, asynchronous inter-service events.
- **Database**: PostgreSQL (Prisma 7) with a double-entry financial ledger system.
- **Voice Infrastructure**: Agora RTC (Real-time Communication) for low-latency social audio.
- **Observability**: Structured Logging (Winston) + Rate Limiting + Health Checks.

## 📁 Project Structure

```text
.
├── apps/
│   ├── server/       # Node.js backend with Kafka & Prisma
│   └── mobile/       # React Native Expo app (Android/iOS native folders generated)
├── docker-compose.yml # Local infra (Postgres, Redis, Kafka)
└── README.md         # This file
```

## 🚀 Quick Start

### 1. Infrastructure
Run the local infrastructure via Docker:
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd apps/server
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Mobile Setup
```bash
cd apps/mobile
npm install
npx expo prebuild # Generate native folders
npx expo run:android # Or eas build
```

## 📈 Scalability Highlights
- **Kafka Streaming**: All gifts and room events are durable and replayable.
- **Wallet Ledger**: ACID-compliant financial system preventing double-spending and record loss.
- **Redis Sync**: Multi-instance socket synchronization.
- **Market Ready**: Includes a Seed-Stage Investor Pitch (`investor_pitch.md`).

---
Built with ❤️ by your AI Pair Programmer.