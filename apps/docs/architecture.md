# Onchat Ecosystem Architecture

Onchat is built as a high-scale, cross-platform social audio ecosystem. The platform ensures seamless interaction between web and mobile users through a standardized real-time engine.

## 🏗️ Core Components

### 1. Backend API (`apps/server`)
- **Technology**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL with **Prisma 7**.
- **Real-time**: Socket.io with Redis for horizontal scaling.
- **Event Bus**: Kafka for durable transaction and gift logging.
- **Audio Engine**: Agora RTC for server-side token generation.

### 2. Web Application (`apps/user-web`)
- **Technology**: React 18, Vite, TailwindCSS.
- **Real-time**: Agora RTC Web SDK (Standardized to `MusicStandard` 48kHz).
- **Core Flows**: User Discovery, Profile Management, and "Griddy" Social Gaming.

### 3. Mobile Application (`apps/mobile`)
- **Technology**: React Native (Expo), Lucide Icons.
- **Real-time**: `react-native-agora` (Standardized to `AudioScenarioMeeting`).
- **Build System**: Upgraded to **Gradle 8.13** for Android compatibility.

## 🎙️ Standardized Audio Protocol

To ensure web and mobile users can communicate clearly:
- **Profile**: `MusicStandard` (48kHz Mono).
- **Scenario**: `AudioScenarioMeeting` / `CHATTING`.
- **Mode**: `LiveBroadcasting` (Standardized Client Roles).

## 📊 Data Flow
1. **User Identity**: Unified JWT-based auth across Web and Mobile.
2. **Audio Sync**: Standardized Agora channel profiles for zero-latency cross-platform voice.
3. **Gaming**: Real-time winner feeds synchronized via the Backend's `/game/griddy/history` endpoint.
