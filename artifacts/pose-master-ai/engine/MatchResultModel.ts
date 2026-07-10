/**
 * MatchResultModel
 * ================
 * Data shapes for the result of comparing a user's live pose against a
 * reference SVG template.
 *
 * DESIGN RULES:
 * - Every score field is nullable. Null means "not computed" — never fake.
 * - No random values, no simulated percentages.
 * - Consumers must handle null before displaying any value to the user.
 *
 * CURRENT STATE: Types only. SvgMatchEngine produces these when implemented.
 */

// ─── Per-body-region scores ───────────────────────────────────────────────────

/**
 * Similarity score for a single body region (0–1).
 * null = region was not computed (e.g. landmarks missing or detector unavailable).
 */
export interface RegionScore {
  /**
   * Overall similarity for this region (0 = no match, 1 = perfect match).
   * null when the region could not be assessed.
   */
  score: number | null;
  /** Landmarks that contributed to this score. Empty when score is null. */
  landmarksUsed: string[];
  /** Landmarks that should have contributed but were absent from the frame. */
  missingLandmarks: string[];
}

// ─── Camera metrics ───────────────────────────────────────────────────────────

/**
 * Estimated camera positioning relative to the subject.
 * All fields are null when no detector is connected.
 */
export interface CameraMetrics {
  /**
   * Estimated distance from camera to subject in metres.
   * null = not computed.
   */
  estimatedDistanceMetres: number | null;
  /**
   * Camera tilt in degrees (0 = level, positive = tilted clockwise).
   * null = not computed.
   */
  tiltDegrees: number | null;
  /**
   * Camera vertical angle: 'too_high' | 'too_low' | 'level' | null.
   */
  verticalAngle: 'too_high' | 'too_low' | 'level' | null;
}

// ─── Missing body parts ───────────────────────────────────────────────────────

/**
 * A body part that the template requires but was absent from the detection.
 */
export interface MissingBodyPart {
  landmarkName: string;
  /** Why it might be missing. */
  reason: 'out_of_frame' | 'low_confidence' | 'occluded' | 'unknown';
}

// ─── Main match result ────────────────────────────────────────────────────────

/**
 * The full result of one pose-match computation.
 *
 * All score fields are null by default.
 * Set values only when you have real detected data.
 *
 * NEVER populate these with random or timer-driven values.
 */
export interface PoseMatchResult {
  /**
   * Overall pose similarity score (0–1).
   * null when no detection is available or the match could not be computed.
   */
  overallScore: number | null;

  /** Per-body-region breakdown. Each field is null until computed. */
  regions: {
    head: RegionScore | null;
    arms: RegionScore | null;
    torso: RegionScore | null;
    legs: RegionScore | null;
  };

  /** Camera position and angle relative to the subject. */
  cameraMetrics: CameraMetrics;

  /** Body parts the template requires that were not detected. */
  missingParts: MissingBodyPart[];

  /**
   * Unix timestamp (ms) when this result was computed.
   * null for the initial empty result.
   */
  computedAtMs: number | null;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Returns an empty PoseMatchResult with all fields null.
 * Use this as the initial state before any detection runs.
 */
export function emptyMatchResult(): PoseMatchResult {
  return {
    overallScore: null,
    regions: {
      head: null,
      arms: null,
      torso: null,
      legs: null,
    },
    cameraMetrics: {
      estimatedDistanceMetres: null,
      tiltDegrees: null,
      verticalAngle: null,
    },
    missingParts: [],
    computedAtMs: null,
  };
}
