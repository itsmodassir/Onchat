# Mobile Stability & Fix Log

Documentation for the critical environment and build fixes performed to ensure Android compatibility and stable TypeScript linting in the mobile application.

## 🛠️ Build System

### 1. Gradle 8.13 Upgrade
The application was failing to build on modern environments due to an outdated Gradle version.
- **Problem**: `Minimum supported Gradle version is 8.13. Current version is 8.10.2`.
- **Fix**: Updated `apps/mobile/android/gradle/wrapper/gradle-wrapper.properties` to use:
  ```properties
  distributionUrl=https://services.gradle.org/distributions/gradle-8.13-bin.zip
  ```

---

## 🎨 UI & Icon Precision

### 2. Lucide Icon Type Resolution
In the mono-repo environment, TypeScript was incorrectly inferring "Web" types (`SVGSVGElement`) for mobile icons, causing numerous property errors (`Property 'color' does not exist`).
- **Problem**: `Type '{ size: number; color: string; }' is not assignable to type 'IntrinsicAttributes & LucideProps & RefAttributes<SVGSVGElement>'`.
- **Fix**: Implemented an `Icons` abstraction in `RoomScreen.tsx` using **explicit type casting** (`(as any)`) to bypass the incorrect inference.
- **Dependency**: Added `react-native-svg` to `package.json` to provide the necessary peer dependency for `lucide-react-native`.

---

## 🎙️ Agora RTC Real-time Audio

### 3. Audio Scenario Standardization
Version 4.x of the `react-native-agora` SDK requires specific scenarios for high-fidelity music-like audio.
- **Optimization**: Switched from `AudioScenarioChatting` to **`AudioScenarioMeeting`**.
- **Reason**: `AudioScenarioMeeting` is better suited for the **MusicStandard** (48kHz) profile, ensuring clear two-way communication between mobile and web users.

---

## 🔍 Maintenance Tips
- **Prebuild**: Always run `npx expo prebuild` after updating `package.json` to sync native folders.
- **Types**: If `Lucide` icons show red lines in the IDE, verify that `react-native-svg` is installed and that the icon is correctly typed for Native.
