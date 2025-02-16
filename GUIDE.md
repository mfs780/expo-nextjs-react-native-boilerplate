# 📖 GUIDE: Expo + Next.js + React Native Boilerplate

This guide provides step-by-step instructions to set up, configure, and optimize the **Expo + Next.js + React Native Boilerplate**.

---

## 🚀 Installation


### Start the Development Server
#### Expo:
```bash
npm run expo:start
```
#### Next.js:
```bash
npm run next:dev
```

---

## 📂 Project Structure

- **app/**: Core application logic
  - **(native)**: Expo-specific components
  - **(next)**: Next.js-specific components
- **assets/**: Static assets
- **components/**: Reusable UI elements
- **config/**: App configurations
- **constants/**: Global constants
- **hooks/**: Custom React hooks
- **store/**: State management
- **style/**: Global styles
- **vendors/**: Third-party libraries

---

## 🛠 Available Scripts

- `npm run expo:start` → Start Expo project
- `npm run expo:android` → Run Expo on Android
- `npm run expo:ios` → Run Expo on iOS
- `npm run expo:web` → Run Expo on Web
- `npm run next:dev` → Start Next.js in development mode
- `npm run next:build` → Build Next.js for production
- `npm run next:start` → Start Next.js in production mode
- `npm run expo:reset-project` → Reset Expo project
- `npm run lint` → Run ESLint
- `npm run expo:test` → Run Jest tests

---

## 🏗 Configuration Files

- `app.json`: Expo configuration
- `babel.config.js`: Babel setup
- `metro.config.js`: Metro bundler config
- `next.config.js`: Next.js configuration
- `tailwind.config.js`: TailwindCSS setup
- `tsconfig.json`: TypeScript configuration
- `postcss.config.mjs`: PostCSS configuration

---

## 🔧 SEO Optimization

To improve SEO for your Next.js pages:
1. **Use `<Head>` from `next/head`** to set metadata.
2. **Optimize images** using `next/image`.
3. **Generate an XML sitemap** to improve search indexing.
4. **Use meaningful URLs** in `expo-router`.
5. **Enable server-side rendering (SSR)** for SEO-critical pages.

---

## 🚀 Deployment

### Expo:
```bash
expo build:android  # Build APK
expo build:ios      # Build iOS app
```

### Next.js:
```bash
npm run next:build
npm run next:start
```

---

## 📖 Learn More

- [Expo Docs](https://docs.expo.dev/)
- [Next.js Docs](https://nextjs.org/docs)
- [React Native Docs](https://reactnative.dev/)
