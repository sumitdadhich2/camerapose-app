---
name: Camera flow architecture
description: How the in-camera pose selection, bottom sheet, pose info modal, and step guide are structured.
---

## Bottom section is static absolute, NOT a draggable sheet
The pose category tabs + pose cards are in a static `View` positioned `position:'absolute', bottom:0`. There is NO `translateY` shared value, no spring animation, no pan gesture on this container. It renders once and stays fixed. Draggable sheets caused layout jitter and were removed.

**Why:** Any `useSharedValue` driven `translateY` on a large container (e.g. a bottom sheet) can jitter on Android because the JS thread and UI thread briefly disagree on position during mount. Static absolute position has no this problem.
**How to apply:** If a future "slide-up" behavior is needed for this section, use a Modal instead — never re-introduce a translated container inside the live camera layout.

## PoseCardItem is defined at module level with its own hooks
The per-card press animation uses `useSharedValue` + `useAnimatedStyle` inside `PoseCardItem`, which is defined as a `React.memo` component at the module top level (not inside the screen function). This avoids hook-ordering problems when the screen has conditional early returns.

**Why:** Hooks inside a component defined inside another component's render function can cause "rendered more hooks than previous" errors if the parent's conditional branches change.
**How to apply:** Any sub-component that needs hooks must be a top-level function or exported component, never an inline arrow function inside the render.

## Active pose is mutable local state, not just a route param
`app/camera/[id].tsx` initialises `activePoseId` from the route param but stores it in `useState`. Selecting a new pose from the bottom sheet calls `setActivePoseId(pose.id)` — no navigation required.

**Why:** The user must never need to leave the camera to switch poses (core product requirement). Keeping it as local state avoids unmounting/remounting the CameraView.
**How to apply:** Any future pose-change flow (AI suggestion, random pose button, etc.) should write to this state, not `router.push`.

## Bottom sheet uses translateY snap (not animated height)
`CameraPoseBottomSheet` has a fixed `height: EXPANDED_HEIGHT` and a `position: absolute, bottom: captureControlsHeight`. It snaps between two `translateY` positions: `0` (expanded) and `DRAG_RANGE = EXPANDED_HEIGHT - COLLAPSED_HEIGHT` (collapsed, showing only COLLAPSED_HEIGHT px above the capture controls).

**Why:** `translateY` is GPU-accelerated; animating `height` triggers layout recalculation on Android.
**How to apply:** To add a third snap point (e.g. half-expanded), add another `withSpring` target between 0 and DRAG_RANGE.

## PoseInfoSheet is a transparent Modal, not inline
The detailed pose info (with full instructions and "Start Pose Guide") is rendered as a `Modal` overlay on top of everything including the camera, so it covers the status bar and camera chrome cleanly.

**Why:** Rendering it inside the camera tree causes z-index battles with `CameraView` on some Android versions.
**How to apply:** Keep it as a Modal. Animate with React Native `Animated.Value` (not reanimated) because it's pure JS-side and doesn't need 60fps GPU animation.

## Guide state lives in useGuideStore (zustand, no persistence)
`store/useGuideStore.ts` holds `{ isActive, currentStep, steps, poseTitle }`. It is NOT persisted to AsyncStorage — the guide is always reset fresh when the user presses "Start Pose Guide".

**Why:** Persisting partially-completed guides created confusing UX (user opens app days later and sees a step counter for a pose they don't remember). Session-only is intentional.
**How to apply:** `activateGuide(steps, poseTitle)` → show FloatingGuidePanel; `deactivateGuide()` → hide it. Future AI can call `nextStep()` automatically when alignment is detected.

## CAPTURE_CONTROLS_FIXED_H = 145
The fixed height estimate for the modesRow + bottomControls capture area. Added to `insets.bottom` at render time to get the dynamic `captureControlsHeight` prop passed to `CameraPoseBottomSheet`.

**Why:** Using `onLayout` adds asynchronous complexity; 145 is accurate within ~5px for all common device profiles.
**How to apply:** If the sheet ever feels misaligned on a specific device (very tall/short capture area), this constant is the single place to adjust.
