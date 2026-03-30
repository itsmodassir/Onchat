# Onchat - Voice Social Platform 🎙️

Onchat is a startup-grade, production-ready social audio platform (HelloYo clone) built for high scale. It features a synchronized real-time experience across Web and Mobile.

---

## 🏗️ Architecture Overview

Onchat follows a decoupled, event-driven microservices-inspired architecture.

- **Backend API (`apps/server`)**: Node.js + Express + TypeScript + **Prisma 7**.
- **Web App (`apps/user-web`)**: React 18 + Vite + TailwindCSS.
- **Mobile Client (`apps/mobile`)**: React Native (Expo) - Standardized for Android (Gradle 8.13).
- **Real-time Engine**: Socket.io + Redis Adapter (for horizontal scaling).
- **Voice Infrastructure**: **Agora RTC** (Standardized 48kHz Mono).
- **Database**: PostgreSQL with a double-entry financial ledger system.
- **Event Bus**: Kafka (kafkajs) for durable, asynchronous inter-service events.

---

## 📁 Technical Documentation

Detailed guides are located in the [**`apps/docs`**](./apps/docs) directory:

- [**Architecture Guide**](./apps/docs/architecture.md): Deep dive into the ecosystem components.
- [**Feature Hub**](./apps/docs/features.md): List of synchronized Web/Mobile features.
- [**Deployment Guide**](./apps/docs/deployment.md): Instructions for AWS, PM2, and Prisma.
- [**Mobile Stability**](./apps/docs/mobile-fixes.md): Logs for binary build and type fixes.

---

## 🚀 Quick Start

### 1. Infrastructure
Run the local infrastructure via Docker:
```bash
docker-compose up -d
```

### 2. Backend & Database
```bash
cd apps/server
npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push
npm run dev
```

### 3. Web & Mobile
- **Web**: `cd apps/user-web && npm install && npm run dev`
- **Mobile**: `cd apps/mobile && npm install && npx expo run:android`

---

## 🌍 Production Deployment (AWS)

Onchat is deployed on AWS EC2 (`13.126.135.253`).

- **Backend**: Managed via **PM2** (`onchat-server`).
- **Frontend**: Served via **Nginx** at `app.onchat.fun`.
- **Sync**: Pull latest from `main` and run `npx turbo build`.

For full deployment steps, see the [Deployment Guide](./apps/docs/deployment.md).

---

## 📈 Scalability Highlights
- **Universal Audio**: Standardized **MusicStandard** 48kHz for seamless Web-Mobile voice.
- **Kafka Streaming**: All gifts and room events are durable and replayable.
- **Wallet Ledger**: ACID-compliant financial system preventing double-spending.
- **Market Ready**: Includes a Seed-Stage Investor Pitch (`investor_pitch.md`).

---
Built with ❤️ by your AI Pair Programmer.