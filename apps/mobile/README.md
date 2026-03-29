# Onchat Mobile App 📱

A cross-platform React Native app for social audio interactions.

## 🏗 Tech Stack
- **React Native (Expo)**
- **Zustand**: Fast, lightweight state management.
- **Socket.io Client**: Real-time room events and chat.
- **Agora RTC SDK**: Professional audio bridging.
- **Native Animation Driver**: Smooth speaker pulsing UI.

## 🚀 Setup & Build

### 1. Local Development
```bash
npm install
npm start # Expo dev server
```

### 2. Native Prebuild
Generate Native Android/iOS directories:
```bash
npx expo prebuild
```

### 3. Cloud Build (EAS) - RECOMMENDED
Build an APK in the cloud without local SDK dependencies:
```bash
npm install -g eas-cli
eas build --platform android --profile preview
```

## 📁 Key Components
- `src/screens/RoomScreen.tsx`: Core voice room logic.
- `src/hooks/useVoice.ts`: Agora handler.
- `src/utils/api.ts`: Centralized API client.
