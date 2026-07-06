/**
 * Future AI Architecture — Placeholders Only
 * ============================================
 * Nothing in this file is implemented or wired into the live camera flow.
 * It exists purely to establish stable interfaces so that real pose
 * alignment / body detection / auto-capture work can be dropped in later
 * without reshaping the camera screen or overlay engine again.
 *
 * Do NOT call these from UI code yet — they are intentionally unimplemented.
 */

/** Traffic-light style alignment feedback for the future AI pipeline. */
export type AlignmentStatus = 'red' | 'yellow' | 'green';

export interface AlignmentResult {
  status: AlignmentStatus;
  message: string;
  /** 0-1 confidence score once a real model is wired in. */
  confidence: number;
}

export interface BodyKeypoint {
  name: string;
  x: number;
  y: number;
  confidence: number;
}

export interface SkeletonFrame {
  keypoints: BodyKeypoint[];
  timestamp: number;
}

/** Compares the live camera frame against the selected pose outline. */
export interface PoseAlignmentService {
  analyzeFrame(frameUri: string, targetOutlineKey: string): Promise<AlignmentResult>;
}

/** Detects whether a person/body is present in frame. */
export interface BodyDetectionService {
  detectBody(frameUri: string): Promise<{ detected: boolean; boundingBox?: { x: number; y: number; width: number; height: number } }>;
}

/** Extracts body keypoints/skeleton for pose comparison. */
export interface SkeletonDetectionService {
  detectSkeleton(frameUri: string): Promise<SkeletonFrame | null>;
}

/** Estimates subject distance from camera to suggest move closer/further. */
export interface DistanceDetectionService {
  estimateDistance(frameUri: string): Promise<{ meters: number; recommendation: 'closer' | 'further' | 'good' }>;
}

/** Automatically fires the shutter once alignment status is green and stable. */
export interface AutoCaptureService {
  shouldCapture(history: AlignmentResult[]): boolean;
}

/** Speaks short instructions to help the user line up with the outline. */
export interface VoiceGuidanceService {
  speak(instruction: string): Promise<void>;
  cancel(): void;
}
