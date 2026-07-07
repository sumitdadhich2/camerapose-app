/**
 * Smart Guide Framework — AI-Ready Interfaces
 * ============================================
 * All interfaces here are designed so that real AI implementations
 * (MediaPipe, ML Kit, TensorFlow Lite) can be plugged in later
 * without changing any UI code.
 *
 * Currently, the demo implementations in `hooks/useGuideDemo.ts`
 * drive these values using cycling logic.
 */

// ─── Core guide state types ────────────────────────────────────────────────────

/** Traffic-light style overall alignment feedback. */
export type OverallStatus = 'waiting' | 'aligning' | 'almost' | 'perfect';

/** Status of a single body part in the pose alignment check. */
export type BodyPartStatus = 'waiting' | 'correct' | 'incorrect';

/** Camera distance recommendation. */
export type DistanceStatus = 'too-close' | 'perfect' | 'too-far';

/** Per-body-part alignment breakdown. */
export interface BodyAlignment {
  head: BodyPartStatus;
  leftHand: BodyPartStatus;
  rightHand: BodyPartStatus;
  body: BodyPartStatus;
  leftLeg: BodyPartStatus;
  rightLeg: BodyPartStatus;
}

/** Full guide state — produced by demo or future AI service. */
export interface GuideState {
  overallStatus: OverallStatus;
  instruction: string;
  currentStep: number;
  totalSteps: number;
  distanceStatus: DistanceStatus;
  bodyAlignment: BodyAlignment;
}

// ─── Future AI service interfaces ─────────────────────────────────────────────

/**
 * MediaPipe Pose Landmarker integration point.
 * Replace useGuideDemo with a concrete implementation here.
 */
export interface MediaPipePoseDetector {
  /** Call once at startup. */
  initialize(modelPath?: string): Promise<void>;
  /** Feed a camera frame; returns per-body-part alignment. */
  detectPose(frame: unknown): Promise<BodyAlignment>;
  /** Release GPU resources. */
  dispose(): void;
}

/**
 * ML Kit Body Detection — presence + bounding box.
 */
export interface MLKitBodyDetector {
  /** Returns true when a human body is visible in frame. */
  isBodyVisible(frame: unknown): Promise<boolean>;
  /** Estimate distance in metres. Range 0.5–4.0 m. */
  estimateDistance(frame: unknown): Promise<number>;
}

/**
 * TensorFlow Lite custom model runner.
 * Use for on-device pose scoring, custom classifiers, etc.
 */
export interface TensorFlowLiteModel {
  loadModel(assetPath: string): Promise<void>;
  run(input: Float32Array): Promise<Float32Array>;
  dispose(): void;
}

/**
 * High-level pose alignment engine — combines MediaPipe + optional TFLite
 * to produce a rich GuideState update.
 */
export interface PoseAlignmentEngine {
  analyze(
    frame: unknown,
    targetPoseKey: string,
  ): Promise<{ status: OverallStatus; body: BodyAlignment; confidence: number }>;
}

/** Estimates subject–camera distance and recommends action. */
export interface DistanceEngine {
  measure(frame: unknown): Promise<{ status: DistanceStatus; meters: number }>;
}

/**
 * Decides when conditions are stable enough to auto-capture.
 * Receives the current guide state and how long (ms) the user has
 * held a 'perfect' alignment.
 */
export interface AutoCaptureEngine {
  evaluate(guideState: GuideState, heldPerfectMs: number): boolean;
}

/**
 * Text-to-speech voice guidance.
 * Backed by Expo Speech or platform TTS in a real build.
 */
export interface VoiceGuidanceEngine {
  speak(text: string, language?: string): Promise<void>;
  stop(): void;
  isSupported(): boolean;
}

/** Skeleton keypoints for raw MediaPipe / ML Kit output. */
export interface BodyKeypoint {
  name: string;
  x: number; // normalised 0–1
  y: number; // normalised 0–1
  confidence: number; // 0–1
}

export interface SkeletonFrame {
  keypoints: BodyKeypoint[];
  timestamp: number;
}
