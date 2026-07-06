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

- pnpm workspaces, Node.js 24, TypeScript 5.9
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

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Workflow name for the Expo artifact is `artifacts/pose-master-ai: expo` (not the slug) — use `listWorkflows()` to confirm exact names before restarting.
- Uses AsyncStorage (not react-native-mmkv) for local persistence — MMKV requires a native build and isn't Expo Go compatible.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
