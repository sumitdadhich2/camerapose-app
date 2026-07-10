/**
 * AlignmentEngine
 * ===============
 * Analyses detected body landmarks to determine whether the user is correctly
 * positioned and oriented relative to the active pose template.
 *
 * CURRENT STATE: Architecture only. Returns feedback: 'not_available' until a
 * real detector is connected. No fake values, no simulated percentages.
 *
 * FUTURE IMPLEMENTATION:
 * - Compare left/right landmark symmetry to detect lateral offset.
 * - Compare top/bottom positions to detect vertical misalignment.
 * - Analyse shoulder and hip rotation angles to detect body rotation.
 * - Analyse facial landmark angles to detect face rotation.
 */

import type { BodyLandmarkFrame } from './BodyLandmarkModel';

// ─── Alignment states ─────────────────────────────────────────────────────────

/**
 * The primary alignment feedback for the current frame.
 * Consumers should show only ONE feedback at a time (highest priority first).
 */
export type AlignmentFeedback =
  | 'not_available'  // No detector — cannot assess alignment
  | 'perfect'        // User is well-aligned with the template
  | 'too_left'       // Body is shifted too far left in the frame
  | 'too_right'      // Body is shifted too far right in the frame
  | 'too_high'       // Body is too high in the frame
  | 'too_low'        // Body is too low in the frame
  | 'rotate_body'    // User needs to rotate their torso
  | 'rotate_face';   // User needs to turn their face

// ─── Alignment result ─────────────────────────────────────────────────────────

export interface AlignmentResult {
  feedback: AlignmentFeedback;

  /**
   * Confidence that this alignment assessment is accurate (0–1).
   * null when feedback is 'not_available'.
   */
  confidence: number | null;

  /**
   * Short user-facing instruction derived from feedback.
   * null when feedback is 'not_available'.
   * Must NOT be displayed until a real detector is connected.
   */
  instruction: string | null;

  /**
   * Per-axis offset magnitude as a fraction of frame size (0–1).
   * null when not computed.
   * Useful for debug overlays in Developer Mode.
   */
  debugOffset: { x: number | null; y: number | null } | null;
}

// ─── Engine interface ─────────────────────────────────────────────────────────

/**
 * Assesses how well the user's detected pose aligns with the template.
 *
 * Implement this interface when a real detector is connected.
 * Plug in via PoseDetectionEngine.setAlignmentEngine(yourEngine).
 */
export interface IAlignmentEngine {
  /**
   * Analyse a landmark frame and produce alignment guidance.
   * Never throws — return { feedback: 'not_available', ... } on error.
   */
  analyse(frame: BodyLandmarkFrame): AlignmentResult;
}

// ─── User-facing instruction map ─────────────────────────────────────────────

export const ALIGNMENT_INSTRUCTIONS: Record<AlignmentFeedback, string | null> = {
  not_available: null,
  perfect:       'Perfect position',
  too_left:      'Move right',
  too_right:     'Move left',
  too_high:      'Step down slightly',
  too_low:       'Step up slightly',
  rotate_body:   'Rotate your body',
  rotate_face:   'Turn your face',
};

// ─── Unavailable implementation ───────────────────────────────────────────────

/**
 * Default no-op implementation.
 * Always returns feedback: 'not_available'.
 */
export const unavailableAlignmentEngine: IAlignmentEngine = {
  analyse(_frame: BodyLandmarkFrame): AlignmentResult {
    return {
      feedback: 'not_available',
      confidence: null,
      instruction: null,
      debugOffset: null,
    };
  },
};
