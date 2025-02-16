# 🚀 Expo + Next.js + React Native Boilerplate

This project integrates **Expo**, **Next.js**, and **React Native** in a monorepo structure, offering seamless cross-platform development.

## 📂 Project Structure

- **app/**: Main application folder
  - **(native)**: Expo-specific components and screens
  - **(next)**: Next.js-specific components and pages
  - `_layout.tsx`: Layout configuration
  - `layout.tsx`: Main layout for Next.js
  - `not-found.tsx`: 404 page
- **assets/**: Static assets (images, fonts, etc.)
- **components/**: Reusable UI components
- **config/**: Configuration files
- **constants/**: Global constants
- **hooks/**: Custom React hooks
- **scripts/**: Automation scripts
- **store/**: State management
- **style/**: Global styles
- **vendors/**: Third-party libraries and utilities

## 🚀 Quick Start Guide

### 1️⃣ Install dependencies
```bash
npm install
```

### 2️⃣ Start Expo
```bash
npm run expo:start
```
**Run on:**
- **Android emulator**
- **iOS simulator**
- **Expo Go**
- **Web**

### 3️⃣ Start Next.js
```bash
npm run next:dev
```

## 🛠 Essential Scripts

- `npm run expo:start` → Start Expo
- `npm run expo:android` → Run Expo on Android
- `npm run expo:ios` → Run Expo on iOS
- `npm run expo:web` → Run Expo on Web
- `npm run next:dev` → Start Next.js (Development)
- `npm run next:build` → Build Next.js (Production)
- `npm run next:start` → Start Next.js (Production)
- `npm run expo:reset-project` → Reset Expo Project
- `npm run lint` → Run ESLint
- `npm run expo:test` → Run Jest Tests

## 🛠 Configuration Files

- `app.json`: Expo configuration
- `babel.config.js`: Babel setup
- `metro.config.js`: Metro bundler config
- `next.config.js`: Next.js configuration
- `tailwind.config.js`: TailwindCSS setup
- `tsconfig.json`: TypeScript configuration
- `postcss.config.mjs`: PostCSS configuration

## 📦 Dependencies

### Core
- `expo`, `next`, `react`, `react-dom`, `react-native`, `expo-router`, `zustand`

### UI & Styling
- `tailwindcss`, `daisyui`, `nativewind`, `react-native-svg`

### Utilities & Plugins
- `expo-auth-session`, `expo-constants`, `expo-document-picker`, `expo-font`, `expo-linking`, `expo-splash-screen`, `expo-status-bar`
- `react-native-mmkv`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`, `react-native-webview`

### Development Tools
- `eslint`, `jest`, `jest-expo`, `typescript`, `babel-preset-expo`

## 🧹 Reset Project
Run:
```bash
npm run expo:reset-project
```

## 📖 Learn More
- [🚀 Expo Documentation](https://docs.expo.dev/)
- [⚡ Next.js Documentation](https://nextjs.org/docs)
- [📱 React Native Documentation](https://reactnative.dev/)
- [💬 Expo Community](https://chat.expo.dev)



