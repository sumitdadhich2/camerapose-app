# Pose Master AI

A mobile smart-camera-assistant app that helps users take professional photos by fitting themselves inside transparent pose outline templates (not a photo editor, not an AI image generator).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

Offline-first mobile app (Expo) with: onboarding, guest/Google login (login is a placeholder — no real Firebase/Google SDK wired up yet), Home/Categories/Gallery/Favorites/Profile tabs, category → pose template browsing, camera/subscription/settings screens. Camera capture, pose detection, distance detection, voice guidance, billing, and ads are intentionally unimplemented placeholder services in `features/*` — ready to be wired up later.

## User preferences

- **Offline-only**: Do not configure or require the Express API server, PostgreSQL, or DATABASE_URL. The app must work fully offline.
- **Local data only**: All pose templates are stored locally in the app bundle. Photos are saved to the user's device only (expo-media-library).
- **MMKV for persistence**: Use react-native-mmkv (not AsyncStorage) for settings and favorites. This requires a native/dev build, not Expo Go.
- **Ignore the backend**: Do not wire up the api-server or db packages to the mobile app. Backend is out of scope.

## Gotchas

- Workflow name for the Expo artifact is `artifacts/pose-master-ai: expo` (not the slug) — use `listWorkflows()` to confirm exact names before restarting.
- User explicitly wants MMKV (react-native-mmkv) for settings/favorites — note this requires a native build (not Expo Go compatible; use a dev build or EAS build).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
