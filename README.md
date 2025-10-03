# FocusPlan

FocusPlan is an Expo-managed (React Native) application that lets you capture upcoming tasks, choose the exact time you plan to work on them, and keep Google Calendar in sync with a single tap. The project ships with persistent local storage, Google OAuth, and Calendar API helpers so you can get productive quickly on Android, iOS, and the web.

## Features

- Add lightweight tasks with notes and editable start/end times
- Persist your plan locally so tasks survive reloads
- Connect your Google account with OAuth 2.0 and the Calendar API scope
- Create calendar events for individual tasks (automatic when already signed in)
- Works on Android, iOS and as a responsive web app via Expo

## Project structure

```
.
├─ App.tsx                    # Application shell wiring providers and UI building blocks
├─ app.config.ts              # Expo configuration + Google client IDs pulled from environment
├─ src/
│  ├─ components/             # Reusable UI pieces (task form, list, buttons, auth card)
│  ├─ context/                # React context providers for tasks and Google auth state
│  ├─ hooks/                  # useGoogleAuth hook wrapping expo-auth-session
│  ├─ services/               # Google Calendar API integration helpers
│  ├─ storage/                # AsyncStorage + SecureStore persistence utilities
│  └─ types/                  # Shared TypeScript contracts
└─ package.json               # Dependencies and scripts
```

## Prerequisites

- Node.js 18 or newer (LTS recommended)
- npm 9+ (bundled with Node) or yarn/pnpm if you prefer alternative package managers
- Expo CLI (`npm install --global expo-cli`) for convenient local development
- An Android/iOS simulator or the Expo Go app on a physical device

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root with your Google credentials (see next section for how to obtain them):
   ```bash
   GOOGLE_WEB_CLIENT_ID=your_web_oauth_client_id
   GOOGLE_ANDROID_CLIENT_ID=your_android_oauth_client_id
   GOOGLE_IOS_CLIENT_ID=your_ios_oauth_client_id
   GOOGLE_EXPO_CLIENT_ID=your_expo_client_id    # optional but convenient during development
   GOOGLE_REDIRECT_URI=https://your-site.com     # optional override if Google needs an explicit redirect
   GOOGLE_API_KEY=your_google_api_key           # optional for future enhancements
   OPENAI_API_KEY=your_openai_api_key           # required for the GPT scheduling assistant
   OPENAI_MODEL=gpt-4o-mini                     # optional override for the assistant model
  ```
3. Launch the app with Expo:
   ```bash
   npm run start
   ```
4. Use the on-screen QR code in Expo DevTools or `npm run android` / `npm run ios` / `npm run web` to target a specific platform.

## Configuring Google OAuth and Calendar API

1. Visit the [Google Cloud Console](https://console.cloud.google.com/) and create (or select) a project.
2. Enable the **Google Calendar API** under *APIs & Services → Library*.
3. Configure an OAuth consent screen (External or Internal) and publish it in testing mode or production depending on your needs.
4. Create OAuth 2.0 client IDs:
   - **Web client**: required for Expo web. Add the Expo Auth Session redirect URI `https://auth.expo.io/@your-expo-username/focusplan` (replace with your actual username/slug) under *Authorized redirect URIs*.
     - If you deploy the web app (e.g., Vercel), also add that origin as a redirect (for example `https://focusplan.vercel.app/`). Use the same value in `GOOGLE_REDIRECT_URI` so the client and app stay in sync.
   - **Android client**: use your app package `com.focusplan.app`. Download the SHA-1 from the Expo credentials page or generate one in your native build pipeline.
   - **iOS client**: use the bundle identifier `com.focusplan.app`.
   - **Expo client (optional but useful)**: create a second web client specifically for development with Expo Go and use the redirect `https://auth.expo.io/@your-expo-username/focusplan`.
5. Paste the resulting client IDs into the `.env` file as shown earlier. Expo will inject them into `Constants.expoConfig.extra` at runtime.
6. When prompted on device, authenticate with your Google account, approve the `https://www.googleapis.com/auth/calendar.events` scope, and FocusPlan will take care of creating calendar events for your tasks.

## Smart scheduling assistant

- Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in your environment before starting the app. The key is read on the device, so prefer a throwaway/development key when sharing builds.
- Launch the "Smart scheduling assistant" card beneath the task form to chat with GPT about your current plan. The assistant sees a summary of your existing tasks and can suggest new focus blocks or reschedule items.
- After adjusting the plan based on the assistant’s advice, edit task times inline and tap **Sync** to push the updated schedule to Google Calendar.

## How syncing works

- Tasks are stored in AsyncStorage (`src/storage/taskStorage.ts`), so they are available offline.
- Google access tokens are persisted with SecureStore (`src/storage/tokenStorage.ts`). Tokens are refreshed on demand by re-running the OAuth flow when they expire.
- When you add a task while signed in, FocusPlan creates a Google Calendar event immediately. Otherwise you can tap **Sync** later from the task list.
- Calendar events honor the start and end times you set on each task (defaulting to one hour when the end time is omitted).

## Verification checklist

- `npm run lint` checks source quality using ESLint and TypeScript.
- `npm run start` boots Expo’s bundler. Watch the terminal for runtime errors.
- To reset emulator/device state during testing, clear AsyncStorage via device settings or reinstall the Expo Go app.

## Next steps / ideas

1. Extend task metadata (duration, reminders, tags) and push richer details to calendar events.
2. Show upcoming events pulled back from Google Calendar to prevent overlaps.
3. Add background sync or scheduled reminders using Expo Notifications.
4. Persist tasks remotely (e.g., Supabase, Firebase, or your own backend) for multi-device continuity.

FocusPlan is ready for you to iterate—clone it, add your credentials, and start planning smarter sessions that stay aligned with your Google Calendar.
