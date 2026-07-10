/**
 * AutoCaptureEngine
 * =================
 * State machine that decides when to automatically trigger the camera shutter
 * once the user has held a sufficiently aligned pose for a defined duration.
 *
 * CURRENT STATE: Architecture only. The engine is always in the 'disabled'
 * state until a real detector is connected and auto-capture is enabled.
 *
 * STATE MACHINE:
 *
 *   disabled ──[enabled]──► waiting
 *   waiting  ──[aligned]──► ready
 *   ready    ──[stable]───► capturing
 *   capturing──[done]─────► captured
 *   captured ──[reset]────► waiting
 *   * ────────[disabled]──► disabled
 *
 * RULES:
 * - No fake countdown. State only advances when real detection data is present.
 * - No timers used as a proxy for detection quality.
 * - Stability must be measured across consecutive real detection frames.
 *
 * HOW TO ACTIVATE:
 * - Set enabled = true in useGuideSettingsStore.
 * - Connect a real detector via activePoseDetector.current.
 * - Call engine.update(alignmentResult, matchResult) each frame.
 * - Subscribe to engine.state to drive the UI.
 */

import type { AlignmentResult } from './AlignmentEngine';
import type { PoseMatchResult } from './MatchResultModel';

// ─── State ────────────────────────────────────────────────────────────────────

export type AutoCaptureState =
  | 'disabled'   // Auto-capture is turned off in settings, or no detector
  | 'waiting'    // Waiting for the user to achieve alignment
  | 'ready'      // Alignment achieved — confirming stability
  | 'capturing'  // Shutter is being triggered
  | 'captured';  // Photo has been taken — transitioning back to waiting

// ─── Configuration ────────────────────────────────────────────────────────────

export interface AutoCaptureConfig {
  /**
   * Minimum overall match score to advance from 'waiting' to 'ready'.
   * Range: 0–1. Real value required — never use random threshold.
   */
  minMatchScore: number;
  /**
   * Number of consecutive frames that must remain above minMatchScore
   * before the state advances to 'capturing'.
   * Must be driven by real frame data, not a timer.
   */
  requiredStableFrames: number;
}

export const DEFAULT_AUTO_CAPTURE_CONFIG: AutoCaptureConfig = {
  minMatchScore: 0.85,
  requiredStableFrames: 10, // ~10 frames at 30fps ≈ 333ms of stability
};

// ─── Engine interface ─────────────────────────────────────────────────────────

export interface IAutoCaptureEngine {
  /** Current state of the auto-capture machine. */
  readonly state: AutoCaptureState;

  /**
   * Feed the latest alignment and match results.
   * Called once per detection frame.
   * State advances only when real scores meet the threshold.
   * Returns the new state.
   */
  update(
    alignment: AlignmentResult,
    match: PoseMatchResult,
  ): AutoCaptureState;

  /** Enable auto-capture. Transitions from 'disabled' to 'waiting'. */
  enable(): void;

  /**
   * Disable auto-capture. Always transitions to 'disabled' regardless of
   * current state. Safe to call at any time.
   */
  disable(): void;

  /**
   * Acknowledge that the capture has completed.
   * Transitions from 'captured' back to 'waiting'.
   */
  reset(): void;
}

// ─── No-op implementation ─────────────────────────────────────────────────────

/**
 * Default implementation used when no real detector is connected or
 * auto-capture is disabled in settings.
 *
 * Always stays in 'disabled' state.
 * Contains no timers, no fake state transitions.
 */
export class DisabledAutoCaptureEngine implements IAutoCaptureEngine {
  readonly state: AutoCaptureState = 'disabled';

  update(_alignment: AlignmentResult, _match: PoseMatchResult): AutoCaptureState {
    // No detector — auto-capture remains disabled.
    return 'disabled';
  }

  enable(): void {
    // No-op: requires a real detector before enabling.
  }

  disable(): void {
    // Already disabled.
  }

  reset(): void {
    // Nothing to reset.
  }
}

/**
 * The default export — a singleton DisabledAutoCaptureEngine.
 * Replace with a real implementation once ML Kit / MediaPipe is connected.
 */
export const defaultAutoCaptureEngine = new DisabledAutoCaptureEngine();
