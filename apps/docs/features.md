# Onchat Feature Parity & Guide

A comprehensive list of user-facing features fully synchronized between Web and Mobile clients.

## 📡 Core Social Audio

### 1. Room Creation & Hosting
- **Host Role**: Full control over audio track publishing.
- **Audience Role**: Default to listener, switch to speaker via `setClientRole`.
- **Discovery**: Real-time room list with active host count and category filtering.

### 2. Standardized Audio Quality
- **Profiles**: Both Web and Mobile use **48kHz Mono** (MusicStandard).
- **Parity**: Real-time voice across platforms (Web users can hear Mobile users and vice versa).

---

## 👤 Profile & Social Hub

### 3. High-Fidelity Avatar Uploads
- **Web**: Integrated `Camera` and `File` upload logic.
- **Mobile**: `expo-image-picker` with backend persistence.
- **ID Sync**: Use a unified `UserId` to ensure your profile follows you everywhere.

### 4. Interactive "Discovery Hub"
- **Web**: Professional-grade sidebar navigation for **Explore**, **Rooms**, and **Games**.
- **Social Action**: Inline "Follow" system directly from the Discovery feed.

---

## 🎮 Gamification & Wallet

### 5. "Griddy" Lucky Slot Game
- **Real-time History**: Fetch live winners across the ecosystem.
- **Coin Integration**: Direct link to the **Wallet Hub** for easy coin top-ups.
- **Game Engine**: Server-side result generation for fair play.

### 6. Unified Wallet System
- **Coins & Diamonds**: ACID-compliant currency tracking.
- **Gifting**: Integrated gifting system to support hosts in any room.

---

## 🛠️ Upcoming Features
- **Razorpay Integration**: Real-money wallet top-ups (Current: Sandbox).
- **Agency Management**: Enhanced reporting for agency owners.
- **Level Progression**: EXP tracking based on room participation and gifting.
