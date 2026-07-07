/**
 * AI Interfaces — ML-Ready Only
 * ==============================
 * This file previously mixed demo simulation types (GuideState, OverallStatus,
 * DEMO_SCENES) with real ML integration interfaces. The demo types have been
 * removed entirely.
 *
 * The canonical pose detection interface now lives in:
 *   services/PoseDetectionService.ts
 *
 * Types kept here are supplementary ML integration contracts that sit
 * alongside PoseDetectionService without duplicating it.
 */

// ─── Re-export the canonical types from PoseDetectionService ─────────────────

export type {
  PoseLandmark,
  PoseDetectionFrame,
  DetectionStatus,
  PoseDetectionResult,
  PoseDetector,
} from '../../services/PoseDetectionService';

// ─── Supplementary future-integration interfaces ──────────────────────────────

/**
 * MediaPipe Pose Landmarker task runner.
 * Implement this to use the MediaPipe WASM or Android task library.
 */
export interface MediaPipePoseDetector {
  /** Load and warm up the model. Call once at startup. */
  initialize(modelAssetPath?: string): Promise<void>;
  /**
   * Run inference on a single video frame.
   * Returns null if detection could not run (e.g. no GPU).
   */
  detectForVideo(videoFrame: unknown, timestampMs: number): Promise<import('../../services/PoseDetectionService').PoseDetectionFrame | null>;
  /** Free GPU/WASM resources. */
  close(): void;
}

/**
 * Google ML Kit Pose Detection (Android / iOS).
 * Uses the on-device Accurate/Fast model via @react-native-ml-kit/pose-detection.
 */
export interface MLKitPoseDetector {
  /** Process a camera frame URI or ImageProxy. */
  processImage(imageUri: string): Promise<import('../../services/PoseDetectionService').PoseLandmark[]>;
  /** Release native resources. */
  close(): void;
}
