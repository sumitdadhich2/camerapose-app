/**
 * BodyLandmarkModel
 * =================
 * Standard body landmark definitions compatible with MediaPipe Pose Landmarker,
 * Google ML Kit Pose Detection, and TensorFlow Lite MoveNet / BlazePose.
 *
 * Index numbers follow the MediaPipe 33-point convention where applicable.
 * The 17-point subset listed here covers the core body; face, hand, and finger
 * landmarks are reserved for future expansion.
 *
 * CURRENT STATE: Type definitions only. No detection is implemented.
 */

// ─── Landmark names ───────────────────────────────────────────────────────────

/**
 * The 17 standard body landmarks supported in the current pose model.
 * Use these as keys when accessing a BodyLandmarkSet.
 */
export type BodyLandmarkName =
  // Head & neck
  | 'head'
  | 'neck'
  // Upper body
  | 'left_shoulder'
  | 'right_shoulder'
  | 'left_elbow'
  | 'right_elbow'
  | 'left_wrist'
  | 'right_wrist'
  | 'chest'
  // Lower body
  | 'hip_center'
  | 'left_hip'
  | 'right_hip'
  | 'left_knee'
  | 'right_knee'
  | 'left_ankle'
  | 'right_ankle';

/**
 * Future landmark names — not yet wired into the detection pipeline.
 * Reserved for MediaPipe Face Mesh, Hand Landmarker, and finger tracking.
 */
export type FutureLandmarkName =
  | 'face'
  | 'left_hand'
  | 'right_hand'
  | 'left_index_finger'
  | 'right_index_finger'
  | 'left_thumb'
  | 'right_thumb'
  | 'left_pinky'
  | 'right_pinky';

export const ALL_BODY_LANDMARK_NAMES: readonly BodyLandmarkName[] = [
  'head', 'neck',
  'left_shoulder', 'right_shoulder',
  'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist',
  'chest',
  'hip_center',
  'left_hip', 'right_hip',
  'left_knee', 'right_knee',
  'left_ankle', 'right_ankle',
] as const;

// ─── Landmark data ────────────────────────────────────────────────────────────

/**
 * A single detected body landmark.
 *
 * Coordinate system: normalised to the camera frame.
 *   x: 0 = left edge,  1 = right edge
 *   y: 0 = top edge,   1 = bottom edge
 *   z: depth relative to hip — negative = in front of camera plane
 *      (only available with models that output 3D landmarks, e.g. BlazePose)
 */
export interface BodyLandmark {
  name: BodyLandmarkName;
  /** Normalised horizontal position (0–1) */
  x: number;
  /** Normalised vertical position (0–1) */
  y: number;
  /**
   * Normalised depth (optional — only available with 3D-capable detectors).
   * Omit or set to null when the detector is 2D-only.
   */
  z: number | null;
  /**
   * Model confidence that this landmark is visible and accurate (0–1).
   * Values below ~0.5 are typically unreliable — treat the landmark as missing.
   */
  confidence: number;
  /**
   * Whether the landmark is within the camera frame.
   * A landmark can be detected but partially off-screen.
   */
  inFrame: boolean;
}

/**
 * A complete set of body landmarks for one person in one camera frame.
 * Any landmark not detected by the model is absent from this record.
 *
 * NEVER fabricate missing landmarks — treat absent keys as undetected.
 */
export type BodyLandmarkSet = Partial<Record<BodyLandmarkName, BodyLandmark>>;

/**
 * A body landmark frame pairs the landmark set with capture metadata.
 */
export interface BodyLandmarkFrame {
  landmarks: BodyLandmarkSet;
  /** Unix timestamp (ms) when this frame was captured */
  capturedAtMs: number;
  /** Overall skeleton detection confidence (0–1) */
  skeletonConfidence: number;
  /**
   * How many of the 17 core landmarks were detected above the 0.5 threshold.
   * A value of 0 means no body was found.
   */
  detectedCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if a landmark is present and has confidence ≥ the given
 * threshold (default 0.5). Use this before accessing landmark coordinates.
 */
export function isLandmarkReliable(
  landmark: BodyLandmark | undefined,
  minConfidence = 0.5,
): landmark is BodyLandmark {
  return (
    landmark !== undefined &&
    landmark.confidence >= minConfidence &&
    landmark.inFrame
  );
}

/**
 * Counts how many landmarks in the set meet the confidence threshold.
 */
export function countReliableLandmarks(
  set: BodyLandmarkSet,
  minConfidence = 0.5,
): number {
  return Object.values(set).filter(
    (lm) => lm && isLandmarkReliable(lm, minConfidence),
  ).length;
}
