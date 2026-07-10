/**
 * SvgMatchEngine
 * ==============
 * Compares expected SVG landmark positions (from the pose template overlay)
 * against detected body landmark positions (from PoseDetectionEngine) and
 * produces a PoseMatchResult.
 *
 * CURRENT STATE: Architecture only. Implementation is empty.
 * The engine always returns an empty match result with all scores null.
 *
 * IMPLEMENTATION GUIDE (when a real detector is connected):
 *
 * 1. Extract expected 2D positions from the active SVG outline
 *    using the landmark-to-coordinate mapping in the SVG registry.
 *
 * 2. Receive detected BodyLandmarkFrame from PoseDetectionEngine.
 *
 * 3. For each landmark pair (expected ↔ detected):
 *    - Compute Euclidean distance in normalised coordinates.
 *    - Weight by the landmark's confidence score.
 *    - Aggregate per body region (head, arms, torso, legs).
 *
 * 4. Map per-region distances to 0–1 similarity scores.
 *    Perfect overlap → 1.0, no overlap → 0.0.
 *
 * 5. Compute overall score as a weighted average of region scores.
 *
 * NEVER use random, timer-driven, or interpolated fake values here.
 */

import type { BodyLandmarkFrame } from './BodyLandmarkModel';
import { emptyMatchResult, type PoseMatchResult } from './MatchResultModel';

// ─── SVG landmark reference ───────────────────────────────────────────────────

/**
 * The expected 2D position of a single landmark in the SVG template.
 * Coordinates are normalised to the SVG viewBox (0–1).
 */
export interface SvgLandmarkPosition {
  landmarkName: string;
  /** Normalised x in the SVG viewBox (0 = left, 1 = right) */
  x: number;
  /** Normalised y in the SVG viewBox (0 = top, 1 = bottom) */
  y: number;
}

/**
 * All expected landmark positions extracted from one SVG pose template.
 */
export interface SvgPoseReference {
  /** Key into the SVG outline registry (e.g. 'standing_front') */
  outlineKey: string;
  /** Expected positions for each body landmark in this template */
  landmarks: SvgLandmarkPosition[];
}

// ─── Engine input / output ────────────────────────────────────────────────────

/**
 * Everything SvgMatchEngine needs to compute a match result.
 */
export interface SvgMatchInput {
  /** Expected positions from the active SVG template */
  reference: SvgPoseReference;
  /** Detected landmarks from the real pose detector */
  detectedFrame: BodyLandmarkFrame;
}

// ─── Engine interface ─────────────────────────────────────────────────────────

/**
 * The engine that computes pose similarity between the SVG template
 * and the user's live body position.
 *
 * Implement this interface when a real detector is available.
 * Plug in via PoseDetectionEngine.setSvgMatchEngine(yourEngine).
 */
export interface ISvgMatchEngine {
  /**
   * Compare the SVG reference positions against the detected frame.
   * Returns a PoseMatchResult — never throws; return emptyMatchResult() on error.
   */
  computeMatch(input: SvgMatchInput): PoseMatchResult;
}

// ─── Unavailable implementation ───────────────────────────────────────────────

/**
 * Default no-op implementation.
 * Returns an empty result with all scores null.
 * Contains no simulation logic.
 */
export const unavailableSvgMatchEngine: ISvgMatchEngine = {
  computeMatch(_input: SvgMatchInput): PoseMatchResult {
    // Implementation pending: real detector required.
    return emptyMatchResult();
  },
};
