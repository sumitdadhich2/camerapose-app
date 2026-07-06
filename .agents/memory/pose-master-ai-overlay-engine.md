---
name: Pose Master AI overlay engine
description: How the SVG pose overlay engine is structured (outline registry, overlay store, gesture layering) and a camera-permission gotcha for web testing.
---

## Outline registry, not per-template SVG files
Pose templates reference an outline by a small string key (`svgOutline`, e.g. `"standing"`) into a shared registry (`features/overlay/svgOutlines.tsx`), rather than embedding a unique vector per template.

**Why:** the product goal is to support 10,000+ pose templates; shipping one hand-authored SVG per template isn't feasible, and most poses map to a small set of body-outline archetypes anyway.
**How to apply:** when adding new pose categories, prefer reusing/extending an existing outline key over minting a new one unless the body shape is genuinely distinct.

## Overlay transform state lives in one zustand store
`store/useOverlayStore.ts` is the single source of truth for scale/rotation/x/y/opacity/locked/visible/lastPoseId, persisted to AsyncStorage. The overlay component (`features/camera/PoseOverlayLayer.tsx`) mirrors this into Reanimated shared values for 60fps gesture updates, then commits back to the store on gesture end (not on every frame).

**Why:** avoids writing to AsyncStorage on every pixel of drag/pinch/rotate, while still keeping persistence correct.
**How to apply:** any new overlay-affecting control (new gesture, new button) should read/write through this store's actions, not local component state.

## Nested gesture detectors: camera vs. overlay
The camera screen has its own top-level `GestureDetector` (pinch-to-zoom + tap-to-focus) wrapping `CameraView`. `PoseOverlayLayer` nests its own `GestureDetector` (pan/pinch/rotate/double-tap/long-press) inside that tree for manipulating the overlay itself.

**Why:** keeps overlay manipulation logic self-contained in `PoseOverlayLayer` instead of cluttering the camera screen; React Native Gesture Handler resolves nested detectors via its normal race/simultaneous rules.
**How to apply:** this is a known trade-off, not pixel-perfect gesture exclusivity (e.g. a single tap-to-focus and overlay double-tap can both fire from one interaction). Acceptable for now; revisit with `Gesture.Exclusive`/`blocksExternalGesture` if it becomes a real UX problem.

## Camera permission blocks the web-preview overlay test
`app/camera/[id].tsx` checks `useCameraPermissions()` before branching on `Platform.OS === 'web'`. On web, if permission isn't already granted, the screen shows the "Camera Access Required" screen and never reaches the web fallback branch (which renders the overlay for browser testing).

**Why:** the permission check is intentionally platform-agnostic and comes first in the component.
**How to apply:** the automated `screenshot` tool can't click "Grant Permission" (no interactivity), so visually verifying the overlay engine via web screenshot requires either a real device/Expo Go, or temporarily granting permission in a manual browser session. Don't treat the permission screen as a bug when screenshotting `/camera/:id`.
