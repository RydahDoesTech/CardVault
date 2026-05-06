# CardVault – Agent Instructions

## Cursor Cloud specific instructions

### Overview

CardVault is a React Native (Expo SDK 52) + TypeScript app for cataloging trading cards (MVP: Pokémon). Supabase provides auth, Postgres, and file storage. See `README.md` for full project layout and setup.

### Running the dev server (web)

```bash
npx expo start --web --port 8081
```

This starts the Metro bundler with web support on port 8081. The app renders in the browser at `http://localhost:8081`. No Android/iOS emulator is needed for web testing.

### Lint and type-check

```bash
npx expo lint        # ESLint (config in .eslintrc.js)
npx tsc --noEmit     # TypeScript type-checking
```

### Environment variables

Copy `.env.example` to `.env`. For offline/CI usage without a real Supabase project, set:

```
EXPO_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key
EXPO_PUBLIC_USE_MOCK_CARD_SEARCH=true
EXPO_PUBLIC_USE_MOCK_PRICING=true
```

The app will show a "Setup" screen if the Supabase URL is not reachable, but the JS bundle still compiles and renders. With real Supabase credentials the full auth/collection/scanning flow works.

### No automated test suite

The project has no test runner or test files. Validation is lint + type-check + manual interaction with the web or mobile build.

### Gotchas

- `expo-font` is required at runtime for `@expo/vector-icons`; it was added as a dependency alongside the web-support packages (`react-dom`, `react-native-web`, `@expo/metro-runtime`).
- Running `npx expo lint` the first time auto-installs `eslint` and `eslint-config-expo` and creates `.eslintrc.js`.
- Metro hot-reload in web mode is reliable; no manual restart is needed after code changes.
- The project uses `expo-dev-client`, which means native (Android/iOS) builds require `npx expo prebuild` before `npx expo run:android` or `npx expo run:ios`. Web mode does not require prebuild.
