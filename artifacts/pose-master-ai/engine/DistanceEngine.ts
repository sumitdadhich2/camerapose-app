/**
 * DistanceEngine
 * ==============
 * Estimates the distance between the camera and the subject, and provides
 * framing guidance to help the user position themselves correctly for the
 * selected pose template.
 *
 * CURRENT STATE: Architecture only. Returns 'not_available' until a real
 * detector is connected. No simulation, no fake distances.
 *
 * FUTURE RESPONSIBILITY:
 * - Estimate subject distance using bounding box size or stereo depth.
 * - Compare against the pose template's recommendedDistance field.
 * - Output actionable framing guidance.
 *
 * HOW TO IMPLEMENT:
 * 1. Use BodyLandmarkFrame shoulder/hip width to estimate real-world distance.
 * 2. Compare with template.recommendedDistance range.
 * 3. Output the appropriate DistanceFeedback.
 */

import type { BodyLandmarkFrame } from './BodyLandmarkModel';

// ─── Distance feedback states ─────────────────────────────────────────────────

export type DistanceFeedback =
  | 'not_available'  // No detector connected — cannot estimate distance
  | 'too_close'      // Move further back
  | 'too_far'        // Move closer
  | 'camera_too_high'  // Camera is above the ideal framing height
  | 'camera_too_low'   // Camera is below the ideal framing height
  | 'camera_tilted'    // Camera is not level
  | 'portrait_ok'   // Framing is good for portrait orientation
  | 'landscape_ok'; // Framing is good for landscape orientation

export interface DistanceResult {
  feedback: DistanceFeedback;
  /**
   * Estimated distance in metres.
   * null when feedback is 'not_available'.
   */
  estimatedMetres: number | null;
  /**
   * Short user-facing instruction derived from feedback.
   * null when feedback is 'not_available'.
   * Must NOT be shown in the UI until a real detector is connected.
   */
  instruction: string | null;
}

// ─── Recommended distance range ───────────────────────────────────────────────

/**
 * The distance range (in metres) the pose template recommends.
 * Parsed from PoseTemplate.recommendedDistance at runtime.
 */
export interface RecommendedDistanceRange {
  minMetres: number;
  maxMetres: number;
}

// ─── Engine interface ─────────────────────────────────────────────────────────

/**
 * Estimates camera-to-subject distance from a detected landmark frame.
 *
 * Implement this interface when a real detector is connected.
 * Plug in via PoseDetectionEngine.setDistanceEngine(yourEngine).
 */
export interface IDistanceEngine {
  /**
   * Analyse a landmark frame and produce distance guidance.
   * Never throws — return { feedback: 'not_available', ... } on error.
   */
  estimate(
    frame: BodyLandmarkFrame,
    recommended?: RecommendedDistanceRange,
  ): DistanceResult;
}

// ─── User-facing instruction map ─────────────────────────────────────────────

export const DISTANCE_INSTRUCTIONS: Record<DistanceFeedback, string | null> = {
  not_available: null,
  too_close:       'Move back a little',
  too_far:         'Come closer',
  camera_too_high: 'Lower the camera',
  camera_too_low:  'Raise the camera',
  camera_tilted:   'Level the camera',
  portrait_ok:     'Framing looks good',
  landscape_ok:    'Framing looks good',
};

// ─── Unavailable implementation ───────────────────────────────────────────────

/**
 * Default no-op implementation.
 * Always returns feedback: 'not_available'.
 * Contains no estimation logic.
 */
export const unavailableDistanceEngine: IDistanceEngine = {
  estimate(_frame: BodyLandmarkFrame, _recommended?: RecommendedDistanceRange): DistanceResult {
    return {
      feedback: 'not_available',
      estimatedMetres: null,
      instruction: null,
    };
  },
};
