# Hornacis

Expo Router app with Clerk authentication and Convex backend integration.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template if you need it:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in these Expo app variables in `.env.local`:

   ```bash
   EXPO_PUBLIC_CONVEX_URL=https://your-dev-deployment.convex.cloud
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

4. In the Clerk dashboard:
   Enable `Native API` under `Native applications`.

5. In the Clerk dashboard:
   Copy your Clerk `Frontend API URL`, then set it as `CLERK_JWT_ISSUER_DOMAIN` in the Convex dashboard for the active deployment.

6. Start Convex in one terminal:

   ```bash
   npm run convex:dev
   ```

7. Start Expo in another terminal:

   ```bash
   npm start
   ```

Then open the app with:

- `i` for iOS simulator
- `a` for Android emulator
- `w` for web
- Expo Go on a device for the current email/password flow

## Useful scripts

```bash
npm start
npm run start:clear
npm run android
npm run ios
npm run web
npm run typecheck
npm run lint
npm run verify
npm run convex:dev
npm run convex:codegen
```

## Project structure

Expo Router still requires route files under `app/`, so this repo uses thin route files there and keeps feature logic elsewhere:

```text
app/                 # Expo Router entrypoints only
features/
  auth/
  home/
config/              # validated environment access
lib/                 # shared clients, routes, helpers
navigation/          # root stack and navigation setup
providers/           # app-wide providers
convex/              # backend functions and auth config
components/          # shared UI primitives
```

## Production notes

- Use separate Clerk development and production instances.
- Use `pk_test_...` locally and `pk_live_...` in production.
- Set `CLERK_JWT_ISSUER_DOMAIN` separately for Convex dev and prod deployments.
- Store production environment variables in your CI/CD or EAS secrets, not in repo files.
- Run `npm run verify` in CI before shipping.
- Consider adding `expo-updates` for OTA updates when you move toward release builds.
